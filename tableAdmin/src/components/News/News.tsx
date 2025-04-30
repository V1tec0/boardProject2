import { useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverEvent
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import NewsColumn from './NewsColumn';
import NewsCard from './NewsCard';
import { NewsItem, Columns } from '../../types';
import './AdminPanel.css';
import AddNewsModal from './AddNewsForm';
import { Typography, Button, message as antdMessage, Modal } from 'antd';

const { Title } = Typography;

export default function News() {
    const [columns, setColumns] = useState<Columns>({
        available: [],
        displayed: [],
    });

    const [activeNews, setActiveNews] = useState<NewsItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [allNewsResponse, displayedResponse] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}news/`),
                    fetch(`${import.meta.env.VITE_API_URL}displayed-news/`)
                ]);

                if (!allNewsResponse.ok || !displayedResponse.ok) {
                    throw new Error('Ошибка загрузки данных');
                }

                const allNews: NewsItem[] = await allNewsResponse.json();
                const displayedData = await displayedResponse.json();

                // Обрабатываем displayedData, учитывая структуру с сервера
                const displayedNews = displayedData.map((item: any) => ({
                    ...item.news,
                    column: 'displayed'
                }));

                setColumns({
                    available: allNews.filter(n =>
                        !displayedNews.some(d => d.pk_news === n.pk_news)
                    ),
                    displayed: displayedNews
                });
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
            }
        };

        loadData();
    }, []);

    const handleDragStart = (event: any) => {
        const { active } = event;
        const item = [...columns.available, ...columns.displayed].find(
            (item) => item.pk_news === active.id
        );
        setActiveNews(item || null);
    };

    const getCookie = (name: string): string | null => {
        const cookies = document.cookie
            .split(';')
            .map(cookie => cookie.trim().split('='));

        const targetCookie = cookies.find(([cookieName]) => cookieName === name);

        return targetCookie
            ? decodeURIComponent(targetCookie[1]) // Декодируем значение
            : null;
    };

    const findColumnAndIndex = (id: number | string) => {
        // Проверяем, является ли id идентификатором колонки
        if (id === 'available' || id === 'displayed') {
            return { column: id, index: -1 };
        }

        // Ищем в колонке available
        const availableIndex = columns.available.findIndex(item => item.pk_news === id);
        if (availableIndex !== -1) {
            return { column: 'available', index: availableIndex };
        }

        // Ищем в колонке displayed
        const displayedIndex = columns.displayed.findIndex(item => item.pk_news === id);
        if (displayedIndex !== -1) {
            return { column: 'displayed', index: displayedIndex };
        }

        return null;
    };

    const sendReloadCommand = async () => {
        try {
            const csrfresponse = await fetch(`${import.meta.env.VITE_API_URL}csrf/`, {
                credentials: 'include',
            });
            const xcsrfToken = csrfresponse.headers.get('X-CSRFToken');
            console.log(xcsrfToken)

            const sessionid = getCookie('sessionid')
            const csrfToken = getCookie('csrftoken')

            const response = await fetch(`${import.meta.env.VITE_API_URL}messages/reload/`, {
                method: 'GET',
                headers: {
                    'X-CSRFToken': xcsrfToken,
                    'Cookie': `csrftoken=${csrfToken}; sessionid=${sessionid}`
                },
                credentials: 'include'
            });

            const data = await response.json();
            console.log('Ответ сервера:', data);
        } catch (error) {
            console.error('Ошибка при отправке команды перезагрузки:', error);
        }
    };



    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeInfo = findColumnAndIndex(active.id);
        const overInfo = findColumnAndIndex(over.id);

        if (!activeInfo || !overInfo?.column) return;

        const activeColumn = activeInfo.column;
        const overColumn = overInfo.column;

        if (activeColumn === overColumn) {
            // Перемещение внутри одной колонки
            if (activeInfo.index !== -1 && overInfo.index !== -1) {
                setColumns(prev => ({
                    ...prev,
                    [activeColumn]: arrayMove(
                        prev[activeColumn],
                        activeInfo.index,
                        overInfo.index
                    )
                }));
            }
        } else {
            // Перемещение между колонками
            setColumns(prev => {
                const item = prev[activeColumn].find(i => i.pk_news === active.id);
                if (!item) return prev;

                const newColumns = {
                    ...prev,
                    [activeColumn]: prev[activeColumn].filter(i => i.pk_news !== active.id)
                };

                const targetArray = [...newColumns[overColumn]];
                const insertIndex = overInfo.index !== -1 ?
                    overInfo.index :
                    targetArray.length;

                targetArray.splice(insertIndex, 0, { ...item, column: overColumn });

                return {
                    ...newColumns,
                    [overColumn]: targetArray
                };
            });
        }
    };

    const onDelete = (id: number) => {
        Modal.confirm({
            title: 'Удалить новость?',
            content: 'Новость будет полностью удалена из системы',
            okText: 'Удалить',
            cancelText: 'Отмена',
            onOk: async () => {
                try {
                    const csrfresponse = await fetch(`${import.meta.env.VITE_API_URL}csrf/`, {
                        credentials: 'include',
                    });
                    const xcsrfToken = csrfresponse.headers.get('X-CSRFToken');
                    console.log(xcsrfToken)

                    const sessionid = getCookie('sessionid')
                    const csrfToken = getCookie('csrftoken')

                    await fetch(`${import.meta.env.VITE_API_URL}news/${id}/`, {
                        method: 'DELETE',
                        headers: {
                            'X-CSRFToken': xcsrfToken,
                            'Cookie': `csrftoken=${csrfToken}; sessionid=${sessionid}`
                        },
                        credentials: 'include',
                    });
                    // Обновляем данные...
                } catch {
                    antdMessage.error('Ошибка удаления');
                } finally {
                    window.location.reload()
                }
            }
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveNews(null);

        const { active, over } = event;
        if (!over) return;

        const activeInfo = findColumnAndIndex(active.id);
        const overInfo = findColumnAndIndex(over.id);

        if (!activeInfo || !overInfo?.column) return;
    };

    const saveChanges = async () => {
        try {
            const csrfresponse = await fetch(`${import.meta.env.VITE_API_URL}csrf/`, {
                credentials: 'include',
            });
            const xcsrfToken = csrfresponse.headers.get('X-CSRFToken');
            console.log(xcsrfToken)

            const sessionid = getCookie('sessionid')
            const csrfToken = getCookie('csrftoken')

            const response = await fetch(`${import.meta.env.VITE_API_URL}update-displayed-news/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': xcsrfToken,
                    'Cookie': `csrftoken=${csrfToken}; sessionid=${sessionid}`,
                },
                credentials: 'include',
                body: JSON.stringify({
                    news_ids: columns.displayed.map((n) => n.pk_news),
                }),
            });

            if (!response.ok) {
                throw new Error('Ошибка сохранения изменений');
            }

            antdMessage.success('Изменения успешно сохранены!');
            sendReloadCommand()
        } catch (error) {
            console.error('Ошибка:', error);
            antdMessage.error('Не удалось сохранить изменения');
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    return (
        <div style={{ marginBottom: '20px' }}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
            >
                <div className="news-container">
                    <Title level={1}>Управление новостями</Title>
                    <Button type="primary" onClick={() => setIsModalOpen(true)} style={{marginBottom: '20px'}}>
                        Добавить новость
                    </Button>
                    <div className="columns-wrapper">
                        <NewsColumn
                            id="available"
                            items={columns.available}
                            title="Все новости"
                            onDelete={onDelete}
                        />
                        <NewsColumn
                            id="displayed"
                            items={columns.displayed}
                            title="Отображаемые новости"
                            onDelete={onDelete}
                        />
                    </div>

                    <Button type="primary" onClick={saveChanges} style={{ marginTop: 16, marginBottom: 40 }}>
                        Сохранить изменения
                    </Button>

                    <DragOverlay>
                        {activeNews ? <NewsCard news={activeNews} /> : null}
                    </DragOverlay>
                </div>
                <AddNewsModal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            </DndContext>
        </div>
    );
}