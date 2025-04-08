import React, { useState, useEffect } from 'react';
import moment from 'moment-timezone';

const TimeHeader: React.FC = () => {
    const [currentTime, setCurrentTime] = useState(
        moment().tz('Europe/Moscow').format('HH:mm:ss')
    );

    useEffect(() => {
        // Функция для синхронизации с началом новой секунды
        const syncWithSecond = () => {
            const now = moment().tz('Europe/Moscow');
            const millisToNextSecond = 1000 - now.milliseconds();

            // Устанавливаем таймер, который сработает точно в начале следующей секунды
            setTimeout(() => {
                // Устанавливаем текущее время
                setCurrentTime(moment().tz('Europe/Moscow').format('HH:mm:ss'));

                // Запускаем интервал точно с начала секунды
                const interval = setInterval(() => {
                    setCurrentTime(moment().tz('Europe/Moscow').format('HH:mm:ss'));
                }, 1000);

                // Очистка интервала при размонтировании компонента
                return () => clearInterval(interval);
            }, millisToNextSecond);
        };

        // Вызываем функцию синхронизации
        syncWithSecond();

        // Устанавливаем текущее время сразу при монтировании
        setCurrentTime(moment().tz('Europe/Moscow').format('HH:mm:ss'));
    }, []);

    return (
        <div style={{ textAlign: 'center', fontSize: '2rem', margin: 0 }}>
            {currentTime}
        </div>
    );
};

export default TimeHeader;