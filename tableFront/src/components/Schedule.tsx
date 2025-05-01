import React, { useEffect, useState } from 'react';
import { Carousel, Spin, Alert } from 'antd';

interface ScheduleItem {
    type: string;
    url: string;
    filename: string;
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
                const response = await fetch(`${import.meta.env.VITE_API_URL}schedule/`);
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
        <Carousel autoplay dots={false} effect="fade" autoplaySpeed={10000}>
            {schedules.map((schedule) => (
                <div key={schedule.type} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                }}>
                    <h3 style={{
                        marginBottom: '1rem',
                        color: '#fff',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                    }}>
                        {scheduleTypes[schedule.type]}
                    </h3>
                    <img
                        src={`${import.meta.env.VITE_MEDIA_URL}schedule/${schedule.filename}`}
                        alt={`Расписание для ${scheduleTypes[schedule.type]}`}
                        style={{
                            maxWidth: '90vw',
                            maxHeight: '80vh',
                            width: 'auto',
                            height: 'auto',
                            objectFit: 'contain',
                        }}
                    />
                </div>
            ))}
        </Carousel>

    );
};

export default ScheduleSlider;
