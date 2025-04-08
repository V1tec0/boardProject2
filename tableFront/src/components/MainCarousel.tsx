import React, { useEffect, useState } from 'react';
import { Carousel, Row, Col, Spin, Alert, QRCode } from 'antd';
import TimeHeader from './TimeHeader';
import New from './New';
import { INews, NewsItem } from '../types';

interface ScheduleItem {
    type: string;
    url: string;
}

const MainCarouselLayout: React.FC = () => {
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [scheduleError, setScheduleError] = useState(false);
    const [newsError, setNewsError] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch('http://localhost:8000/api/schedule/').then(res => res.json()).catch(() => setScheduleError(true)),
            fetch('http://localhost:8000/api/displayed-news/').then(res => res.json()).catch(() => setNewsError(true))
        ]).then(([scheduleData, newsData]) => {
            if (scheduleData && scheduleData.schedules) setSchedules(scheduleData.schedules);
            if (newsData) setNews(newsData.map((item: INews) => item.news));
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return <Spin />;

    const scheduleTypes: { [key: string]: string } = {
        s: 'Студенты',
        p: 'Преподаватели',
        z: 'Заочники'
    };

    return (
        <div>
            <TimeHeader />

            <Row gutter={16} style={{ height: '90vh' }}>
                <Col span={12}>
                    {scheduleError ? (
                        <Alert message="Ошибка" description={
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50%', padding: '0 20px', borderRadius: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <QRCode value='https://maufk.ru/raspisanie/raspisanie.html' icon='https://maufk.ru/favicon.ico' size={400} bgColor='rgb(0, 119, 200)' color='white' />
                                </div>
                                <p style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 20px' }}>
                                    К сожалению, при загрузке расписания произошла ошибка. Отсканируйте данный QR-код для просмотра актуальных новостей
                                </p>
                            </div>} 
                        type="info" showIcon />
                    ) : (
                        <Carousel autoplay autoplaySpeed={5000} effect="fade">
                            {Object.keys(scheduleTypes).map(type => {
                                const scheduleItem = schedules.find(item => item.type === type);
                                return (
                                    <div key={type} style={{ textAlign: 'center' }}>
                                        <h3>{scheduleTypes[type]}</h3>
                                        {scheduleItem ? (
                                            <img
                                                src={`http://localhost:8000${scheduleItem.url}`}
                                                alt={scheduleTypes[type]}
                                                style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
                                            />
                                        ) : (
                                            <div>Нет расписания для {scheduleTypes[type]}</div>
                                        )}
                                    </div>
                                );
                            })}
                        </Carousel>
                    )}
                </Col>

                <Col span={12}>
                    {newsError ? (
                       <Alert message="Ошибка" description={
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50%', padding: '0 20px', borderRadius: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <QRCode value='https://maufk.ru/novosti/novosti.html' icon='https://maufk.ru/favicon.ico' size={400} bgColor='rgb(0, 119, 200)' color='white' />
                            </div>
                            <p style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 20px' }}>
                                К сожалению, при загрузке новостей произошла ошибка. Отсканируйте данный QR-код для просмотра актуального расписания
                            </p>
                        </div>} 
                    type="info" showIcon />
                    ) : (
                        <Carousel autoplay autoplaySpeed={5000} effect="fade">
                            {news.map((n, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', height: '90vh' }}>
                                    <New title={n.title} small_text={n.small_text} images={n.images} />
                                </div>
                            ))}
                        </Carousel>
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default MainCarouselLayout;
