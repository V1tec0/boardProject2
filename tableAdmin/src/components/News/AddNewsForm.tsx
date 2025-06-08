import React, { useState } from 'react';
import { Modal, Input, Button, Upload, Form, Radio, message } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { PlusOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const AddNewsModal = ({ open, onClose }) => {
    const [form] = Form.useForm();
    const [inputType, setInputType] = useState('text');
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

    const handleSubmit = async (values) => {
        setLoading(true);
        const formData = new FormData();

        if (inputType === 'text') {
            formData.append('title', values.title);
            formData.append('small_text', values.smallText);
            formData.append('main_text', values.mainText);
        } else {
            formData.append('file_text', values.textFile?.file);
        }

        if (fileList.length > 0) {
            formData.append('image', fileList[0].originFileObj as File);
        }
 
        try {
            const csrfresponse = await fetch(`${import.meta.env.VITE_API_URL}csrf/`, {
                credentials: 'include',
            });
            console.log(csrfresponse)
            const xcsrfToken = csrfresponse.headers.get('X-CSRFToken');
            console.log(xcsrfToken)

            const sessionid = getCookie('sessionid')
            const csrfToken = getCookie('csrftoken')

            const response = await fetch(`${import.meta.env.VITE_API_URL}news/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': xcsrfToken,
                    'Cookie': `csrftoken=${csrfToken}; sessionid=${sessionid}`
                },
                credentials: 'include',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Ошибка сохранения новости');
            }

            message.success('Новость успешно добавлена!');
            form.resetFields();
            setFileList([]);
            onClose();
            window.location.reload();
        } catch (err: any) {
            message.error(err.message || 'Произошла ошибка');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Добавить новость"
            open={open}
            onCancel={onClose}
            footer={null}
            width={800}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Radio.Group
                    value={inputType}
                    onChange={(e) => setInputType(e.target.value)}
                    className="mb-4"
                >
                    <Radio.Button value="text">Ввести текст</Radio.Button>
                    <Radio.Button value="file">Загрузить файл</Radio.Button>
                </Radio.Group>

                {inputType === 'text' ? (
                    <>
                        <Form.Item
                            name="title"
                            label="Заголовок"
                            rules={[{ required: true, message: 'Введите заголовок' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="smallText"
                            label="Краткий текст"
                            rules={[{ required: true, message: 'Введите краткий текст' }]}
                        >
                            <TextArea rows={4} />
                        </Form.Item>
                        <Form.Item
                            name="mainText"
                            label="Основной текст"
                            rules={[{ required: true, message: 'Введите основной текст' }]}
                        >
                            <TextArea rows={6} />
                        </Form.Item>
                    </>
                ) : (
                    <Form.Item
                        name="textFile"
                        label="Текстовый файл"
                        rules={[{ required: true, message: 'Загрузите файл' }]}
                    >
                        <Upload
                            accept=".txt,.docx"
                            maxCount={1}
                            beforeUpload={() => false}
                        >
                            <Button icon={<PlusOutlined />}>Выбрать файл</Button>
                        </Upload>
                    </Form.Item>
                )}

                <Form.Item label="Изображения">
                    <Upload
                        listType="picture-card"
                        fileList={fileList}
                        onChange={({ fileList }) => setFileList(fileList.slice(-1))} // ← оставить только один
                        beforeUpload={(file) => {
                            const isImage = file.type.startsWith('image/');
                            if (!isImage) {
                                message.error('Можно загружать только изображения');
                            }
                            return false;
                        }}
                        accept="image/*"
                        maxCount={1}
                    >

                        <div>
                            <PlusOutlined />
                            <div style={{ marginTop: 8 }}>Загрузить</div>
                        </div>
                    </Upload>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Опубликовать
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddNewsModal