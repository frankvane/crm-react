/**
 * @file 患者卡片组件
 * @author AI Assistant
 * @date 2024-07-12
 */
import React from "react";
import { Button } from "antd";
import styles from "../style.module.less";
import { calculateAge, formatPhone } from "../utils";
import { PatientCardProps } from "../types";

/**
 * 患者卡片组件
 * @param props 组件属性
 * @returns React组件
 */
const PatientCard: React.FC<PatientCardProps> = ({
	patient,
	onDetail,
	onEdit,
	onDelete,
}) => {
	return (
		<div className={styles.patientCard}>
			<div>
				<div className={styles.patientCardHeader}>
					<span className={styles.patientCardName}>{patient.name}</span>
					<span className={styles.patientCardGender}>
						{patient.gender === 1 ? "男" : "女"}
					</span>
					<span className={styles.patientCardAge}>
						{calculateAge(patient.birthday)}岁
					</span>
				</div>
				<div className={styles.patientCardInfo}>
					手机号：{formatPhone(patient.phone)}
				</div>
				{patient.address && (
					<div className={styles.patientCardAddress}>
						家庭住址：{patient.address}
					</div>
				)}
			</div>
			<div className={styles.patientCardActions}>
				<Button type="primary" onClick={() => onDetail(patient.id)}>
					查看详情
				</Button>
				<Button
					type="primary"
					style={{ backgroundColor: "#ffb300" }}
					onClick={() => onEdit(patient.id)}
				>
					编辑
				</Button>
				<Button type="primary" danger onClick={() => onDelete(patient.id)}>
					删除
				</Button>
			</div>
		</div>
	);
};

export default PatientCard;
