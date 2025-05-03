// import React from 'react';
// import { Card, Row, Col } from 'antd';

// interface ImageProps {
//     pk_image: number;
//     title: string;
// }

// interface NewsProps {
//     title: string;
//     small_text: string;
//     images: ImageProps[];
// }

// const New: React.FC<NewsProps> = ({ title, small_text, images }) => {
//     return (
//         <div
//             style={{
//                 width: '90vw',
//                 maxWidth: 1000,
//                 display: 'flex',
//                 backgroundColor: '#fff',
//                 borderRadius: 12,
//                 boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
//                 overflow: 'hidden',
//                 margin: '1rem auto',
//             }}
//         >
//             {images?.[0] && (
//                 <img
//                     src={`${import.meta.env.VITE_MEDIA_URL}news/${images[0].title}`}
//                     alt="Новость"
//                     style={{
//                         width: '30%',
//                         aspectRatio: '1 / 1',
//                         objectFit: 'cover',
//                         borderRight: '1px solid #eee',
//                     }}
//                 />
//             )}
//             <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
//                 <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>{title}</h3>
//                 <p style={{ marginTop: '0.5rem', fontSize: '1rem', color: '#555' }}>{small_text}</p>
//             </div>
//         </div>

//     );
// };

// export default New;

import React from 'react';

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
        <div
            style={{
                width: '95%',
                maxWidth: '90vw',
                height: '200px',
                display: 'flex',
                backgroundColor: '#fff',
                borderRadius: 12,
                boxSizing: 'border-box',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                margin: '1rem',
                alignSelf: 'center', 
            }}
        >
            {images?.[0] && (
                <img
                    src={`${import.meta.env.VITE_MEDIA_URL}news/${images[0].title}`}
                    alt="Новость"
                    style={{
                        width: '200px',
                        height: '100%',
                        objectFit: 'cover',
                        flexShrink: 0,
                    }}
                />
            )}
            <div
                style={{
                    padding: '1rem',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    overflow: 'hidden',
                }}
            >
                <h3
                    style={{
                        margin: 0,
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {title}
                </h3>
                <p
                    style={{
                        marginTop: '0.5rem',
                        fontSize: '1rem',
                        color: '#555',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                    }}
                >
                    {small_text}
                </p>
            </div>
        </div>
    );
};

export default New;
