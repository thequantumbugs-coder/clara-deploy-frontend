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

  const connect = useCallback(() => {
    try {
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        console.log('Connected to CLARA WebSocket');
      };

      socket.onmessage = (event) => {
        try {
          const data: WSMessage = JSON.parse(event.data);
          if (typeof data.state === 'number') {
            setState(data.state);
            setPayload(data.payload || null);
          }
        } catch (err) {
          console.error('Failed to parse WS message:', err);
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        console.log('CLARA WebSocket disconnected. Retrying...');
        setTimeout(connect, 3000);
      };

      socket.onerror = (err) => {
        console.error('WebSocket error:', err);
        socket.close();
      };
    } catch (err) {
      console.error('Connection error:', err);
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

  // Manual state override for debug mode
  const setManualState = useCallback((newState: number, newPayload?: any) => {
    setState(newState);
    if (newPayload !== undefined) setPayload(newPayload);
  }, []);

  return { state, payload, isConnected, sendMessage, setManualState };
}
