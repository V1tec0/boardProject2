import React, { useEffect, useState } from 'react';
import { Carousel, Spin, Alert } from 'antd';

interface ScheduleItem {
    type: string;
    url: string;
}

const ScheduleSlider: React.FC = () => {
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Пример сопоставления типа расписания с текстовым описанием (при необходимости можно заменить)
    const scheduleTypes: { [key: string]: string } = {
        s: 'Студенты',
        p: 'Преподаватели',
        z: 'Заочники',
    };

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/schedule/');
                if (!response.ok) throw new Error('Ошибка загрузки расписания');
                const data = await response.json();
                setSchedules(data.schedules);
            } catch {
                setError('Не удалось получить расписание');
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, []);

    if (loading) return <Spin />;
    if (error) return <Alert message="Ошибка" description={error} type="error" showIcon />;

    return (
        <Carousel autoplay dots={false} effect="fade" style={{minWidth: '100px', maxWidth: '600px'}}>
            {schedules.map((schedule) => (
                <div key={schedule.type} style={{ position: 'relative', width: '100%', height: '100vh' }}>
                    <h3
                        style={{
                            position: 'absolute',
                            top: '20px',
                            zIndex: 1,
                            color: '#fff',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                        }}
                    >
                        {scheduleTypes[schedule.type]}
                    </h3>
                    <img
                        src={`http://localhost:8000${schedule.url}`}
                        alt={`Расписание для ${scheduleTypes[schedule.type]}`}
                        style={{ width: '100%', height: '100vh', objectFit: 'contain' }}
                    />
                </div>
            ))}
        </Carousel>
    );
};

export default ScheduleSlider;
