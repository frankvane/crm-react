import React, { useEffect } from 'react';
import { Modal, Form, Input, Cascader, Select, message } from 'antd';
import { useUpdatePatientMutation } from '@/api/query/usePatientQuery';
import type { Patient } from './PatientList';
import { hybridEncrypt } from './SecretKey';

// RSA 公钥字符串
const RSA_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxs3MYClwvG9wlHQTthGD
/bI9gK436bvq/ikQnPKAxdzPt31Nf0Sn0v4SlHJtzjv5S3ipymR5o+Z5tDD/hO8O
dB53jgUibzIeP7+OuO14vd1pqYfS+ksW4riYMC8xQYhfW+UTL0h5wy8zmKeLBwvG
v7VpBAJGVZze9C+DUN2oIz0Pybvt+nqTzOXwQ/ehSVqR5LfJFNs7piTrf2+bEe9M
oz+hyx0AsPKtGllJuGOp+hegHSVI1IqhFwYXxH5thV90Dl3epovkYTz99bRUyjfa
GJKZrwFjNUbkYjNsv+Hai5SuvB+C0pDgiRJsbklw7S6h+pC4bxaS898YPtcxFUjn
fQIDAQAB
-----END PUBLIC KEY-----`;

interface EditPatientModalProps {
    visible: boolean;
    patient: Patient | null;
    onClose: () => void;
}

const EditPatientModal: React.FC<EditPatientModalProps> = ({ visible, patient, onClose }) => {
    const [form] = Form.useForm();
    const updateMutation = useUpdatePatientMutation({
        onSuccess: () => {
            message.success('病患信息已更新');
            onClose();
            form.resetFields();
        }
    });

    // 生成年份、月份、日期三级联动数据
    const getDateCascaderOptions = () => {
        const years = [];
        const currentYear = new Date().getFullYear();
        for (let y = currentYear; y >= 1900; y--) {
            const months = [];
            for (let m = 1; m <= 12; m++) {
                const days = [];
                const daysInMonth = new Date(y, m, 0).getDate();
                for (let d = 1; d <= daysInMonth; d++) {
                    days.push({ value: d, label: d + '日' });
                }
                months.push({ value: m, label: m + '月', children: days });
            }
            years.push({ value: y, label: y + '年', children: months });
        }
        return years;
    };
    const dateCascaderOptions = getDateCascaderOptions();

    useEffect(() => {
        if (visible && patient) {
            // birthday 处理为数组，兼容多种格式
            let birthday = patient.birthday;
            let birthdayArr;
            if (typeof birthday === 'string') {
                // 兼容 '2025-04-29 00:00:00.0000000 +00:00' 或 '2025-04-29' 等格式
                const match = birthday.match(/(\d{4})-(\d{2})-(\d{2})/);
                if (match) {
                    birthdayArr = [Number(match[1]), Number(match[2]), Number(match[3])];
                }
            }
            form.setFieldsValue({ ...patient, birthday: birthdayArr });
        }
    }, [visible, patient, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (Array.isArray(values.birthday) && values.birthday.length === 3) {
                values.birthday = `${values.birthday[0]}-${String(values.birthday[1]).padStart(2, '0')}-${String(values.birthday[2]).padStart(2, '0')}`;
            }
            // 校验 birthday 格式
            if (
                !values.birthday ||
                !/^\d{4}-\d{2}-\d{2}$/.test(values.birthday) ||
                isNaN(new Date(values.birthday).getTime())
            ) {
                message.error('出生日期格式不正确');
                return;
            }
            if (typeof values.gender === 'string') {
                values.gender = Number(values.gender);
            }
            if (patient) {
                const encryptedData = await hybridEncrypt(values, RSA_PUBLIC_KEY_PEM);
                updateMutation.mutate({ id: patient.id, data:encryptedData });
            }
        } catch { }
    };

    return (
        <Modal
            title="编辑患者"
            open={visible}
            onOk={handleOk}
            onCancel={onClose}
            confirmLoading={updateMutation.isPending}
            destroyOnClose
        >
            <Form
                key={patient ? patient.id : 'empty'}
                form={form}
                preserve={false}
                labelCol={{ span: 6 }}
                initialValues={patient ? {
                    ...patient,
                    gender: typeof patient.gender === 'string' ? Number(patient.gender) : patient.gender,
                    birthday: (typeof patient.birthday === 'string' && patient.birthday.split('-').length === 3)
                        ? patient.birthday.split('-').map((v, i) => Number(v))
                        : undefined,
                } : {}}
            >
                <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
                    <Input placeholder="请输入姓名" />
                </Form.Item>
                <Form.Item name="gender" label="性别" rules={[{ required: true, message: '请选择性别' }]}>
                    <Select placeholder="请选择性别"><Select.Option value={1}>男</Select.Option><Select.Option value={0}>女</Select.Option></Select>
                </Form.Item>
                <Form.Item name="birthday" label="出生日期" rules={[{ required: true, message: '请输入出生日期' }]}
                    getValueFromEvent={val => val ? `${val[0]}-${String(val[1]).padStart(2, '0')}-${String(val[2]).padStart(2, '0')}` : undefined}
                    getValueProps={val => {
                        if (!val) return { value: undefined };
                        if (Array.isArray(val)) return { value: val };
                        if (typeof val === 'string') {
                            const arr = val.split('-');
                            return { value: arr.length === 3 ? [Number(arr[0]), Number(arr[1]), Number(arr[2])] : undefined };
                        }
                        return { value: undefined };
                    }}
                >
                    <Cascader
                        options={dateCascaderOptions}
                        placeholder="请选择出生日期"
                        style={{ width: '100%' }}
                        allowClear
                        changeOnSelect
                    />
                </Form.Item>
                <Form.Item name="phone" label="手机号" rules={[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }]}>
                    <Input placeholder="请输入手机号" />
                </Form.Item>
                <Form.Item name="id_card" label="身份证号" rules={[{ required: true, message: '请输入身份证号' }, { pattern: /^(\d{15}|\d{17}[\dXx])$/, message: '请输入有效的身份证号' }]}>
                    <Input placeholder="请输入身份证号" />
                </Form.Item>
                <Form.Item name="address" label="家庭住址">
                    <Input placeholder="请输入家庭住址" />
                </Form.Item>
                <Form.Item name="emergency_contact" label="紧急联系人" rules={[{ required: true, message: '请输入紧急联系人' }, { min: 2, max: 10, message: '紧急联系人姓名长度2-10位' }]}>
                    <Input placeholder="请输入紧急联系人" />
                </Form.Item>
                <Form.Item name="emergency_phone" label="紧急联系电话" rules={[{ required: true, message: '请输入紧急联系电话' }, { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的紧急联系电话' }]}>
                    <Input placeholder="请输入紧急联系电话" />
                </Form.Item>
                <Form.Item name="doctor" label="主治医师">
                    <Input placeholder="请输入主治医师" />
                </Form.Item>
                <Form.Item name="remark" label="备注">
                    <Input placeholder="请输入备注" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditPatientModal; 