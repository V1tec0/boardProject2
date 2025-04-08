import React, { useEffect, useState } from 'react';
import { List, Spin, Alert } from 'antd';
import New from './New';
import { INews, NewsItem } from '../types';

const NewsBlock: React.FC = () => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/displayed-news/');
                const data = await response.json();
                // Извлекаем поле news из каждого элемента ответа
                setNews(data.map((item: INews) => item.news));
            } catch {
                setError('Не удалось загрузить новости');
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    if (loading) return <Spin tip="Загрузка новостей..." />;
    if (error) return <Alert message="Ошибка" description={error} type="error" showIcon />;

    return (
        <List
            dataSource={news}
            renderItem={(item) => (
                <List.Item>
                    <New title={item.title} small_text={item.small_text} images={item.images} />
                </List.Item>
            )}
        />
    );
};

export default NewsBlock;
