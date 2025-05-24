import React from 'react';

interface Patient {
    id: number;
    name: string;
    gender: number;
    birthday: string;
    phone: string;
    id_card: string;
    address: string;
    emergency_contact?: string;
    emergency_phone?: string;
    doctor?: string;
    remark?: string;
}

interface PatientCardProps {
    patient: Patient;
    onEdit: (patient: Patient) => void;
    onDelete: (patient: Patient) => void;
    onDetail: (patient: Patient) => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, onEdit, onDelete, onDetail }) => (
    <div
        style={{
            borderRadius: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            background: '#fafbfc',
            padding: 20,
            minHeight: 180,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1px solid #e5e6eb',
        }}
    >
        <div style={{ marginBottom: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 18, marginRight: 8 }}>姓名 {patient.name}</span>
            <span style={{ color: '#888', marginRight: 8 }}>{patient.gender === 1 ? '男' : '女'}</span>
            <span style={{ color: '#888' }}>/ {patient.birthday ? (new Date().getFullYear() - new Date(patient.birthday).getFullYear()) : '-'}</span>
        </div>
        <div style={{ color: '#555', fontSize: 14, marginBottom: 2 }}>手机号：{patient.phone}</div>
        <div style={{ color: '#555', fontSize: 14, marginBottom: 2 }}>身份证号：{patient.id_card}</div>
        <div style={{ color: '#555', fontSize: 14, marginBottom: 10 }}>家庭住址：{patient.address}</div>
        <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ background: '#1677ff', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 14px', cursor: 'pointer' }} onClick={() => onDetail(patient)}>查看</button>
            <button style={{ background: '#ffb300', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 14px', cursor: 'pointer' }} onClick={() => onEdit(patient)}>修改</button>
            <button style={{ background: '#f53f3f', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 14px', cursor: 'pointer' }} onClick={() => onDelete(patient)}>删除</button>
        </div>
    </div>
);

export default PatientCard; 