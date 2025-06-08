import { useEffect, useState } from 'react';
import { Table, Tag, Typography } from 'antd';

const { Title } = Typography

export default function LogsPage() {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}logs/`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => setLogs(data));
    }, []);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8000/ws/logs/'); // на проде — wss:// и домен

        socket.onmessage = (event) => {
            const newLog = JSON.parse(event.data);
            setLogs(prev => [newLog, ...prev]);
        };

        return () => socket.close();
    }, []);

    const columns = [
        {
            title: 'Время',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (value) => new Date(value).toLocaleString('ru-RU')
        },
        {
            title: 'Пользователь',
            dataIndex: 'user',
            key: 'user',
            render: (val) => val || <Tag color="default">Аноним</Tag>
        },
        {
            title: 'Метод',
            dataIndex: 'method',
            key: 'method',
            render: (m) => <Tag color={m === 'DELETE' ? 'red' : m === 'POST' ? 'green' : 'blue'}>{m}</Tag>
        },
        { title: 'Путь', dataIndex: 'path', key: 'path' },
        { title: 'Действие', dataIndex: 'action', key: 'action' },
    ];

    return (
        <div>
            <Title level={1}>Журнал действий</Title>
            <Table
                rowKey="id"
                columns={columns}
                dataSource={logs}
                pagination={{ pageSize: 20 }}
                bordered
                style={{ padding: 24 }} 
            />
        </div>
    );
}
