import { useEffect, useRef, useState } from 'react';

interface UseWebSocketOptions {
    url: string;
    onMessage?: (event: MessageEvent) => void;
    reconnectInterval?: number; // в мс
}

export const useWebSocketWithReconnect = ({
    url,
    onMessage,
    reconnectInterval = 3000,
}: UseWebSocketOptions) => {
    const socketRef = useRef<WebSocket | null>(null);
    const [connected, setConnected] = useState(false);

    const connect = () => {
        const socket = new WebSocket(url);

        socket.onopen = () => {
            setConnected(true);
            console.log('[WebSocket] Connected');
        };

        socket.onmessage = event => {
            onMessage?.(event);
        };

        socket.onclose = () => {
            setConnected(false);
            console.warn('[WebSocket] Disconnected. Reconnecting...');
            setTimeout(connect, reconnectInterval);
        };

        socket.onerror = err => {
            console.error('[WebSocket] Error', err);
            socket.close(); // инициирует reconnect
        };

        socketRef.current = socket;
    };

    useEffect(() => {
        connect();
        return () => {
            socketRef.current?.close();
        };
    }, [url]);

    const sendMessage = (data: any) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(data));
        } else {
            console.warn('[WebSocket] Cannot send, socket not open');
        }
    };

    return { sendMessage, connected };
};
