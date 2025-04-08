import MainCarouselLayout from './components/MainCarousel';
import Overlay from './components/Overlay';
import './App.css'
import { useEffect, useState } from 'react';
import { Button, message } from 'antd';
import ClientRegistration from './components/ClientRegistration';
import { IData } from './types';

function App() {
    const [isRegistered, setIsRegistered] = useState(false)
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log(token);

        fetch(`http://localhost:8000/api/client/?token=${token}`, {
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
        <>
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
        </>
    );
}

export default App;
