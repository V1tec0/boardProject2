import React, { useEffect, useRef, useState } from 'react';
import { Typography, Button, Popover, message } from 'antd';
import useSWR from 'swr';
import Message from './Message';
import './Messages.css'
import AddMessageModal from './AddMessageForm';
import SendMessageModal from './SendMessageModal';

const { Title } = Typography;
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Messages: React.FC = () => {
    const { data: messagesData, error, mutate } = useSWR(
        'http://localhost:8000/api/messages/',
        fetcher,
        { refreshInterval: 5000 }
    );

    const [contextTarget, setContextTarget] = useState<{ x: number; y: number; id: number | null }>({ x: 0, y: 0, id: null });
    const [popoverVisible, setPopoverVisible] = useState(false);
    const [sendModalVisible, setSendModalVisible] = useState(false);
    const [sendTarget, setSendTarget] = useState<'all' | 'client'>('all');
    const [sendMessageId, setSendMessageId] = useState<number | null>(null);
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        socketRef.current = new WebSocket('ws://localhost:8000/ws/msgs/'); // на проде wss://
        const socket = socketRef.current

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'status_update') {
                const { pk_message, isshowing } = data.data;

                mutate((prevMessages: any[]) =>
                    prevMessages.map(msg =>
                        msg.pk_message === pk_message
                            ? { ...msg, isshowing }
                            : msg
                    ), false);
            }

            if (data.type === 'all_statuses') {
                const statuses = data.data;

                mutate((prevMessages: any[]) =>
                    prevMessages.map(msg => {
                        const found = statuses.find((s: any) => s.pk_message === msg.pk_message);
                        return found ? { ...msg, isshowing: found.isshowing } : msg;
                    }), false);
            }
        };

        return () => socket.close();
    }, []);


    const getCookie = (name: string): string | null => {
        const cookies = document.cookie
            .split(';')
            .map(cookie => cookie.trim().split('='));

        const targetCookie = cookies.find(([cookieName]) => cookieName === name);

        return targetCookie
            ? decodeURIComponent(targetCookie[1]) // Декодируем значение
            : null;
    };

    const handleContextMenu = (e: React.MouseEvent, id: number) => {
        e.preventDefault();
        setContextTarget({ x: e.clientX, y: e.clientY, id });
        setPopoverVisible(true);
    };

    const openSendModal = (id: number | null, target: 'all' | 'client') => {
        setSendMessageId(id);
        setSendTarget(target);
        setSendModalVisible(true);
    };

    const handleEdit = (id: number | null) => {
        if (!id) return;
        console.log('Редактировать сообщение с ID:', id);
        // TODO: твоя логика, например:
        // setEditingMessageId(id);
        // setEditModalVisible(true);
    };


    const onClickMessage = (id: number) => {
        const message = messagesData.find((m) => m.pk_message === id);
        if (!message || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

        const newAction = message.isshowing ? 'hide' : 'show';

        socketRef.current.send(JSON.stringify({
            type: 'send_message',
            message_id: id,
            action: newAction,
            show_at: null,
            duration: null
        }));

        // Обновляем локальное состояние мгновенно
        mutate((prevMessages: any[]) =>
            prevMessages.map(m =>
                m.pk_message === id
                    ? { ...m, isshowing: newAction === 'show' }
                    : m
            ), false);
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
                            isshowing={message.isshowing}
                            duration={message.duration}
                            onClick={onClickMessage}
                            onDelete={onDelete}
                            onContextMenu={(e) => handleContextMenu(e, message.pk_message)}
                        />

                    ))}
                </ul>
            ) : (
                <p>Сообщений нет</p>
            )}
            <Popover
                content={
                    <div>
                        <div onClick={() => { openSendModal(contextTarget.id, 'all'); setPopoverVisible(false); }}>Отправить на всех</div>
                        <div onClick={() => { openSendModal(contextTarget.id, 'client'); setPopoverVisible(false); }}>Отправить на клиента</div>
                        <div onClick={() => { handleEdit(contextTarget.id); setPopoverVisible(false); }}>Редактировать</div>
                        <div onClick={() => { onDelete(contextTarget.id); setPopoverVisible(false); }}>Удалить</div>
                    </div>
                }
                trigger="click"
                open={popoverVisible}
                onOpenChange={setPopoverVisible}
                placement="bottomLeft"
                getPopupContainer={() => document.body}
            >
                <div
                    style={{
                        position: 'fixed',
                        top: contextTarget.y,
                        left: contextTarget.x,
                        width: 1,
                        height: 1,
                        zIndex: 9999,
                    }}
                />
            </Popover>
            <SendMessageModal
                visible={sendModalVisible}
                messageId={sendMessageId}
                target={sendTarget}
                isshowing
                onCancel={() => setSendModalVisible(false)}
                onSend={(data) => {
                    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
                        message.error('Соединение с сервером не установлено');
                        return;
                    }

                    const message = messagesData.find((m) => m.pk_message === data.messageId);
                    const newAction = message?.isshowing ? 'hide' : 'show';

                    socketRef.current.send(JSON.stringify({
                        type: 'send_message',
                        message_id: data.messageId,
                        action: newAction,
                        show_at: data.showAt,
                        duration: data.duration ?? null
                    }));

                    mutate((prevMessages: any[]) =>
                        prevMessages.map(m =>
                            m.pk_message === data.messageId
                                ? { ...m, isshowing: newAction === 'show' }
                                : m
                        ), false);

                    setSendModalVisible(false);
                }}

            />

        </div >
    );
};

export default Messages;