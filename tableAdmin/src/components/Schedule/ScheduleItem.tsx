import { useState } from 'react';
import { Card, Button, Modal, Image, Typography } from 'antd';
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

    return (
        <Card hoverable style={{ width: 250 }}>
            <Image src={url} alt="Schedule" width={200} />
            <div style={{ marginTop: 10 }}>
                <Paragraph strong>Дата: {date}</Paragraph>
                <Paragraph>Тип: {typeLabels[type]}</Paragraph>
                <Button type="primary" onClick={() => setShowEditModal(true)}>
                    Изменить
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