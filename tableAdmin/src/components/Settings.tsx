import React, { useState } from 'react';
import { Typography, Button, Radio, Space, Switch, Flex, Divider, Modal, Form, Input, message } from 'antd';
import { useOutletContext } from 'react-router-dom';


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
    const [form] = Form.useForm();
    const [editVisible, setEditVisible] = useState(false);
    const [user] = useState(() => JSON.parse(localStorage.getItem('user')!))
    const [position, setPosition] = useState(localStorage.getItem('dockPosition') || 'bottom');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [passwordForm] = Form.useForm();
    const { handleLogout } = useOutletContext<{ handleLogout: () => void }>();



    const handleEditFinish = async (values: any) => {
        try {
            const csrfRes = await fetch(`${import.meta.env.VITE_API_URL}csrf/`, { credentials: 'include' });
            const csrfToken = csrfRes.headers.get('X-CSRFToken');

            const res = await fetch(`${import.meta.env.VITE_API_URL}user/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken || ''
                },
                credentials: 'include',
                body: JSON.stringify(values)
            });

            const data = await res.json();

            if (res.ok) {
                message.success('Данные обновлены');
                localStorage.setItem('user', JSON.stringify(data));
                setEditVisible(false);
                window.location.reload(); // или обновление state
            } else {
                message.error(data.detail || 'Ошибка обновления');
            }
        } catch {
            message.error('Ошибка соединения');
        }
    };

    const handlePasswordChange = async (values: any) => {
        try {
            const csrfRes = await fetch(`${import.meta.env.VITE_API_URL}csrf/`, { credentials: 'include' });
            const csrfToken = csrfRes.headers.get('X-CSRFToken');

            const res = await fetch(`${import.meta.env.VITE_API_URL}user/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken || ''
                },
                credentials: 'include',
                body: JSON.stringify({
                    change_password: {
                        old_password: values.old_password,
                        new_password: values.new_password,
                        new_password2: values.new_password2,
                    }
                })
            });

            const data = await res.json();

            if (res.ok) {
                message.success('Пароль успешно изменён. Вы будете разлогинены...');
                setTimeout(() => {
                    handleLogout()
                }, 1500);
            } else {
                message.error(data.detail || 'Ошибка при смене пароля');
            }
        } catch {
            message.error('Ошибка соединения');
        }
    };




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

                <Divider type='vertical' style={{ height: '400px' }} />

                <Space className='user-settings' direction="vertical">
                    <Title level={3}>Данные пользователя</Title>
                    <p>Имя: {user.firstname}</p>
                    <p>Фамилия: {user.lastname}</p>
                    <p>email: {user.email}</p>
                    <Space>
                        <Button onClick={() => setEditVisible(true)}>Изменить данные</Button>
                        <Button type='primary' onClick={() => setPasswordVisible(true)}>
                            Сменить пароль
                        </Button>

                    </Space>
                </Space>
            </Space>
            <Modal
                title="Редактирование данных"
                open={editVisible}
                onCancel={() => setEditVisible(false)}
                onOk={() => form.submit()}
                okText="Сохранить"
            >
                <Form form={form} layout="vertical" onFinish={handleEditFinish} initialValues={{
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                }}>
                    <Form.Item name="firstname" label="Имя" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="lastname" label="Фамилия" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="Сменить пароль"
                open={passwordVisible}
                onCancel={() => setPasswordVisible(false)}
                onOk={() => passwordForm.submit()}
                okText="Сохранить"
            >
                <Form form={passwordForm} layout="vertical" onFinish={handlePasswordChange}>
                    <Form.Item
                        name="old_password"
                        label="Старый пароль"
                        rules={[{ required: true, message: 'Введите текущий пароль' }]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        name="new_password"
                        label="Новый пароль"
                        rules={[{ required: true, message: 'Введите новый пароль' }]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        name="new_password2"
                        label="Повторите новый пароль"
                        dependencies={['new_password']}
                        rules={[
                            { required: true, message: 'Повторите новый пароль' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('new_password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Пароли не совпадают'));
                                }
                            })
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                </Form>
            </Modal>


        </div >
    );
};

export default Settings;
