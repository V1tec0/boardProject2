import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { NewsItem } from '../../types';

export default function NewsCard({
    news,
    isAvailable,
    onDelete,
}: {
    news: NewsItem;
    isAvailable: boolean;
    onDelete: (id: number) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: news.pk_news });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="news-card"
        >
            <h3>{news.title}</h3>
            <div className="news-content">
                {news.small_text.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                ))}
            </div>
            <div className="news-images">
                <img src={news.image} />
            </div>
            {isAvailable && (
                <button
                    className="delete-btn"
                    onClick={() => onDelete(news.pk_news)}
                >
                    Удалить новость
                </button>
            )}
        </div>
    );
}
