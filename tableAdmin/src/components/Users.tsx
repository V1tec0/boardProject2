import React, { useState, useEffect } from 'react';
import {
    Typography,
    Table,
    Button,
    Modal,
    Form,
    Input,
    Switch,
    message as antdMessage,
    Popconfirm
} from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

interface UserType {
    email: string;
    firstname: string;
    lastname: string;
    is_admin: boolean;
    is_active: boolean;
    id: number;
}

type UsersProps = {
    user: {
        email: string;
        is_admin: boolean;
        id: number;
    };
};

const Users: React.FC<UsersProps> = () => {
    const [users, setUsers] = useState<UserType[]>([]);
    const [editingUser, setEditingUser] = useState<UserType | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [user] = useState(() => JSON.parse(localStorage.getItem('user')!))
    // console.log(user)

    const getCsrfToken = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/csrf/', {
                credentials: 'include',
            });
            const csrfToken = response.headers.get('X-CSRFToken');
            return csrfToken;
        } catch (error) {
            console.error('CSRF Error:', error);
            return null;
        }
    };

    useEffect(() => {
        if (user?.is_admin) fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/users/', {
                credentials: 'include',
            });
            const data = await response.json();
            setUsers(data);
        } catch {
            antdMessage.error('Ошибка загрузки пользователей');
        }
    };

    const handleEdit = (record: UserType) => {
        setEditingUser(record);
        form.setFieldsValue({ ...record });
        setIsModalVisible(true);
    };

    const handleDelete = async (userId: number) => {
        try {
            const xcsrfToken = await getCsrfToken()

            const response = await fetch(`http://localhost:8000/api/admin/users/${userId}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': xcsrfToken
                },
                credentials: 'include',
            });

            if (response.ok) {
                antdMessage.success('Пользователь удален');
                fetchUsers();
            }
        } catch {
            antdMessage.error('Ошибка удаления');
        }
    };

    const handleSave = async () => {
        try {
            const xcsrfToken = await getCsrfToken()
            const values = await form.validateFields();
            
            // Формируем только измененные поля
            const changedFields = {
                firstname: values.firstname !== editingUser?.firstname ? values.firstname : undefined,
                lastname: values.lastname !== editingUser?.lastname ? values.lastname : undefined,
                email: values.email !== editingUser?.email ? values.email : undefined,
                is_active: values.is_active !== editingUser?.is_active ? values.is_active : undefined,
                is_admin: values.is_admin !== editingUser?.is_admin ? values.is_admin : undefined,
                // Добавьте другие поля по аналогии
            };
    
            // Отправляем только измененные данные
            const response = await fetch(
                `http://localhost:8000/api/admin/users/${editingUser?.id}/`, 
                {
                    method: 'PATCH',
                    headers: { 
                        'Content-Type': 'application/json',
                        'X-CSRFToken': xcsrfToken || null
                     },
                    credentials: 'include',
                    body: JSON.stringify(changedFields),
                }
            );

            if(response.ok) {
                antdMessage.success('Данные изменены успешно!')
            }
        } catch {
            antdMessage.error('Ошибка сохранения');
        } 
        window.location.reload()
    };

    const columns: ColumnsType<UserType> = [
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Имя', dataIndex: 'firstname', key: 'firstname' },
        { title: 'Фамилия', dataIndex: 'lastname', key: 'lastname' },
        {
            title: 'Админ',
            dataIndex: 'is_admin',
            key: 'is_admin',
            render: (value) => <Switch checked={value} disabled />
        },
        {
            title: 'Активен',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (value) => <Switch checked={value} disabled />
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_, record) => (
                <>
                    <Button onClick={() => handleEdit(record)}>Редактировать</Button>
                    <Popconfirm
                        title="Удалить пользователя?"
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button danger style={{ marginLeft: 8 }}>Удалить</Button>
                    </Popconfirm>
                </>
            ),
        },
    ];

    return (
        <div>
            <Title level={1}>Управление пользователями</Title>

            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                bordered
                style={{ marginTop: 24 }}
            />

            <Modal
                title="Редактирование пользователя"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={handleSave}
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Form.Item label="Email" name="email" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Имя" name="firstname" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Фамилия" name="lastname" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Админ" name="is_admin" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item label="Активен" name="is_active" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Users;