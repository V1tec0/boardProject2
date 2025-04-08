import { Card, Flex, Typography, message as antdMessage } from 'antd';
import { useEffect, useState } from 'react';
import { IData } from '../types';
import { BuildFilled } from '@ant-design/icons';

const { Title } = Typography;

export default function MainPage() {
    const [user] = useState(() => JSON.parse(localStorage.getItem('user')!))
    const [clients, setClients] = useState<IData[]>([])

    useEffect(() => {
        fetch('http://localhost:8000/api/client/', {
            method: 'GET'
        }).then(res => res.json())
        .then(data => {
            console.log(data)
            setClients(data)
        })
        .catch (() => {
            antdMessage.error('Ошибка получения данных о клиентах')
        }) 
    }, [])

    useEffect(() => {
        console.log("Обновлённые клиенты:", clients);
    }, [clients]);
    

    return (
        <>
            <Title level={1}>Добро пожаловать в админ-панель, {user.email}</Title>

            <div className='clients'>
                <p> Количество текущих клиентов: {clients.length} </p>
                <Flex wrap justify='center' align='top'>
                    {clients.map((client: IData) => (
                        <Card style={{margin: 10}} key={client.token} title={client.name}>
                            токен клиента: {client.token} <br />
                            <p>Местонахождение: {client.building} Корпус, {client.floor} Этаж</p>
                        </Card>
                    ))}
                </Flex>
            </div>
        </>
    );
}
