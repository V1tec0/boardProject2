import { useState } from 'react';
import { Card, Button, Modal, Image, Typography, Divider, message } from 'antd';
import EditScheduleModal from './EditScheduleModal';

const { Paragraph } = Typography;

interface ScheduleItemProps {
    type: 's' | 'p' | 'z';
    date: string;
    url: string;
    onUpdate: () => void;
}

export default function ScheduleItem({ type, date, url, onUpdate }: ScheduleItemProps) {
    const [showEditModal, setShowEditModal] = useState(false);

    const typeLabels = {
        's': 'Для студентов',
        'p': 'Для преподавателей',
        'z': 'Для заочников'
    };

    const handleDelete = async () => {
        Modal.confirm({
            title: 'Удалить расписание?',
            content: `Вы уверены, что хотите удалить расписание за ${date} (${typeLabels[type]})?`,
            okText: 'Удалить',
            okButtonProps: { danger: true },
            cancelText: 'Отмена',
            onOk: async () => {
                try {
                    const csrfRes = await fetch(`${import.meta.env.VITE_API_URL}csrf/`, { credentials: 'include' });
                    const csrfToken = csrfRes.headers.get('X-CSRFToken');

                    const res = await fetch(`${import.meta.env.VITE_API_URL}schedule/`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': csrfToken || '',
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            type,
                            date
                        })
                    });

                    const data = await res.json();

                    if (res.ok) {
                        message.success(data.message || 'Расписание удалено');
                        onUpdate();
                    } else {
                        message.error(data.error || 'Ошибка при удалении');
                    }
                } catch (e) {
                    message.error('Ошибка соединения');
                }
            }
        });
    };


    return (
        <Card hoverable style={{ width: 250 }}>
            <Image src={url} alt="Schedule" width={200} />
            <div style={{ marginTop: 10 }}>
                <Paragraph strong>Дата: {date}</Paragraph>
                <Paragraph>Тип: {typeLabels[type]}</Paragraph>
                <Button type="primary" onClick={() => setShowEditModal(true)}>
                    Изменить
                </Button>
                <Divider type='vertical' />
                <Button danger onClick={handleDelete}>
                    Удалить
                </Button>
            </div>

            <Modal
                title="Редактировать расписание"
                open={showEditModal}
                onCancel={() => setShowEditModal(false)}
                footer={null}
            >
                <EditScheduleModal
                    open={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        onUpdate();
                    }}
                    scheduleDate={date}
                    scheduleType={type}
                />
            </Modal>
        </Card>
    );
}