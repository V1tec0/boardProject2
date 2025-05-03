import React, { useEffect, useState } from 'react';
import { Carousel, Row, Col, Spin, Alert, QRCode, Flex } from 'antd';
import TimeHeader from './TimeHeader';
import New from './New';
import { INews, NewsItem } from '../types';
import ScheduleSlider from './Schedule';

interface ScheduleItem {
    type: string;
    url: string;
}

const slideStyle: React.CSSProperties = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    boxSizing: 'border-box',
};

const imageStyle: React.CSSProperties = {
    width: '90vw',
    maxHeight: '80vh',
    objectFit: 'contain' as const,
};

const newsSlideStyle: React.CSSProperties = {
    ...slideStyle,
    gap: '1rem',
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
        const scheduleMap = {
            s: schedules.find(s => s.type === 's'),
            p: schedules.find(s => s.type === 'p'),
            z: schedules.find(s => s.type === 'z'),
        };

        const base = import.meta.env.VITE_HOST;

        const getNewsChunk = (start: number) =>
            news.slice(start, start + 3).map((n, i) => (
                <New key={i} {...n} />
            ));

        const portraitSlides = [];

        if (scheduleMap.s) {
            portraitSlides.push(
                <div key="slide-schedule-s" style={slideStyle}>
                    <h3>Студенты</h3>
                    <img
                        src={`${base}${scheduleMap.s.url}`}
                        style={imageStyle}
                        alt="Расписание студентов"
                    />
                </div>
            );
            portraitSlides.push(
                <div key="slide-news-s" style={newsSlideStyle}>
                    {getNewsChunk(0)}
                </div>
            );
        }

        if (scheduleMap.p) {
            portraitSlides.push(
                <div key="slide-schedule-p" style={slideStyle}>
                    <h3>Преподаватели</h3>
                    <img
                        src={`${base}${scheduleMap.p.url}`}
                        style={imageStyle}
                        alt="Расписание преподавателей"
                    />
                </div>
            );
            portraitSlides.push(
                <div key="slide-news-p" style={newsSlideStyle}>
                    {getNewsChunk(3)}
                </div>
            );
        }

        if (scheduleMap.z) {
            portraitSlides.push(
                <div key="slide-schedule-z" style={slideStyle}>
                    <h3>Заочники</h3>
                    <img
                        src={`${base}${scheduleMap.z.url}`}
                        style={imageStyle}
                        alt="Расписание заочников"
                    />
                </div>
            );
            portraitSlides.push(
                <div key="slide-news-z" style={newsSlideStyle}>
                    {getNewsChunk(6)}
                </div>
            );
        }

        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flexShrink: 0 }}>
                    <TimeHeader />
                </div>
                <div style={{ flexGrow: 1 }}>
                    <Carousel
                        autoplay
                        dots={false}
                        effect="scrollx"
                        style={{ height: '100%' }}
                    >
                        {portraitSlides}
                    </Carousel>
                </div>
            </div>
        );
    }



    return (
        <div>
            <TimeHeader />
            <div style={{ 
                display: 'flex',
                position: 'relative',
                marginLeft: '-14vw',
                marginRight: '-10vw',
                height: '90vh', 
                width: '100%', 
                maxWidth: '90vw',
                padding: 0, 
                gap: 0
                }}
                >
                <Col span={15} style={{ padding: 0 }}>
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

                <Col span={20} style={{ padding: 0 }}>
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
                                <div key={index} style={{
                                    height: '100vh',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100vw', // 🟢 Увеличиваем ширину слайда новостей
                                    margin: 0,
                                    gap: '1rem',
                                    padding: '1rem',
                                    boxSizing: 'border-box',
                                }}>
                                    {group.map((n, i) => (
                                        <New key={i} title={n.title} small_text={n.small_text} images={n.images} />
                                    ))}
                                </div>
                            ))}
                        </Carousel>
                    )}
                </Col>
            </div>
        </div>
    );
};

export default MainCarouselLayout;
