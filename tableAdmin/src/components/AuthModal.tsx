import React, { useState } from 'react';
import { Modal, Tabs, Form, Input, Button, Typography } from 'antd';
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

    const handleLogin = (values: any) => {
        onLogin(values.email, values.password);
    };

    const handleRegister = async (values: any) => {
        await onRegister(values.email, values.password, values.confirm_password, values.firstname, values.lastname);
    };

    const handleActivate = (values: any) => {
        onActivate(values.activation_code);
    };

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
                </Tabs>
            )}
        </Modal>
    );
};

export default AuthModal;