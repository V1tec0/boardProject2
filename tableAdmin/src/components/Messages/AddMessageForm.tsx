import React, { useState } from 'react';
import { Modal, Form, Input, Switch, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

type AddMessageModalProps = {
    onSuccess: () => void;  // Колбэк для обновления списка сообщений
};

const AddMessageModal: React.FC<AddMessageModalProps> = ({ onSuccess }) => {
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        form.resetFields();
        setIsModalOpen(false);
    };

    const getCookie = (name: string): string | null => {
        const cookies = document.cookie
            .split(';')
            .map(cookie => cookie.trim().split('='));

        const targetCookie = cookies.find(([cookieName]) => cookieName === name);

        return targetCookie
            ? decodeURIComponent(targetCookie[1]) // Декодируем значение
            : null;
    };

    const handleSubmit = async () => {
        try {
            const csrfresponse = await fetch('http://localhost:8000/api/csrf/', {
                credentials: 'include',
            });
            const xcsrfToken = csrfresponse.headers.get('X-CSRFToken');

            setIsLoading(true);
            const values = await form.validateFields();
            values.isprimary = values.isprimary == true? 1 : 0

            const sessionid = getCookie('sessionid')
            const csrfToken = getCookie('csrftoken')
            
            const response = await fetch('http://localhost:8000/api/messages/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': xcsrfToken || undefined,
                    'Cookie': `csrftoken=${csrfToken}; sessionid=${sessionid}`
                },
                credentials: 'include',
                body: JSON.stringify({
                    text: values.text,
                    isprimary: values.isprimary || 0
                }),
            });

            if (!response.ok) {
                throw new Error('Ошибка при добавлении сообщения');
            }

            message.success('Сообщение успешно добавлено');
            form.resetFields();
            setIsModalOpen(false);
            onSuccess();  // Обновляем список сообщений
        } catch (error) {
            if (error instanceof Error) {
                message.error(error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={showModal}
                style={{ marginBottom: 16 }}
            >
                Добавить сообщение
            </Button>

            <Modal
                title="Добавление нового сообщения"
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={handleCancel}
                confirmLoading={isLoading}
                okText="Добавить"
                cancelText="Отмена"
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="text"
                        label="Текст сообщения"
                        rules={[
                            { required: true, message: 'Пожалуйста, введите текст сообщения' },
                        ]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="isprimary"
                        label="Приоритетное сообщение"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default AddMessageModal;