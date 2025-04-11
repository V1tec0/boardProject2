import { createContext, useState, useContext, useEffect, ReactNode } from 'react';

const ServerStatusContext = createContext({ isServerAlive: true });

export const useServerStatus = () => useContext(ServerStatusContext);

export const ServerStatusProvider = ({ children }: { children: ReactNode }) => {
    const [isServerAlive, setIsServerAlive] = useState(true);

    useEffect(() => {
        const pingInterval = setInterval(() => {
            fetch('http://localhost:8000/ping/')
                .then((res) => {
                    if (!res.ok) throw new Error();
                    return res.json();
                })
                .then(() => {
                    setIsServerAlive(true);
                })
                .catch(() => {
                    setIsServerAlive(false);
                });
        }, 30000);

        return () => clearInterval(pingInterval);
    }, []);

    return (
        <ServerStatusContext.Provider value={{ isServerAlive }}>
            {children}
        </ServerStatusContext.Provider>
    );
};
