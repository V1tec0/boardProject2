import React, { useEffect, useState, useRef } from 'react';
import { Modal } from 'antd';
import moment from 'moment';

interface IMessage {
    pk_message: number;
    text: string;
    isprimary: boolean;
}

interface BellSchedule {
    id: number;
    scheduled_time: string;
    message: string;
    bell_type: 'lesson' | 'break';
}

const Overlay: React.FC = () => {
    const [currentMessage, setCurrentMessage] = useState<IMessage | null>(null);
    const [currentBell, setCurrentBell] = useState<BellSchedule | null>(null);
    const [messageModalVisible, setMessageModalVisible] = useState(false);
    const [bellModalVisible, setBellModalVisible] = useState(false);
    
    // Используем ref для отслеживания уже отображенных звонков
    const processedBellTimes = useRef<Set<string>>(new Set());
    
    // Обработка WebSocket-сообщений
    useEffect(() => {
        const socket = new WebSocket(`ws://localhost:8000/ws/msgs/`);

        socket.onopen = () => {
            console.log('WebSocket connected');
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                if (data.pk_message === -1) {
                    window.location.reload();
                    return;
                }
                
                if (data.type === 'message' && data.data?.action === 'show') {
                    setCurrentMessage({
                        pk_message: data.data.pk_message,
                        text: data.data.text,
                        isprimary: Boolean(data.data.isprimary),
                    });
                    setMessageModalVisible(true);
                } else if (data.type === 'control' && data.action === 'hide') {
                    if (currentMessage?.pk_message === data.pk_message) {
                        setMessageModalVisible(false);
                        setCurrentMessage(null);
                    }
                } else if (data.type === 'reload') {
                    window.location.reload();
                }
            } catch (err) {
                console.error('Ошибка обработки сообщения:', err);
            }
        };

        socket.onerror = () => console.error('WebSocket error');
        socket.onclose = () => console.error('WebSocket closed');

        return () => {
            socket.close();
        };
    }, [currentMessage?.pk_message]);

    // Проверка расписания звонков
    useEffect(() => {
        const checkBellSchedule = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/active-schedule/');
                const { schedules } = await response.json();

                const now = moment();
                const currentTimeStr = now.format('HH:mm');
                const currentDateTimeKey = now.format('YYYY-MM-DD HH:mm'); // Уникальный ключ для текущей минуты
                
                // Поиск звонка для текущего времени
                const bell = schedules.find((s: BellSchedule) =>
                    moment(s.scheduled_time, 'HH:mm:ss').format('HH:mm') === currentTimeStr
                );

                // Проверяем, был ли уже показан звонок для этой минуты
                if (bell && !processedBellTimes.current.has(currentDateTimeKey)) {
                    console.log('New bell matched:', bell, 'at time:', currentDateTimeKey);
                    
                    // Отмечаем эту минуту как обработанную
                    processedBellTimes.current.add(currentDateTimeKey);
                    
                    // Очистка старых записей (оставляем только последние 50)
                    if (processedBellTimes.current.size > 50) {
                        const entries = Array.from(processedBellTimes.current);
                        processedBellTimes.current = new Set(entries.slice(-50));
                    }
                    
                    // Отправить уведомление на сервер
                    fetch(`http://localhost:8000/api/messages/${bell.bell_type}`);
                    
                    // Показать модальное окно
                    setCurrentBell(bell);
                    setBellModalVisible(true);
                    
                    // Скрыть модальное окно через 5 секунд
                    setTimeout(() => {
                        setBellModalVisible(false);
                        setCurrentBell(null);
                    }, 5000);
                }
            } catch (err) {
                console.error('Ошибка проверки расписания:', err);
            }
        };

        // Настроить интервал проверки каждую секунду
        const interval = setInterval(checkBellSchedule, 1000);
        
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            {/* Сообщения */}
            {currentMessage && (
                <Modal
                    open={messageModalVisible}
                    title={currentMessage.isprimary ? 'Важное сообщение' : 'Сообщение'}
                    onOk={() => {
                        setMessageModalVisible(false);
                        setCurrentMessage(null);
                    }}
                    onCancel={() => {
                        setMessageModalVisible(false);
                        setCurrentMessage(null);
                    }}
                    footer={null}
                >
                    <p>{currentMessage.text}</p>
                </Modal>
            )}

            {/* Звонки */}
            {currentBell && (
                <Modal
                    open={bellModalVisible}
                    title={currentBell.bell_type === 'lesson' 
                        ? '🔔 Звонок на урок' 
                        : '🔔 Звонок на перемену'}
                    footer={null}
                    closable={false}
                    centered
                >
                    <p>{currentBell.message}</p>
                    <div style={{ marginTop: 10, color: '#666' }}>
                        {moment(currentBell.scheduled_time, 'HH:mm:ss').format('HH:mm')}
                    </div>
                </Modal>
            )}
        </>
    );
};

export default Overlay;