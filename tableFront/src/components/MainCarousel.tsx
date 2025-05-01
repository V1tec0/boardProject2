import React, { useEffect, useState } from 'react';
import { Carousel, Row, Col, Spin, Alert, QRCode } from 'antd';
import TimeHeader from './TimeHeader';
import New from './New';
import { INews, NewsItem } from '../types';
import ScheduleSlider from './Schedule';

interface ScheduleItem {
    type: string;
    url: string;
}

const scheduleTypes: { [key: string]: string } = {
    s: 'Студенты',
    p: 'Преподаватели',
    z: 'Заочники'
};

const MainCarouselLayout: React.FC<{ isPortrait: boolean }> = ({ isPortrait }) => {
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [scheduleError, setScheduleError] = useState(false);
    const [newsError, setNewsError] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch(`${import.meta.env.VITE_API_URL}schedule/`).then(res => res.json()).catch(() => setScheduleError(true)),
            fetch(`${import.meta.env.VITE_API_URL}displayed-news/`).then(res => res.json()).catch(() => setNewsError(true))
        ]).then(([scheduleData, newsData]) => {
            if (scheduleData && scheduleData.schedules) setSchedules(scheduleData.schedules);
            if (newsData) setNews(newsData.map((item: INews) => item.news));
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return <Spin size="large" style={{ marginTop: '30vh' }} />;

    const maxNewsCount = schedules.length === 2 ? 6 : 9;
    const limitedNews = news.slice(0, maxNewsCount);
    const chunkedNews = [];
    for (let i = 0; i < limitedNews.length; i += 3) {
        chunkedNews.push(limitedNews.slice(i, i + 3));
    }

    if (isPortrait) {
        return (
            <div>
                <TimeHeader />
                <Carousel autoplay vertical dots={false} style={{ height: '100vh' }}>
                    {schedules.map((scheduleItem) => (
                        <div key={scheduleItem.type} style={{ textAlign: 'center' }}>
                            <h3>{scheduleTypes[scheduleItem.type]}</h3>
                            <img
                                src={`${import.meta.env.VITE_BASE_URL}${scheduleItem.url}`}
                                alt={scheduleTypes[scheduleItem.type]}
                                style={{ maxHeight: '85vh', maxWidth: '90vw', objectFit: 'contain' }}
                            />
                        </div>
                    ))}

                    {chunkedNews.map((group, index) => (
                        <div key={index} style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            {group.map((n, i) => (
                                <New key={i} title={n.title} small_text={n.small_text} images={n.images} />
                            ))}
                        </div>
                    ))}
                </Carousel>
            </div>
        );
    }

    return (
        <div>
            <TimeHeader />
            <Row gutter={16} style={{ height: '90vh' }}>
                <Col span={12}>
                    {scheduleError ? (
                        <Alert
                            message="Ошибка"
                            description={
                                <div style={{ display: 'flex', alignItems: 'center', padding: 20 }}>
                                    <QRCode value='https://maufk.ru/raspisanie/raspisanie.html' icon='https://maufk.ru/favicon.ico' size={200} />
                                    <p style={{ marginLeft: 20 }}>
                                        К сожалению, при загрузке расписания произошла ошибка. Отсканируйте QR-код для просмотра.
                                    </p>
                                </div>
                            }
                            type="info"
                            showIcon
                        />
                    ) : (
                        <ScheduleSlider />
                    )}
                </Col>

                <Col span={12}>
                    {newsError ? (
                        <Alert
                            message="Ошибка"
                            description={
                                <div style={{ display: 'flex', alignItems: 'center', padding: 20 }}>
                                    <QRCode value='https://maufk.ru/novosti/novosti.html' icon='https://maufk.ru/favicon.ico' size={200} />
                                    <p style={{ marginLeft: 20 }}>
                                        Ошибка загрузки новостей. Отсканируйте QR-код для просмотра.
                                    </p>
                                </div>
                            }
                            type="info"
                            showIcon
                        />
                    ) : (
                        <Carousel autoplay autoplaySpeed={5000} effect="fade">
                            {chunkedNews.map((group, index) => (
                                <div key={index} style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    {group.map((n, i) => (
                                        <New key={i} title={n.title} small_text={n.small_text} images={n.images} />
                                    ))}
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
