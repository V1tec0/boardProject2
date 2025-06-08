import React, { useState } from 'react';
import { Typography, Button, Tabs, Spin, Alert } from 'antd';
import useSWR from 'swr';
import ScheduleModal from './ScheduleModal';
import EditScheduleModal from './EditScheduleModal';
import ScheduleItem from './ScheduleItem';
import BellAdminPanel from './BellAdminPanel';

const { Title } = Typography;
const { TabPane } = Tabs;
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Schedule: React.FC = () => {
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editSchedule, setEditSchedule] = useState<{ date: string; type: 's' | 'p' | 'z' } | null>(null);

    const { data: scheduleData, error, mutate } = useSWR(
        'http://localhost:8000/api/schedule/',
        fetcher,
        { refreshInterval: 5000 }
    );

    return (
        <div style={{ marginBottom: 32 }}>
            <Title level={1}>Управление расписанием</Title>
            <Tabs defaultActiveKey="schedule" type="card">
                <TabPane tab="Расписание" key="schedule">
                    <Button type="primary" onClick={() => setShowScheduleModal(true)} style={{ marginBottom: 16 }}>
                        Добавить расписание
                    </Button>
                    {showScheduleModal && (
                        <ScheduleModal open={showScheduleModal} onClose={() => setShowScheduleModal(false)} onUpdate={mutate} />
                    )}
                    {showEditModal && editSchedule && (
                        <EditScheduleModal
                            open={showEditModal}
                            onClose={() => {
                                setShowEditModal(false);
                                mutate();
                            }}
                            scheduleDate={editSchedule.date}
                            scheduleType={editSchedule.type}
                        />
                    )}
                    {error ? (
                        <Alert message="Ошибка загрузки расписания" type="error" showIcon />
                    ) : !scheduleData ? (
                        <Spin size="large" />
                    ) : (
                        <div className="schedules-list" style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                            {scheduleData.schedules && scheduleData.schedules.length > 0 ? (
                                scheduleData.schedules.map((schedule: any) => (
                                    <ScheduleItem
                                        key={`${schedule.date}_${schedule.type}`}
                                        type={schedule.type}
                                        date={schedule.date}
                                        url={import.meta.env.VITE_HOST + schedule.url}
                                        onUpdate={mutate}
                                    />
                                ))
                            ) : (
                                <Alert message="Нет расписаний" type="info" showIcon />
                            )}
                        </div>
                    )}
                </TabPane>
                <TabPane tab="Звонки" key="bells">
                    <BellAdminPanel />
                </TabPane>
            </Tabs>
        </div>
    );
};

export default Schedule;