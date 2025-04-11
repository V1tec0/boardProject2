import React, { useState } from 'react';
import { Typography, Button, Radio, Space, Switch, Flex, Divider } from 'antd';


const { Title } = Typography;

const getCookie = (name: string): string | null => {
    const cookies = document.cookie
        .split(';')
        .map(cookie => cookie.trim().split('='));

    const targetCookie = cookies.find(([cookieName]) => cookieName === name);

    return targetCookie
        ? decodeURIComponent(targetCookie[1]) // Декодируем значение
        : null;
};

const Settings: React.FC = () => {
    const [user] = useState(() => JSON.parse(localStorage.getItem('user')!))
    const [position, setPosition] = useState(localStorage.getItem('dockPosition') || 'bottom');

    const sendReloadCommand = async () => {
        try {
            const csrfresponse = await fetch('http://localhost:8000/api/csrf/', {
                credentials: 'include',
            });
            console.log(csrfresponse)
            const xcsrfToken = csrfresponse.headers.get('X-CSRFToken');
            console.log(xcsrfToken)

            const sessionid = getCookie('sessionid')
            const csrfToken = getCookie('csrftoken')

            const response = await fetch(`http://localhost:8000/api/messages/reload/`, {
                method: 'GET',
                headers: {
                    'X-CSRFToken': xcsrfToken,
                    'Cookie': `csrftoken=${csrfToken}; sessionid=${sessionid}`
                },
                credentials: 'include'
            });

            console.log(response)

            const data = await response.json();
            console.log('Ответ сервера:', data);

        } catch (error) {
            console.error('Ошибка при отправке команды перезагрузки:', error);
        }
    };

    const handlePositionChange = (e: any) => {
        const newPosition = e.target.value;
        setPosition(newPosition);
        localStorage.setItem('dockPosition', newPosition);
        window.location.reload(); // или обновление через state management
    };

    return (
        <div>
            <Title level={1}>Настройки</Title>

            <Space>
                <Space className='client-settings' direction="vertical">
                    <Title level={3}>Позиция меню</Title>
                    <Radio.Group onChange={handlePositionChange} value={position}>
                        <Space direction="vertical">
                            <Radio value="bottom">Снизу</Radio>
                            <Radio value="top">Сверху</Radio>
                            <Radio value="left">Слева</Radio>
                            <Radio value="right">Справа</Radio>
                        </Space>
                    </Radio.Group>
                    <Divider></Divider>
                    <Title level={3}>Перезагрузка всех клиентов</Title>
                    <p>Если возникла проблема с обновлением данных, просто нажмите на данную кнопку, и все активные клиенты перезапустятся</p>
                    <Button type="primary" onClick={sendReloadCommand}>
                        Перезагрузка клиентов
                    </Button>
                </Space>

                <Divider type='vertical' style={{height: '400px'}} />

                <Space className='user-settings' direction="vertical">
                    <Title level={3}>Данные пользователя</Title>
                    <p>Имя: {user.firstname}</p>
                    <p>Фамилия: {user.lastname}</p>
                    <p>email: {user.email}</p>
                    <Space>
                        <Button>Изменить данные</Button>
                        <Button type='primary'>Изменить пароль</Button>
                    </Space>
                </Space>
            </Space>

        </div >
    );
};

export default Settings;
