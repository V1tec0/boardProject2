import React, { useState } from 'react';
import { Modal, Form, Input, Steps, Button, Result, InputNumber } from 'antd';
import { IData } from '../types';

const { Step } = Steps;

interface ClientRegistrationProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: (data: IData) => void;
}

const ClientRegistration: React.FC<ClientRegistrationProps> = ({ visible, onCancel, onSuccess }) => {
    const [current, setCurrent] = useState(0);
    const [form] = Form.useForm();
    const [clientName, setClientName] = useState('');
    const [floor, setFloor] = useState(1)
    const [building, setBuilding] = useState(1)

    const next = () => {
        if (current === 0) {
            form
                .validateFields()
                .then(values => {
                    setClientName(values.name);
                    setFloor(values.floor)
                    setBuilding(values.building)
                    setCurrent(current + 1);
                })
                .catch(info => {
                    console.log('Ошибка валидации:', info);
                });
        } else if (current === 1) {
            // После подтверждения отправляем данные на сервер
            handleSubmit();
        }
    };

    const prev = () => {
        setCurrent(current - 1);
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}client/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: clientName, floor, building }),
            });
            if (response.ok) {
                const data = await response.json();
                setCurrent(current + 1);
                onSuccess(data);
            } else {
                console.error('Ошибка регистрации клиента');
            }
        } catch (error) {
            console.error('Ошибка:', error);
        }
    };

    const steps = [
        {
            title: 'Детали клиента',
            content: (
                <Form form={form} layout="vertical" name="clientForm">
                    <Form.Item
                        label="Название клиента"
                        name="name"
                        rules={[{ required: true, message: 'Пожалуйста, введите название клиента' }]}
                    >
                        <Input placeholder="Введите название клиента" />
                    </Form.Item>
                    <Form.Item
                        label="Корпус, в котором расположен клиент"
                        name="building"
                        rules={[{ required: true, message: 'Пожалуйста, введите номер корпуса' }]}
                    >
                        <InputNumber placeholder="Введите номер корпуса" />
                    </Form.Item>
                    <Form.Item
                        label="Этаж, на котором расположен клиент"
                        name="floor"
                        rules={[{ required: true, message: 'Пожалуйста, введите номер этажа' }]}
                    >
                        <InputNumber placeholder="Введите номер этажа" />
                    </Form.Item>
                </Form>
            ),
        },
        {
            title: 'Подтверждение',
            content: (
                <div>
                    <p>Проверьте введённые данные:</p>
                    <p>
                        <strong>Название клиента:</strong> {clientName} <br />
                        <strong>Корпус:</strong> {building} <br />
                        <strong>Этаж:</strong> {floor} <br />
                    </p>
                </div>
            ),
        },
        {
            title: 'Готово',
            content: (
                <Result
                    status="success"
                    title="Клиент успешно добавлен!"
                    extra={[
                        <Button type="primary" key="ok" onClick={onCancel}>
                            Закрыть
                        </Button>,
                    ]}
                />
            ),
        },
    ];

    return (
        <Modal open={visible} title="Регистрация клиента" onCancel={onCancel} footer={null}>
            <Steps current={current} size="small" style={{ marginBottom: 20 }}>
                {steps.map(item => (
                    <Step key={item.title} title={item.title} />
                ))}
            </Steps>
            <div className="steps-content">{steps[current].content}</div>
            {current < 2 && (
                <div style={{ marginTop: 24, textAlign: 'right' }}>
                    {current > 0 && (
                        <Button style={{ margin: '0 8px' }} onClick={prev}>
                            Назад
                        </Button>
                    )}
                    <Button type="primary" onClick={next}>
                        {current === steps.length - 2 ? 'Подтвердить' : 'Далее'}
                    </Button>
                </div>
            )}
        </Modal>
    );
};

export default ClientRegistration;
