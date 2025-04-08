import React from 'react';
import { Typography } from 'antd';
import useSWR from 'swr';
import Message from './Message';
import './Messages.css'
import AddMessageModal from './AddMessageForm';

const { Title } = Typography;
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Messages: React.FC = () => {
    const { data: messagesData, error, mutate  } = useSWR(
        'http://localhost:8000/api/messages/',
        fetcher,
        { refreshInterval: 5000 }
    );

    const getCookie = (name: string): string | null => {
        const cookies = document.cookie
            .split(';')
            .map(cookie => cookie.trim().split('='));

        const targetCookie = cookies.find(([cookieName]) => cookieName === name);

        return targetCookie
            ? decodeURIComponent(targetCookie[1]) // Декодируем значение
            : null;
    };

    const onClickMessage = async (id: number) => {
        const csrfresponse = await fetch('http://localhost:8000/api/csrf/', {
            credentials: 'include',
        });
        console.log(csrfresponse)
        const xcsrfToken = csrfresponse.headers.get('X-CSRFToken');
        console.log(xcsrfToken)

        const sessionid = getCookie('sessionid')
        const csrfToken = getCookie('csrftoken')

        fetch(`http://localhost:8000/api/messages/${id}/`, { 
            method: 'GET',
            headers: {
                'X-CSRFToken': xcsrfToken || undefined,
                'Cookie': `csrftoken=${csrfToken}; sessionid=${sessionid}`
            },
            credentials: 'include', 
        })
            .then(response => {
                if (!response.ok) throw new Error('Request failed');
                return response.json();
            })
            .catch(error => console.error('Ошибка:', error));
    };

    const onDelete = async (id: number) => {
        const csrfresponse = await fetch('http://localhost:8000/api/csrf/', {
            credentials: 'include',
        });
        console.log(csrfresponse)
        const xcsrfToken = csrfresponse.headers.get('X-CSRFToken');
        console.log(xcsrfToken)

        const sessionid = getCookie('sessionid')
        const csrfToken = getCookie('csrftoken')
        
        fetch(`http://localhost:8000/api/messages/${id}/`, { 
            method: 'DELETE',
            headers: {
                'X-CSRFToken': xcsrfToken || undefined,
                'Cookie': `csrftoken=${csrfToken}; sessionid=${sessionid}`
            },
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) throw new Error('Request failed');
                return response.json();
            })
            .catch(error => console.error('Ошибка:', error));
            mutate();  // Обновляем список сообщени
    }

    const handleMessageAdded = () => {
        mutate();  // Обновляем список сообщений
    };

    if (error) return <div>Ошибка загрузки сообщений</div>;
    if (!messagesData) return <div>Загрузка...</div>;

    return (
        <div className="messages-container">
            <Title level={1}>Сообщения</Title>
            <AddMessageModal onSuccess={handleMessageAdded} />
            {messagesData.length > 0 ? (
                <ul className="message-list">
                    {messagesData.map((message: any) => (
                        <Message
                            key={message.pk_message}
                            pk_message={message.pk_message}
                            text={message.text}
                            isprimary={message.isprimary}
                            onClick={onClickMessage}
                            onDelete={onDelete}
                        />
                    ))}
                </ul>
            ) : (
                <p>Сообщений нет</p>
            )}
        </div>
    );
};

export default Messages;