import { useRef, useState } from 'react';
import { Modal, Button, Upload, Card, Image, Select, message, Space } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';

interface BackgroundModalProps {
    open: boolean;
    onClose: () => void;
}

export default function BackgroundModal({ open, onClose }: BackgroundModalProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [horizontalIndex, setHorizontalIndex] = useState<number | null>(null);
    const [verticalIndex, setVerticalIndex] = useState<number | null>(null);

    const fileInput = useRef<HTMLInputElement>(null);

    const handleFileChange = ({ fileList }: any) => {
        const limited = fileList.slice(0, 2).map((f: any) => f.originFileObj);
        setFiles(limited);
        setHorizontalIndex(null);
        setVerticalIndex(null);
    };

    const getAvailableOptions = (exclude: number | null) =>
        files
            .map((file, index) => ({
                label: file.name,
                value: index,
                disabled: index === exclude,
            }))
            .filter(Boolean);

    const handleSubmit = async () => {
        const uploads: Promise<any>[] = [];

        const entries: [string, number | null][] = [
            ['horizontal', horizontalIndex],
            ['vertical', verticalIndex],
        ];

        for (const [orientation, index] of entries) {
            if (index !== null && files[index]) {
                const formData = new FormData();
                formData.append('image', files[index]);
                formData.append('orientation', orientation);
                uploads.push(
                    fetch('http://localhost:8000/api/change-background/', {
                        method: 'POST',
                        body: formData,
                    }),
                );
            }
        }

        try {
            await Promise.all(uploads);
            message.success('Фоны успешно обновлены');
            onClose();
        } catch {
            message.error('Ошибка при отправке фонов');
        }
    };

    const handleReset = async () => {
        const formData = new FormData();
        formData.append('reset', 'true');

        const res = await fetch('http://localhost:8000/api/change-background/', {
            method: 'DELETE',
            body: formData,
        });

        if (res.ok) {
            message.success('Фоны сброшены');
            setFiles([]);
            setHorizontalIndex(null);
            setVerticalIndex(null);
        } else {
            message.error('Ошибка при сбросе фонов');
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title="Управление фоном"
            footer={null}
            width={600}
        >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Upload
                    beforeUpload={() => false}
                    multiple
                    maxCount={1}
                    onChange={handleFileChange}
                    fileList={files.map((file, i) => ({
                        uid: `${i}`,
                        name: file.name,
                        status: 'done',
                        originFileObj: file,
                    }))}
                >
                    <Button icon={<UploadOutlined />}>Загрузить до 2 изображений</Button>
                </Upload>

                {files.map((file, index) => (
                    <Card
                        key={index}
                        title={file.name}
                        extra={<span>Изображение {index + 1}</span>}
                        style={{ width: '100%' }}
                    >
                        <Image
                            src={URL.createObjectURL(file)}
                            width="100%"
                            height={200}
                            style={{ objectFit: 'cover' }}
                        />
                    </Card>
                ))}

                {files.length > 0 && (
                    <>
                        <Select
                            style={{ width: '100%' }}
                            options={getAvailableOptions(verticalIndex)}
                            placeholder="Фон для горизонтального экрана"
                            value={horizontalIndex}
                            onChange={setHorizontalIndex}
                            allowClear
                        />
                        <Select
                            style={{ width: '100%' }}
                            options={getAvailableOptions(horizontalIndex)}
                            placeholder="Фон для вертикального экрана"
                            value={verticalIndex}
                            onChange={setVerticalIndex}
                            allowClear
                        />
                    </>
                )}

                <Space style={{ marginTop: 16, justifyContent: 'space-between', width: '100%' }}>
                    <Button
                        type="primary"
                        onClick={handleSubmit}
                        disabled={horizontalIndex === null && verticalIndex === null}
                    >
                        Отправить
                    </Button>
                    <Button danger icon={<DeleteOutlined />} onClick={handleReset}>
                        Сбросить фоны
                    </Button>
                    <Button onClick={onClose}>Отмена</Button>
                </Space>
            </Space>
        </Modal>
    );
}
