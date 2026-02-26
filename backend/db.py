"""PostgreSQL connection and pooling for RAG (pgvector). Used by rag.py and ingest script."""

import logging
from typing import Any, List, Optional

from config import (
    POSTGRES_DB,
    POSTGRES_HOST,
    POSTGRES_PASSWORD,
    POSTGRES_PORT,
    POSTGRES_USER,
)

logger = logging.getLogger(__name__)

_pool: Optional["psycopg2.pool.SimpleConnectionPool"] = None


def _get_pool():
    """Create or return the connection pool. Thread-safe for first-call init."""
    global _pool
    if _pool is None:
        import psycopg2.pool as pg2pool
        from pgvector.psycopg2 import register_vector

        try:
            # Min 1, max 5 connections; pool used by sync code in rag and ingest
            _pool = pg2pool.SimpleConnectionPool(
                minconn=1,
                maxconn=5,
                host=POSTGRES_HOST,
                port=POSTGRES_PORT,
                dbname=POSTGRES_DB,
                user=POSTGRES_USER,
                password=POSTGRES_PASSWORD or None,
            )
            # Verify connection and register pgvector on one connection
            conn = _pool.getconn()
            try:
                register_vector(conn)
            finally:
                _pool.putconn(conn)
        except Exception as e:
            logger.warning("PostgreSQL pool init failed: %s", e)
            raise
    return _pool


def get_connection():
    """Get a connection from the pool. Caller must putconn when done, or use run_query."""
    try:
        pool = _get_pool()
        conn = pool.getconn()
        from pgvector.psycopg2 import register_vector
        register_vector(conn)
        return conn
    except Exception as e:
        logger.debug("DB get_connection failed: %s", e)
        raise


def put_connection(conn: Any) -> None:
    """Return a connection to the pool."""
    if _pool is not None and conn is not None:
        try:
            _pool.putconn(conn)
        except Exception:
            pass


def run_query(
    query: str,
    params: Optional[tuple] = None,
    fetch: bool = True,
) -> Optional[List[tuple]]:
    """
    Run a parameterized query. Uses pool; returns list of rows or None on error.
    Does not log query text or params (security).
    """
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(query, params)
        if fetch:
            rows = cur.fetchall()
        else:
            conn.commit()
            rows = None
        cur.close()
        return rows
    except Exception as e:
        if conn:
            try:
                conn.rollback()
            except Exception:
                pass
        logger.warning("DB query failed: %s", e)
        return None
    finally:
        if conn:
            put_connection(conn)


def get_document_count() -> int:
    """Return count of rows in college_knowledge. Returns 0 on any error."""
    rows = run_query("SELECT COUNT(*) FROM college_knowledge", fetch=True)
    if not rows:
        return 0
    try:
        return int(rows[0][0])
    except (IndexError, TypeError, ValueError):
        return 0


def get_similar_contents(embedding: List[float], top_k: int) -> List[str]:
    """
    Return top_k content strings from college_knowledge by cosine similarity.
    Returns empty list on any error. Does not log embedding or content.
    """
    if not embedding or top_k <= 0:
        return []
    conn = None
    try:
        from pgvector.psycopg2 import register_vector
        from pgvector import Vector

        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT content FROM college_knowledge ORDER BY embedding <-> %s LIMIT %s",
            (Vector(embedding), top_k),
        )
        rows = cur.fetchall()
        cur.close()
        return [r[0] for r in rows if r[0] is not None]
    except Exception as e:
        if conn:
            try:
                conn.rollback()
            except Exception:
                pass
        logger.warning("DB vector search failed: %s", e)
        return []
    finally:
        if conn:
            put_connection(conn)


def truncate_college_knowledge() -> bool:
    """Truncate college_knowledge table. Returns True on success."""
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("TRUNCATE college_knowledge")
        conn.commit()
        cur.close()
        return True
    except Exception as e:
        if conn:
            try:
                conn.rollback()
            except Exception:
                pass
        logger.warning("DB truncate failed: %s", e)
        return False
    finally:
        if conn:
            put_connection(conn)


def insert_college_chunk(doc_id: str, content: str, embedding: List[float]) -> bool:
    """Insert one row into college_knowledge. Returns True on success, False on error."""
    conn = None
    try:
        from pgvector.psycopg2 import register_vector
        from pgvector import Vector

        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO college_knowledge (id, content, embedding, metadata) VALUES (%s, %s, %s, %s)",
            (doc_id, content, Vector(embedding), None),
        )
        conn.commit()
        cur.close()
        return True
    except Exception as e:
        if conn:
            try:
                conn.rollback()
            except Exception:
                pass
        logger.warning("Insert failed: %s", e)
        return False
    finally:
        if conn:
            put_connection(conn)
