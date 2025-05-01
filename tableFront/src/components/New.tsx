import React from 'react';
import { Card, Row, Col } from 'antd';

interface ImageProps {
    pk_image: number;
    title: string;
}

interface NewsProps {
    title: string;
    small_text: string;
    images: ImageProps[];
}

const New: React.FC<NewsProps> = ({ title, small_text, images }) => {
    return (
        <Card style={{
            width: '100%',
            maxWidth: '600px',
            height: 'auto',
            marginBottom: '1rem',
        }}>
            <Row style={{ height: '100%' }}>
                <Col span={8}>
                    {images.length > 0 && (
                        <img
                            src={`${import.meta.env.VITE_MEDIA_URL}news/${images[0].title}`}
                            alt={title}
                            style={{
                                width: '100%',
                                height: '100%',
                                maxHeight: '200px',
                                objectFit: 'cover',
                            }}
                        />
                    )}
                </Col>
                <Col
                    span={16}
                    style={{
                        paddingLeft: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    }}
                >
                    <div style={{ fontWeight: 'bold', marginBottom: 5, fontSize: '18px' }}>{title}</div>
                    <div style={{ fontSize: '16px' }}>{small_text}</div>
                </Col>
            </Row>
        </Card>
    );
};

export default New;
