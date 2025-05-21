import React from 'react';
import styles from '../style.module.less';

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
    <div className={styles.patientCard}>
        <div className={styles.patientCardHeader}>
            <span className={styles.patientCardName}>姓名 {patient.name}</span>
            <span className={styles.patientCardGender}>{patient.gender === 1 ? '男' : '女'}</span>
            <span className={styles.patientCardAge}>/ {patient.birthday ? (new Date().getFullYear() - new Date(patient.birthday).getFullYear()) : '-'}</span>
        </div>
        <div className={styles.patientCardInfo}>手机号：{patient.phone}</div>
        <div className={styles.patientCardInfo}>身份证号：{patient.id_card}</div>
        <div className={styles.patientCardAddress}>家庭住址：{patient.address}</div>
        <div className={styles.patientCardActions}>
            <button className={styles.patientCardBtnDetail} onClick={() => onDetail(patient)}>查看</button>
            <button className={styles.patientCardBtnEdit} onClick={() => onEdit(patient)}>修改</button>
            <button className={styles.patientCardBtnDelete} onClick={() => onDelete(patient)}>删除</button>
        </div>
    </div>
);

export default PatientCard; 