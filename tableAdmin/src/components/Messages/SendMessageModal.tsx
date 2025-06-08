import { Modal, Form, Radio, InputNumber, DatePicker, Checkbox, TimePicker } from 'antd';
import { useEffect } from 'react';
import dayjs from 'dayjs';

type Props = {
    visible: boolean;
    onCancel: () => void;
    onSend: (data: {
        messageId: number;
        target: 'all' | 'client';
        showAt: string | null;
        duration: number;
        isshowing: boolean
        interruptible: boolean;
    }) => void;
    messageId: number | null;
    target: 'all' | 'client';
    isshowing: boolean;
};

export default function SendMessageModal({ visible, onCancel, onSend, messageId, target, isshowing }: Props) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) form.resetFields();
    }, [visible]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            const finalDuration =
                values.duration === 'custom'
                    ? values.customDuration
                    : values.duration; // может быть null

            const result = {
                messageId: messageId!,
                target,
                showAt: values.showMode === 'now' ? null : values.startAt.format('HH:mm:ss'),
                duration: finalDuration,
                isshowing,
                interruptible: values.interruptible
            };

            onSend(result);
        } catch {
            // validation error — do nothing
        }
    };

    return (
        <Modal
            open={visible}
            title="Отправка сообщения"
            onCancel={onCancel}
            onOk={handleOk}
            okText="Отправить"
        >
            <Form form={form} layout="vertical" initialValues={{ showMode: 'now', duration: 10, interruptible: true }}>
                <Form.Item name="showMode" label="Когда показать?">
                    <Radio.Group>
                        <Radio value="now">Сейчас</Radio>
                        <Radio value="delayed">В указанное время</Radio>
                    </Radio.Group>
                </Form.Item>

                <Form.Item shouldUpdate noStyle>
                    {({ getFieldValue }) =>
                        getFieldValue('showMode') === 'delayed' && (
                            <Form.Item
                                name="startAt"
                                label="Время показа"
                                style={{width: '50%'}}
                                rules={[{ required: true, message: 'Укажите дату и время' }]}
                            >
                                <TimePicker
                                    style={{width: '50%'}}
                                    format="HH:mm:ss"
                                />
                            </Form.Item>
                        )
                    }
                </Form.Item>

                <Form.Item name="duration" label="Длительность показа">
                    <Radio.Group>
                        <Radio value={5}>5 сек</Radio>
                        <Radio value={10}>10 сек</Radio>
                        <Radio value={15}>15 сек</Radio>
                        <Radio value="custom">Другое</Radio>
                        <Radio value={null}>Без ограничения</Radio>
                    </Radio.Group>
                </Form.Item>


                <Form.Item shouldUpdate noStyle>
                    {({ getFieldValue }) =>
                        getFieldValue('duration') === 'custom' && (
                            <Form.Item
                                name="customDuration"
                                label="Введите длительность (сек)"
                                rules={[{ required: true, message: 'Введите значение' }]}
                            >
                                <InputNumber min={1} max={600} style={{ width: '100%' }} />
                            </Form.Item>
                        )
                    }
                </Form.Item>

            </Form>
        </Modal>
    );
}
