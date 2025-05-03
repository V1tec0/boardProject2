import React, { useEffect, useState } from 'react';
import { Button } from 'antd';
import './Messages.css';

type MessageProps = {
    pk_message: number;
    text: string;
    isprimary: boolean;
    isshowing?: boolean;
    duration?: number | null;
    onClick: (id: number) => void;
    onDelete: (id: number) => void;
    onContextMenu: (e: React.MouseEvent) => void;
};

export default function Message(props: MessageProps) {
    const { pk_message, text, isprimary, isshowing, duration, onClick, onDelete, onContextMenu } = props;

    const [countdown, setCountdown] = useState<number | null>(null);

    // таймер запускается только при входе в активное состояние и наличии duration
    useEffect(() => {
        if (isshowing && duration && countdown === null) {
            setCountdown(duration);
        }
    }, [isshowing, duration]);

    useEffect(() => {
        let timer: any;
        if (countdown && countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => (prev ? prev - 1 : null));
            }, 1000);
        } else if (countdown === 0) {
            setCountdown(null); // очищаем когда дошло до 0
        }

        return () => clearInterval(timer);
    }, [countdown]);

    const handleClick = () => {
        onClick(pk_message);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(pk_message);
    };

    const getContentClassName = () => {
        const classes = ['message-content'];
        if (isshowing) classes.push('active');
        if (isprimary) classes.push('primary');
        return classes.join(' ');
    };

    return (
        <li className="message-container" onContextMenu={onContextMenu}>
            <div className="message-card" onClick={handleClick}>
                <div className={getContentClassName()}>
                    <div className="message-header">{text}</div>
                    <div className="message-footer">
                        <span className="message-status">
                            Статус: {isprimary ? 'Важное' : 'Обычное'}
                            {isshowing && duration && countdown !== null && (
                                <> – отображается: {countdown} сек</>
                            )}
                        </span>
                        <Button
                            type={isshowing ? 'primary' : 'default'}
                            danger
                            disabled={isshowing}
                            onClick={handleDeleteClick}
                        >
                            {isshowing ? 'Отображается' : 'Удалить'}
                        </Button>
                    </div>
                </div>
            </div>
        </li>
    );
}
