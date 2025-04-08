import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import NewsCard from './NewsCard';
import { NewsItem } from '../../types';

export default function NewsColumn({
    id,
    items,
    title,
    onDelete,
}: {
    id: 'available' | 'displayed';
    items: NewsItem[];
    title: string;
    onDelete: (id: number) => void;
}) {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className={`news-column ${id}`}>
            <h2>{title}</h2>
            <div className="scroll-container">
                <SortableContext items={items} strategy={verticalListSortingStrategy}>
                    {items.map(news => (
                        <NewsCard
                            key={news.pk_news}
                            news={news}
                            isAvailable={id === 'available'}
                            onDelete={onDelete}
                        />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
}
