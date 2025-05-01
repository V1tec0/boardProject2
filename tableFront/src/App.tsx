import MainCarouselLayout from './components/MainCarousel';
import Overlay from './components/Overlay';
import './App.css'
import { useEffect, useState } from 'react';
import { Button, message } from 'antd';
import ClientRegistration from './components/ClientRegistration';
import { IData } from './types';
import horizontal from './assets/horizontal.png';
import vertical from './assets/vertical.png'
import { ServerStatusProvider } from './ServerStatusContext';
import { useOrientation } from './hooks/useOrientation';

function App() {
    const [isRegistered, setIsRegistered] = useState(false)
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const [connected, setConnected] = useState('')
    const isPortrait = useOrientation();

    console.log(import.meta.env.VITE_BASE_URL_EXTRA, ' - EXTRA');

    useEffect(() => {
        const backgroundImage = isPortrait ? vertical : horizontal;
        document.body.style.backgroundImage = `url(${backgroundImage})`;
    }, [isPortrait]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log(token);

        fetch(`${import.meta.env.VITE_API_URL}client/?token=${token}`, {
            method: 'GET'
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                setIsRegistered(true);
            })
            .catch(() => {
                message.error('Ошибка получения данных');
            });
    }, []);

    useEffect(() => {
        const abortController = new AbortController();
        // eslint-disable-next-line prefer-const
        let pingInterval: ReturnType<typeof setInterval>;

        const pingApi = () => {
            fetch(`${import.meta.env.VITE_BASE_URL}ping/`, { signal: abortController.signal })
                .then(res => {
                    if (!res.ok) throw new Error('Сервер не отвечает');
                    return res.json();
                })
                .then(data => {
                    setConnected(data.detail);
                    message.success('Клиент подключен к серверу');
                })
                .catch(() => {
                    message.error('Ошибка подключения к серверу. Все запросы будут остановлены');
                    abortController.abort(); // отмена всех текущих запросов
                    clearInterval(pingInterval); // останавливаем пинг
                });
        };

        pingApi(); // начальный запуск
        pingInterval = setInterval(pingApi, 30000); // повторяем каждые 30 секунд

        return () => {
            abortController.abort();
            clearInterval(pingInterval);
        };
    }, []);

    console.log(connected)

    const handleRegister = () => {
        setShowRegistrationModal(true);
    };

    const handleRegistrationSuccess = (data: IData) => {
        // Здесь можно сохранить полученные данные (например, токен) в localStorage
        localStorage.setItem('token', data.token);
        setShowRegistrationModal(false);
        setIsRegistered(true);
    };

    return (
        <ServerStatusProvider>
            <Overlay />
            <MainCarouselLayout />
            {!isRegistered && (
                <Button type="primary" onClick={handleRegister} style={{ margin: '20px' }}>
                    Зарегистрировать клиента
                </Button>
            )}
            <ClientRegistration
                visible={showRegistrationModal}
                onCancel={() => setShowRegistrationModal(false)}
                onSuccess={handleRegistrationSuccess}
            />
        </ServerStatusProvider>
    );
}

export default App;
