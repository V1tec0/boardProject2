import { useState, useRef } from 'react';
import { Modal, Button, Select, message, Card, Space } from 'antd';
import { UploadOutlined, CloseOutlined } from '@ant-design/icons';

type ScheduleType = 's' | 'p' | 'z';

interface ScheduleFile {
    file: File;
    preview: string;
    type: ScheduleType | '';
}

export default function ScheduleModal({ onClose, onUpdate }: { onClose: () => void, onUpdate: () => void }) {
    const [files, setFiles] = useState<ScheduleFile[]>([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const sendReloadCommand = async () => {
        try {
            const csrfresponse = await fetch('http://localhost:8000/api/csrf/', {
                credentials: 'include',
            });
            console.log(csrfresponse)
            const xcsrfToken = csrfresponse.headers.get('X-CSRFToken');
            console.log(xcsrfToken)

            const sessionid = getCookie('sessionid')
            const csrfToken = getCookie('csrftoken')

            const response = await fetch(`http://localhost:8000/api/messages/reload/`, { 
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

    const getCookie = (name: string): string | null => {
        const cookies = document.cookie
            .split(';')
            .map(cookie => cookie.trim().split('='));

        const targetCookie = cookies.find(([cookieName]) => cookieName === name);

        return targetCookie
            ? decodeURIComponent(targetCookie[1]) // Декодируем значение
            : null;
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).slice(0, 3).map(file => ({
                file,
                preview: URL.createObjectURL(file),
                type: '' as ScheduleType
            }));
            setFiles(prev => [...prev, ...newFiles].slice(0, 3));
        }
    };

    const handleTypeChange = (index: number, type: ScheduleType) => {
        const updatedFiles = [...files];
        updatedFiles[index].type = type;
        setFiles(updatedFiles);
    };

    const handleRemoveFile = (index: number) => {
        const updatedFiles = files.filter((_, i) => i !== index);
        URL.revokeObjectURL(files[index].preview);
        setFiles(updatedFiles);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            setLoading(true);
            
            const uploadPromises = files.map(async (item) => {
                if (!item.type) throw new Error('Выберите тип для всех файлов');

                const csrfresponse = await fetch('http://localhost:8000/api/csrf/', {
                    method: 'GET',
                    credentials: 'include',
                });

                const xcsrfToken = csrfresponse.headers.get('X-CSRFToken');
                console.log(xcsrfToken)

                const sessionid = getCookie('sessionid')
                const csrfToken = getCookie('csrftoken')
                
                const formData = new FormData();
                formData.append('file', item.file);
                formData.append('type', item.type);

                const response = await fetch('http://localhost:8000/api/schedule/', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': xcsrfToken || undefined,
                        'Cookie': `csrftoken=${csrfToken}; sessionid=${sessionid}`
                    },
                    credentials: 'include',
                    body: formData,
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Ошибка загрузки');
                }
                

                return response.json();
            });

            await Promise.all(uploadPromises);
            
            sendReloadCommand()
            onUpdate();
            onClose();
        } catch (error: any) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Добавить расписание"
            open={true}
            onCancel={onClose}
            footer={[
                <Button 
                    key="submit" 
                    type="primary" 
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={files.length === 0 || files.some(f => !f.type)}
                >
                    Сохранить расписание
                </Button>
            ]}
        >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    hidden
                />
                <Button 
                    icon={<UploadOutlined />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={files.length >= 3}
                >
                    Загрузить файлы (макс. 3)
                </Button>

                <Space direction="horizontal" wrap style={{ width: '100%', justifyContent: 'center' }}>
                    {files.map((item, index) => (
                        <Card
                            key={index}
                            style={{ width: 200 }}
                            cover={
                                <div style={{ position: 'relative' }}>
                                    <img
                                        alt="Preview"
                                        src={item.preview}
                                        style={{ width: '100%', height: 150, objectFit: 'cover' }}
                                    />
                                    <Button
                                        type="text"
                                        icon={<CloseOutlined />}
                                        onClick={() => handleRemoveFile(index)}
                                        style={{
                                            position: 'absolute',
                                            top: 5,
                                            right: 5,
                                            background: 'rgba(255, 255, 255, 0.8)',
                                            borderRadius: '50%',
                                            minWidth: 'auto',
                                            padding: 4
                                        }}
                                    />
                                </div>
                            }
                        >
                            <Select
                                style={{ width: '100%' }}
                                value={item.type}
                                onChange={(value) => handleTypeChange(index, value as ScheduleType)}
                                placeholder="Выберите тип"
                            >
                                <Select.Option value="s">Для студентов</Select.Option>
                                <Select.Option value="p">Для преподавателей</Select.Option>
                                <Select.Option value="z">Для заочников</Select.Option>
                            </Select>
                        </Card>
                    ))}
                </Space>
            </Space>
        </Modal>
    );
}