import { useState } from 'react';
import { Modal, Upload, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import './ScheduleModal.css';

interface EditScheduleModalProps {
    open: boolean;
    onClose: () => void;
    scheduleDate: string;
    scheduleType: 's' | 'p' | 'z';
}

const typeLabels = {
    's': 'студентов',
    'p': 'преподавателей',
    'z': 'заочников'
};

export default function EditScheduleModal({ open, onClose, scheduleDate, scheduleType }: EditScheduleModalProps) {
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [loading, setLoading] = useState(false);

    const getCookie = (name: string): string | null => {
        const cookies = document.cookie
            .split(';')
            .map(cookie => cookie.trim().split('='));

        const targetCookie = cookies.find(([cookieName]) => cookieName === name);

        return targetCookie
            ? decodeURIComponent(targetCookie[1]) // Декодируем значение
            : null;
    };

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

    const handleSubmit = async () => {
        if (fileList.length === 0) return;

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('file', fileList[0].originFileObj as File);
            formData.append('type', scheduleType);
            formData.append('date', scheduleDate);

            const csrfresponse = await fetch('http://localhost:8000/api/csrf/', {
                credentials: 'include',
            });
            const xcsrfToken = csrfresponse.headers.get('X-CSRFToken');
            console.log(xcsrfToken)

            const sessionid = getCookie('sessionid')
            const csrfToken = getCookie('csrftoken')

            const response = await fetch('http://localhost:8000/api/schedule/', {
                method: 'PATCH',
                headers: {
                    'X-CSRFToken': xcsrfToken,
                    'Cookie': `csrftoken=${csrfToken}; sessionid=${sessionid}`
                },
                credentials: 'include',
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Ошибка обновления расписания');
            }

            message.success('Расписание успешно обновлено');
            if ('caches' in window) {
                await caches.keys().then((names) => {
                    return Promise.all(names.map((name) => caches.delete(name)));
                });
            }

            sendReloadCommand()
            onClose();
        } catch (error: any) {
            message.error(error.message);
        } finally {
            setLoading(false);
            // window.location.reload();
        }
    };

    return (
        <Modal
            title="Изменить расписание"
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Отмена
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    onClick={handleSubmit}
                    disabled={fileList.length === 0}
                >
                    Обновить расписание
                </Button>,
            ]}
        >
            <div className="mb-4">
                <p>Дата: {scheduleDate}</p>
                <p>Тип: для {typeLabels[scheduleType]}</p>
            </div>

            <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
                beforeUpload={() => false}
                maxCount={1}
            >
                {fileList.length === 0 && (
                    <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Загрузить</div>
                    </div>
                )}
            </Upload>
        </Modal>
    );
}