import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Select, TimePicker, message as antdMessage, Input } from 'antd';
import moment from 'moment';

const { Option } = Select;

interface BellTemplate {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
}

interface BellSchedule {
    id?: number;
    template: number;
    bell_type: 'lesson' | 'break';
    scheduled_time: string;
    message: string;
    active: boolean;
}

interface ActiveSchedule {
    active_template: string;
    schedules: BellSchedule[];
}

const getCookie = (name: string): string | null => {
    const cookies = document.cookie
        .split(';')
        .map(cookie => cookie.trim().split('='));

    const targetCookie = cookies.find(([cookieName]) => cookieName === name);
    return targetCookie ? decodeURIComponent(targetCookie[1]) : null;
};

const BellAdminPanel: React.FC = () => {
    const [templates, setTemplates] = useState<BellTemplate[]>([]);
    const [activeSchedule, setActiveSchedule] = useState<ActiveSchedule | null>(null);
    const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<BellSchedule | null>(null);
    const [form] = Form.useForm();
    const [templateModalVisible, setTemplateModalVisible] = useState(false);
    const [templateForm] = Form.useForm();

    // Загрузка данных
    const fetchData = async () => {
        try {
            // Получаем CSRF токен
            const csrfResponse = await fetch('http://localhost:8000/api/csrf/', {
                credentials: 'include',
            });
            const xcsrfToken = csrfResponse.headers.get('X-CSRFToken');

            // Загружаем шаблоны
            const templatesResponse = await fetch('http://localhost:8000/api/bell-templates/', {
                headers: {
                    'X-CSRFToken': xcsrfToken || '',
                    'Cookie': `csrftoken=${getCookie('csrftoken')}; sessionid=${getCookie('sessionid')}`
                },
                credentials: 'include'
            });
            setTemplates(await templatesResponse.json());

            // Загружаем активное расписание
            const scheduleResponse = await fetch('http://localhost:8000/api/active-schedule/', {
                headers: {
                    'X-CSRFToken': xcsrfToken || '',
                    'Cookie': `csrftoken=${getCookie('csrftoken')}; sessionid=${getCookie('sessionid')}`
                },
                credentials: 'include'
            });
            setActiveSchedule(await scheduleResponse.json());
        } catch (err) {
            antdMessage.error('Ошибка загрузки данных');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Обработка изменения шаблона
    // Изменённая функция handleSwitchTemplate
    const handleSwitchTemplate = async (templateId: number) => {
        try {
            const csrfResponse = await fetch('http://localhost:8000/api/csrf/', {
                credentials: 'include',
            });
            const xcsrfToken = csrfResponse.headers.get('X-CSRFToken');

            const response = await fetch('http://localhost:8000/api/switch-template/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': xcsrfToken || '',
                    'Cookie': `csrftoken=${getCookie('csrftoken')}; sessionid=${getCookie('sessionid')}`
                },
                credentials: 'include',
                body: JSON.stringify({ template_id: templateId })
            });

            if (response.ok) {
                antdMessage.success('Шаблон активирован');
                fetchData();  // <- добавлено для обновления состояния
            } else {
                antdMessage.error('Ошибка активации шаблона');
            }
        } catch (err) {
            antdMessage.error('Ошибка активации шаблона');
        }
    };


    // Обработка формы
    const handleFormSubmit = async (values: any) => {
        try {
            const csrfResponse = await fetch('http://localhost:8000/api/csrf/', {
                credentials: 'include',
            });
            const xcsrfToken = csrfResponse.headers.get('X-CSRFToken');

            const endpoint = editingSchedule
                ? `http://localhost:8000/api/bell-schedules/${editingSchedule.id}/`
                : 'http://localhost:8000/api/bell-schedules/';

            const method = editingSchedule ? 'PATCH' : 'POST';

            const body = {
                ...values,
                scheduled_time: values.scheduled_time.format('HH:mm:ss'),
                template: activeSchedule?.schedules[0]?.template
            };

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': xcsrfToken || '',
                    'Cookie': `csrftoken=${getCookie('csrftoken')}; sessionid=${getCookie('sessionid')}`
                },
                credentials: 'include',
                body: JSON.stringify(body),
            });

            if (response.ok) {
                antdMessage.success(editingSchedule ? 'Звонок обновлён' : 'Звонок добавлен');
                setScheduleModalVisible(false);
                fetchData();
            }
        } catch (err) {
            antdMessage.error('Ошибка операции');
        }
    };

    // Удаление звонка
    const handleDeleteSchedule = async (id: number) => {
        try {
            const csrfResponse = await fetch('http://localhost:8000/api/csrf/', {
                credentials: 'include',
            });
            const xcsrfToken = csrfResponse.headers.get('X-CSRFToken');

            const response = await fetch(`http://localhost:8000/api/bell-schedules/${id}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': xcsrfToken || '',
                    'Cookie': `csrftoken=${getCookie('csrftoken')}; sessionid=${getCookie('sessionid')}`
                },
                credentials: 'include'
            });

            if (response.ok) {
                antdMessage.success('Звонок удалён');
                fetchData();
            }
        } catch (err) {
            antdMessage.error('Ошибка удаления');
        }
    };

    const handleTemplateSubmit = async (values: any) => {
        try {
            const csrfResponse = await fetch('http://localhost:8000/api/csrf/', {
                credentials: 'include',
            });
            const xcsrfToken = csrfResponse.headers.get('X-CSRFToken');
    
            const response = await fetch('http://localhost:8000/api/bell-templates/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': xcsrfToken || '',
                },
                credentials: 'include',
                body: JSON.stringify(values),
            });
    
            if (response.ok) {
                antdMessage.success('Шаблон расписания добавлен');
                setTemplateModalVisible(false);
                fetchData();
            } else {
                antdMessage.error('Ошибка добавления шаблона');
            }
        } catch (err) {
            antdMessage.error('Ошибка операции');
        }
    };    

    // Сброс формы при открытии модалки
    useEffect(() => {
        if (scheduleModalVisible) {
            form.resetFields();
            if (editingSchedule) {
                form.setFieldsValue({
                    ...editingSchedule,
                    scheduled_time: moment(editingSchedule.scheduled_time, 'HH:mm:ss'),
                });
            }
        }
    }, [scheduleModalVisible, editingSchedule, form]);

    // Определяем, активен ли текущий шаблон
    const isTemplateActive = (templateId: number): boolean => {
        return activeSchedule?.active_template == templateId.toString();
    };


    return (
        <div style={{ padding: '20px' }}>
            {/* Список шаблонов */}
            <section style={{ marginBottom: '40px' }}>
                <h2>Доступные шаблоны</h2>
                <Button type="primary" onClick={() => setTemplateModalVisible(true)} style={{ marginBottom: 20 }}>
                    Добавить новый шаблон
                </Button>
                <Table
                    dataSource={templates}
                    rowKey="id"
                    columns={[
                        { title: 'Название', dataIndex: 'name' },
                        { title: 'Описание', dataIndex: 'description' },
                        {
                            title: 'Действия',
                            render: (_, record) => (
                                <Button
                                    type={isTemplateActive(record.id) ? "default" : "primary"}
                                    onClick={() => handleSwitchTemplate(record.id)}
                                    disabled={isTemplateActive(record.id)}
                                >
                                    {isTemplateActive(record.id) ? 'Активен' : 'Активировать'}
                                </Button>
                            )
                        }
                    ]}
                />
            </section>

            {/* Активное расписание */}
            <section>
                <h2>Текущее расписание: {activeSchedule?.active_template || 'Не выбрано'}</h2>

                <Button
                    type="primary"
                    onClick={() => {
                        setEditingSchedule(null);
                        setScheduleModalVisible(true);
                    }}
                    style={{ marginBottom: '16px' }}
                    disabled={!activeSchedule?.active_template}
                >
                    Добавить новый звонок
                </Button>

                <Table
                    dataSource={activeSchedule?.schedules || []}
                    rowKey="id"
                    columns={[
                        { title: 'Время', dataIndex: 'scheduled_time' },
                        {
                            title: 'Тип',
                            dataIndex: 'bell_type',
                            render: (type: 'lesson' | 'break') => type === 'lesson'
                                ? 'Урок'
                                : 'Перемена'
                        },
                        { title: 'Сообщение', dataIndex: 'message' },
                        {
                            title: 'Действия',
                            render: (_, record) => (
                                <div>
                                    <Button
                                        type="link"
                                        onClick={() => {
                                            setEditingSchedule(record);
                                            setScheduleModalVisible(true);
                                        }}
                                    >
                                        Редактировать
                                    </Button>
                                    <Button
                                        type="link"
                                        danger
                                        onClick={() => handleDeleteSchedule(record.id!)}
                                    >
                                        Удалить
                                    </Button>
                                </div>
                            )
                        }
                    ]}
                />
            </section>

            {/* Модальное окно редактирования */}
            <Modal
                title={editingSchedule ? 'Редактирование звонка' : 'Новый звонок'}
                open={scheduleModalVisible}
                onCancel={() => setScheduleModalVisible(false)}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                    initialValues={{ bell_type: 'lesson' }}
                >
                    <Form.Item
                        label="Время звонка"
                        name="scheduled_time"
                        rules={[{ required: true, message: 'Укажите время' }]}
                    >
                        <TimePicker format="HH:mm:ss" />
                    </Form.Item>

                    <Form.Item
                        label="Тип звонка"
                        name="bell_type"
                        rules={[{ required: true, message: 'Выберите тип' }]}
                    >
                        <Select>
                            <Option value="lesson">Звонок на урок</Option>
                            <Option value="break">Звонок на перемену</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Сообщение"
                        name="message"
                        rules={[{ required: true, message: 'Введите сообщение' }]}
                    >
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {editingSchedule ? 'Сохранить изменения' : 'Добавить звонок'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Новый шаблон расписания"
                open={templateModalVisible}
                onCancel={() => setTemplateModalVisible(false)}
                footer={null}
                destroyOnClose
            >
                <Form form={templateForm} layout="vertical" onFinish={handleTemplateSubmit}>
                    <Form.Item
                        label="Название шаблона"
                        name="name"
                        rules={[{ required: true, message: 'Введите название шаблона' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Описание"
                        name="description"
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">Создать шаблон</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default BellAdminPanel;