import { useState, useEffect, useCallback, useRef } from 'react';

export interface WSMessage {
  state: number;
  payload?: any;
}

export function useWebSocket(url: string) {
  const [state, setState] = useState<number>(0);
  const [payload, setPayload] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const stateRef = useRef<number>(0);

  const connect = useCallback(() => {
    try {
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        if (import.meta.env?.DEV) console.debug('CLARA WebSocket connected');
      };

      socket.onmessage = (event) => {
        try {
          const data: WSMessage = JSON.parse(event.data);
          if (typeof data.state !== 'number') return;
          const next = data.state;
          const current = stateRef.current;
          // Don't go back to sleep (0) once user has progressed
          if (next === 0 && current > 0) return;
          // Don't go back to menu (4) when we're already on chat (5) — e.g. stale/old backend response after language_selected
          if (next === 4 && current === 5) return;
          stateRef.current = next;
          setState(next);
          setPayload(data.payload ?? null);
        } catch (err) {
          console.error('Failed to parse WS message:', err);
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        socketRef.current = null;
        if (import.meta.env?.DEV) console.debug('CLARA WebSocket disconnected. Retrying in 3s…');
        setTimeout(connect, 3000);
      };

      socket.onerror = () => {
        if (socketRef.current) socketRef.current.close();
      };
    } catch (err) {
      if (import.meta.env?.DEV) console.debug('WebSocket connection error, retrying…', err);
      setTimeout(connect, 3000);
    }
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      socketRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback((msg: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msg));
    }
  }, []);

  // Manual state override (and user-driven transitions); keep ref in sync so reconnect won't reset
  const setManualState = useCallback((newState: number, newPayload?: any) => {
    stateRef.current = newState;
    setState(newState);
    if (newPayload !== undefined) setPayload(newPayload);
  }, []);

  return { state, payload, isConnected, sendMessage, setManualState };
}
