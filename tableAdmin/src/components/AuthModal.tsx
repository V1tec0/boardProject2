import React, { useState } from 'react';
import { Modal, Tabs, Form, Input, Button, Typography, Steps } from 'antd';
import { LockOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

interface AuthModalProps {
    visible: boolean;
    activationMode: boolean; // добавь это
    onLogin: (email: string, password: string) => void;
    onRegister: (email: string, password: string, confirm_password: string, firstname: string, lastname: string) => void;
    onActivate: (activationCode: string) => void;
    onClose: () => void;
    loading: boolean;
    error: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ visible, activationMode, onLogin, onRegister, onActivate, onClose, loading, error }) => {
    const [activeTab, setActiveTab] = useState('1');
    const [resetStep, setResetStep] = useState(0);


    const handleLogin = (values: any) => {
        onLogin(values.email, values.password);
    };

    const handleRegister = async (values: any) => {
        await onRegister(values.email, values.password, values.confirm_password, values.firstname, values.lastname);
    };

    const handleActivate = (values: any) => {
        onActivate(values.activation_code);
    };

    const handleResetRequest = async (values: any) => {
        const email = values.reset_email;
        try {
            const csrfRes = await fetch(`${import.meta.env.VITE_API_URL}csrf/`, { credentials: 'include' });
            const csrfToken = csrfRes.headers.get('X-CSRFToken');

            const res = await fetch(`${import.meta.env.VITE_API_URL}reset_password/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken || '' },
                credentials: 'include',
                body: JSON.stringify({ email })
            });

            const data = await res.json();
            if (res.ok) {
                alert(data.detail || 'Код отправлен!');
                setResetStep(1);
            } else {
                alert(data.detail || 'Ошибка');
            }
        } catch {
            alert('Ошибка соединения');
        }
    };


    const handleResetPassword = async (values: any) => {
        const { reset_email_confirm, reset_code, new_password } = values;
        try {
            const csrfRes = await fetch(`${import.meta.env.VITE_API_URL}csrf/`, { credentials: 'include' });
            const csrfToken = csrfRes.headers.get('X-CSRFToken');

            const res = await fetch(`${import.meta.env.VITE_API_URL}reset_password/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken || '' },
                credentials: 'include',
                body: JSON.stringify({
                    email: reset_email_confirm,
                    reset_code,
                    new_password
                })
            });

            const data = await res.json();
            if (res.ok) {
                alert(data.detail || 'Пароль сброшен');
            } else {
                alert(data.detail || 'Ошибка');
            }
        } catch {
            alert('Ошибка соединения');
        }
    };

    const { Step } = Steps


    return (
        <Modal visible={visible} footer={null} onCancel={onClose} closable>
            {activationMode ? (
                <Form layout="vertical" onFinish={handleActivate}>
                    <Typography.Title level={4}>Подтвердите регистрацию</Typography.Title>
                    <Form.Item name="activation_code" rules={[{ required: true, message: 'Введите код подтверждения' }]}>
                        <Input placeholder="Код подтверждения" maxLength={6} />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>Подтвердить</Button>
                </Form>
            ) : (
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab="Вход" key="1">
                        <Form layout="vertical" onFinish={handleLogin}>
                            <Form.Item name="email" rules={[{ required: true, message: 'Введите email' }]}>
                                <Input prefix={<MailOutlined />} placeholder="Email" />
                            </Form.Item>
                            <Form.Item name="password" rules={[{ required: true, message: 'Введите пароль' }]}>
                                <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
                            </Form.Item>
                            <div style={{ marginTop: '1rem' }}>
                                <a onClick={() => setActiveTab('3')}>Забыли пароль?</a>
                            </div>
                            {error && <div style={{ color: 'red' }}>{error}</div>}
                            <Button type="primary" htmlType="submit" loading={loading}>Войти</Button>
                        </Form>
                    </TabPane>

                    <TabPane tab="Регистрация" key="2">
                        <Form layout="vertical" onFinish={handleRegister}>
                            <Form.Item name="firstname" rules={[{ required: true, message: 'Введите имя' }]}>
                                <Input prefix={<UserOutlined />} placeholder="Имя" />
                            </Form.Item>
                            <Form.Item name="lastname" rules={[{ required: true, message: 'Введите фамилию' }]}>
                                <Input prefix={<UserOutlined />} placeholder="Фамилия" />
                            </Form.Item>
                            <Form.Item name="email" rules={[{ required: true, message: 'Введите email' }]}>
                                <Input prefix={<MailOutlined />} placeholder="Email" />
                            </Form.Item>
                            <Form.Item name="password" rules={[{ required: true, message: 'Введите пароль' }]}>
                                <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
                            </Form.Item>
                            <Form.Item name="confirm_password" rules={[{ required: true, message: 'Подтвердите пароль' }]}>
                                <Input.Password prefix={<LockOutlined />} placeholder="Подтвердите пароль" />
                            </Form.Item>
                            {error && <div style={{ color: 'red' }}>{error}</div>}
                            <Button type="primary" htmlType="submit" loading={loading}>Зарегистрироваться</Button>
                        </Form>
                    </TabPane>

                    <TabPane tab="Восстановление" key="3">
                        <Steps current={resetStep} size="small" style={{ marginBottom: 24 }}>
                            <Step title="Почта" />
                            <Step title="Подтверждение" />
                        </Steps>

                        {resetStep === 0 && (
                            <Form layout="vertical" onFinish={handleResetRequest}>
                                <Form.Item
                                    name="reset_email"
                                    rules={[{ required: true, message: 'Введите email' }]}
                                >
                                    <Input prefix={<MailOutlined />} placeholder="Email" />
                                </Form.Item>
                                <Button type="primary" htmlType="submit" loading={loading}>
                                    Получить код
                                </Button>
                            </Form>
                        )}

                        {resetStep === 1 && (
                            <Form layout="vertical" onFinish={handleResetPassword}>
                                <Form.Item
                                    name="reset_email_confirm"
                                    rules={[{ required: true, message: 'Введите email' }]}
                                >
                                    <Input prefix={<MailOutlined />} placeholder="Email" />
                                </Form.Item>
                                <Form.Item
                                    name="reset_code"
                                    rules={[{ required: true, message: 'Введите код' }]}
                                >
                                    <Input placeholder="Код" maxLength={6} />
                                </Form.Item>
                                <Form.Item
                                    name="new_password"
                                    rules={[{ required: true, message: 'Введите новый пароль' }]}
                                >
                                    <Input.Password placeholder="Новый пароль" />
                                </Form.Item>
                                <Button type="primary" htmlType="submit" loading={loading}>
                                    Сбросить пароль
                                </Button>
                            </Form>
                        )}
                    </TabPane>


                </Tabs>
            )}
        </Modal>
    );
};

export default AuthModal;