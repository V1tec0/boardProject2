import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';

const TimeHeader: React.FC = () => {
    const [currentTime, setCurrentTime] = useState(
        DateTime.now().setZone('Europe/Moscow').setLocale('ru')
    );

    useEffect(() => {
        const syncWithSecond = () => {
            const now = DateTime.now().setZone('Europe/Moscow');
            const millisToNextSecond = 1000 - now.millisecond;

            setTimeout(() => {
                setCurrentTime(DateTime.now().setZone('Europe/Moscow').setLocale('ru'));

                const interval = setInterval(() => {
                    setCurrentTime(DateTime.now().setZone('Europe/Moscow').setLocale('ru'));
                }, 1000);

                return () => clearInterval(interval);
            }, millisToNextSecond);
        };

        syncWithSecond();
        setCurrentTime(DateTime.now().setZone('Europe/Moscow').setLocale('ru'));
    }, []);

    // Формируем красивую строку
    const formatted = currentTime.toFormat("cccc, d LLLL yyyy, HH:mm:ss");

    // Делаем первую букву дня недели и месяца заглавной
    const capitalized = formatted.replace(/^\w/, c => c.toUpperCase())
        .replace(/,\s(\d+)\s(\p{Ll}+)/u, (_, day, month) => `, ${day} ${month[0].toUpperCase()}${month.slice(1)}`);

    return (
        <div style={{ textAlign: 'center', fontSize: '2rem', margin: 0 }}>
            Сегодня {capitalized}
        </div>
    );
};

export default TimeHeader;
