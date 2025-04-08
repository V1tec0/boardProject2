import React, { useState } from 'react';
import { Button } from 'antd';
import './Messages.css';

type MessageProps = {
    pk_message: number,
    text: string,
    isprimary: boolean,
    onClick: (id: number) => void
    onDelete: (id: number) => void
}

export default function Message(props: MessageProps) {
    const { pk_message, text, isprimary, onClick, onDelete } = props;
    const [isShowing, setIsShowing] = useState(false);

    const handleClick = () => {
        setIsShowing(!isShowing);
        onClick(pk_message);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        // Предотвращаем срабатывание клика по карточке
        e.stopPropagation();
        onDelete(pk_message)
    };

    const getContentClassName = () => {
        const classes = ['message-content'];
        if (isShowing) classes.push('active');
        if (isprimary) classes.push('primary');
        return classes.join(' ');
    };

    return (
        <li className="message-container">
            <div className="message-card" onClick={handleClick}>
                <div className={getContentClassName()}>
                    <div className="message-header">
                        {text}
                    </div>
                    <div className="message-footer">
                        <span className="message-status">
                            Статус: {isprimary ? 'Важное' : 'Обычное'}
                        </span>
                        <Button 
                            danger
                            disabled={isShowing}
                            type="primary"
                            onClick={handleDeleteClick}
                        >
                            Удалить
                        </Button>
                    </div>
                </div>
            </div>
        </li>
    );
}