import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import PatientCard from "./PatientCard";
import { getPatients } from "@/api/modules/patient";
import { Modal, message } from "antd";
import {
	useDeletePatientMutation,
	usePatientQuery,
} from "@/api/query/usePatientQuery";
import PatientModal from "./PatientModal";
import { useCreateMedicalRecordMutation } from "@/api/query/useMedicalRecordQuery";
import { Form, Input, DatePicker } from "antd";
import dayjs from "dayjs";
import styles from "../style.module.less";
import { Patient, PatientListResponse } from "@/types/api/patient";

// 病例类型
type MedicalRecord = {
	id: number;
	patient_id: number;
	visit_date: string;
	diagnosis: string;
	treatment: string;
	doctor: string;
	remark?: string;
};

// 组件props类型
interface PatientListProps {
	searchParams?: Record<string, any>;
}

// ====== 本地病例存储工具函数 ======
function getLocalMedicalRecords(patientId: number): any[] {
	const key = `medicalRecords_${patientId}`;
	const data = localStorage.getItem(key);
	return data ? JSON.parse(data) : [];
}
function addLocalMedicalRecord(patientId: number, record: any) {
	const key = `medicalRecords_${patientId}`;
	const records = getLocalMedicalRecords(patientId);
	records.unshift(record);
	localStorage.setItem(key, JSON.stringify(records));
}

// 新增病例弹窗
const MedicalRecordModal: React.FC<{
	visible: boolean;
	patient: Patient | null;
	onSuccess: (record: MedicalRecord) => void;
	onCancel: () => void;
}> = ({ visible, patient, onSuccess, onCancel }) => {
	const [form] = Form.useForm();
	const createMutation = useCreateMedicalRecordMutation({
		onSuccess: (data: any) => {
			onSuccess(data && (data.data || data));
			form.resetFields();
		},
	});

	// 关键：每次弹窗打开时重置表单
	useEffect(() => {
		if (visible) {
			form.resetFields();
			form.setFieldsValue({
				doctor: patient?.doctor || "",
			});
		}
	}, [visible, patient, form]);

	return (
		<Modal
			open={visible}
			title={<div className={styles.patientDetailModalTitle}>新增病例</div>}
			onCancel={() => {
				form.resetFields();
				onCancel();
			}}
			onOk={() => form.submit()}
			confirmLoading={createMutation.isPending}
			destroyOnClose
		>
			<Form
				form={form}
				layout="vertical"
				onFinish={(values) => {
					if (
						!values.visit_date ||
						typeof values.visit_date.format !== "function"
					) {
						message.error("请选择正确的就诊日期");
						return;
					}
					createMutation.mutate({
						...values,
						patient_id: patient?.id,
						visit_date: values.visit_date.format("YYYY-MM-DD"),
					});
				}}
			>
				<div
					style={{
						marginBottom: 16,
						background: "#f7f7f7",
						borderRadius: 6,
						padding: 12,
					}}
				>
					<div style={{ display: "flex", gap: 24, marginBottom: 8 }}>
						<span>姓名：{patient?.name}</span>
						<span>性别：{patient?.gender === 1 ? "男" : "女"}</span>
						<span>
							年龄：
							{patient?.birthday
								? new Date().getFullYear() -
									Number(patient?.birthday.split("-")[0])
								: "-"}
						</span>
					</div>
					<div style={{ color: "#444", marginBottom: 4 }}>
						手机号：{patient?.phone}
					</div>
					<div style={{ color: "#444" }}>家庭住址：{patient?.address}</div>
				</div>
				<Form.Item
					name="visit_date"
					label="就诊日期"
					rules={[{ required: true, message: "请选择就诊日期" }]}
				>
					<DatePicker style={{ width: "100%" }} />
				</Form.Item>
				<Form.Item
					name="diagnosis"
					label="病况与诊断"
					rules={[{ required: true, message: "请输入病况与诊断" }]}
				>
					<Input.TextArea rows={2} placeholder="如：感冒" />
				</Form.Item>
				<Form.Item
					name="treatment"
					label="医生建议"
					rules={[{ required: true, message: "请输入医生建议" }]}
				>
					<Input.TextArea rows={2} placeholder="如：多喝水，休息" />
				</Form.Item>
				<Form.Item
					name="doctor"
					label="主治医师"
					rules={[{ required: true, message: "请输入主治医师" }]}
				>
					<Input placeholder="如：王医生" />
				</Form.Item>
				<Form.Item name="remark" label="备注">
					<Input.TextArea rows={1} placeholder="无特殊情况可不填" />
				</Form.Item>
			</Form>
		</Modal>
	);
};

// 病例详情弹窗
const MedicalRecordDetailModal: React.FC<{
	visible: boolean;
	record: MedicalRecord | null;
	onClose: () => void;
}> = ({ visible, record, onClose }) => (
	<Modal
		open={visible}
		title={<div className={styles.patientDetailModalTitle}>病例详情</div>}
		onCancel={onClose}
		footer={null}
		width={480}
		destroyOnClose
	>
		{record ? (
			<div style={{ lineHeight: 2 }}>
				<div>
					<b>就诊日期：</b>
					{dayjs(record.visit_date).format("YYYY-MM-DD")}
				</div>
				<div>
					<b>病况与诊断：</b>
					{record.diagnosis}
				</div>
				<div>
					<b>医生建议：</b>
					{record.treatment}
				</div>
				<div>
					<b>主治医师：</b>
					{record.doctor}
				</div>
				{record.remark && (
					<div>
						<b>备注：</b>
						{record.remark}
					</div>
				)}
			</div>
		) : null}
	</Modal>
);

const PatientDetailModal: React.FC<{
	visible: boolean;
	patientId: number | null;
	onClose: () => void;
}> = ({ visible, patientId, onClose }) => {
	const { data, isLoading } = usePatientQuery(patientId || 0, {
		enabled: !!patientId,
	});
	// 使用类型断言解决类型问题
	const patient = data ? (data as any).data || (data as Patient) : null;
	// ====== 病历记录状态，优先本地存储 ======
	const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
	// 页面加载/切换患者时，自动恢复本地病例
	useEffect(() => {
		if (patientId) {
			setMedicalRecords(getLocalMedicalRecords(patientId));
		}
	}, [patientId]);
	// 新增病例弹窗
	const [recordModalVisible, setRecordModalVisible] = useState(false);
	// 新增：病例详情弹窗状态
	const [detailRecord, setDetailRecord] = useState<MedicalRecord | null>(null);
	const [detailModalVisible, setDetailModalVisible] = useState(false);

	// TODO: 可用useEffect拉取病例列表

	return (
		<Modal
			open={visible}
			onCancel={onClose}
			title={<div className={styles.patientDetailModalTitle}>患者详情</div>}
			footer={null}
			width={600}
		>
			{isLoading ? (
				"加载中..."
			) : patient ? (
				<div className={styles.patientDetailModalInfo}>
					<div className={styles.patientDetailModalRow}>
						<span>姓名：{patient.name}</span>
						<span>性别：{patient.gender === 1 ? "男" : "女"}</span>
						<span>
							年龄：
							{patient.birthday
								? new Date().getFullYear() -
									Number(patient.birthday.split("-")[0])
								: "-"}
						</span>
					</div>
					<div className={styles.patientDetailModalContact}>
						联系电话：{patient.phone}
					</div>
					<div className={styles.patientDetailModalAddress}>
						家庭住址：{patient.address}
					</div>
				</div>
			) : null}
			<div className={styles.patientDetailModalRecordsTitle}>
				过往病历记录：
			</div>
			<div className={styles.patientDetailModalRecords}>
				{medicalRecords.length === 0
					? "暂无记录"
					: medicalRecords.map((r) => (
							<div key={r.id} className={styles.patientDetailModalRecordRow}>
								<span>
									<span className={styles.patientDetailModalRecordDate}>
										{dayjs(r.visit_date).format("YYYY-MM-DD")}
									</span>{" "}
									{r.diagnosis}
								</span>
								<button
									className={styles.patientDetailModalBtnView}
									onClick={() => {
										setDetailRecord(r);
										setDetailModalVisible(true);
									}}
								>
									查看
								</button>
							</div>
						))}
			</div>
			<div className={styles.patientDetailModalActions}>
				<button
					className={styles.patientDetailModalBtnAdd}
					onClick={() => setRecordModalVisible(true)}
				>
					新增
				</button>
				<button className={styles.patientDetailModalBtnDone} onClick={onClose}>
					完成
				</button>
			</div>
			<MedicalRecordModal
				visible={recordModalVisible}
				patient={patient}
				onSuccess={(record) => {
					if (patient) {
						addLocalMedicalRecord(patient.id, record); // 本地存储
						setMedicalRecords((records) => [record, ...records]); // 刷新页面
					}
					setRecordModalVisible(false);
				}}
				onCancel={() => setRecordModalVisible(false)}
			/>
			<MedicalRecordDetailModal
				visible={detailModalVisible}
				record={detailRecord}
				onClose={() => setDetailModalVisible(false)}
			/>
		</Modal>
	);
};

const PatientList: React.FC<PatientListProps> = ({ searchParams = {} }) => {
	const {
		data = { list: [], pagination: { current: 1, pageSize: 20, total: 0 } },
		isLoading,
	} = useQuery<PatientListResponse>({
		queryKey: ["patients", searchParams],
		queryFn: () => getPatients({ page: 1, pageSize: 20, ...searchParams }),
	});

	// 删除病患
	const deleteMutation = useDeletePatientMutation({
		onSuccess: () => {
			message.success("删除成功");
		},
	});

	const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
	const [editModalVisible, setEditModalVisible] = useState(false);
	const [detailPatientId, setDetailPatientId] = useState<number | null>(null);
	const [detailModalVisible, setDetailModalVisible] = useState(false);

	const handleEditModalClose = () => {
		setEditModalVisible(false);
		setEditingPatient(null);
	};

	return (
		<div className={styles.patientListContainer}>
			<div className={styles.patientListGrid}>
				{isLoading
					? "加载中..."
					: data.list.map((p) => (
							<PatientCard
								key={p.id}
								patient={p}
								onEdit={(patient) => {
									setEditingPatient(patient);
									setEditModalVisible(true);
								}}
								onDelete={(patient) => {
									Modal.confirm({
										title: "确认删除",
										content: "确定要删除该患者吗？此操作不可恢复。",
										okText: "确认",
										cancelText: "取消",
										onOk: () => deleteMutation.mutate(patient.id),
									});
								}}
								onDetail={(patient) => {
									setDetailPatientId(patient.id);
									setDetailModalVisible(true);
								}}
							/>
						))}
			</div>
			<PatientModal
				visible={editModalVisible}
				onClose={handleEditModalClose}
				patient={editingPatient}
			/>
			<PatientDetailModal
				visible={detailModalVisible}
				patientId={detailPatientId}
				onClose={() => {
					setDetailModalVisible(false);
					setDetailPatientId(null);
				}}
			/>
		</div>
	);
};

export default PatientList;
