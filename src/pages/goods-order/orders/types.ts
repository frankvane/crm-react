/**
 * @file 订单模块类型定义
 * @author AI Assistant
 * @date 2024-07-12
 */

import { Patient } from "@/types/api/patient";

export interface Option {
	label: string;
	value: number | string;
}

export interface OrderState {
	searchParams: Record<string, any>;
	modalVisible: boolean;
	editingPatientId: number | null;
	detailPatientId: number | null;
	medicalRecordModalVisible: boolean;
	medicalRecordDetailVisible: boolean;
	selectedPatient: Patient | null;
	selectedRecord: MedicalRecord | null;
}

export type OrderAction =
	| { type: "SET_SEARCH_PARAMS"; payload: Record<string, any> }
	| { type: "TOGGLE_MODAL"; payload: boolean }
	| { type: "SET_EDITING_PATIENT"; payload: number | null }
	| { type: "SET_DETAIL_PATIENT"; payload: number | null }
	| { type: "TOGGLE_MEDICAL_RECORD_MODAL"; payload: boolean }
	| { type: "TOGGLE_MEDICAL_RECORD_DETAIL"; payload: boolean }
	| { type: "SET_SELECTED_PATIENT"; payload: Patient | null }
	| { type: "SET_SELECTED_RECORD"; payload: MedicalRecord | null };

export interface SearchAreaProps {
	onSearch: (params: Record<string, any>) => void;
}

export interface AddPatientButtonProps {
	onClick: () => void;
}

export interface PatientListProps {
	searchParams: Record<string, any>;
}

export interface PatientCardProps {
	patient: Patient;
	onDetail: (id: number) => void;
	onEdit: (id: number) => void;
	onDelete: (id: number) => void;
}

export interface PatientModalProps {
	visible: boolean;
	patient?: Patient | null;
	onClose: () => void;
}

export interface MedicalRecord {
	id: number;
	patient_id: number;
	visit_date: string;
	diagnosis: string;
	treatment: string;
	doctor: string;
	remark?: string;
}

export interface MedicalRecordModalProps {
	visible: boolean;
	patient: Patient | null;
	onSuccess: (record: MedicalRecord) => void;
	onCancel: () => void;
}

export interface MedicalRecordDetailModalProps {
	visible: boolean;
	record: MedicalRecord | null;
	onClose: () => void;
}

export interface PatientDetailModalProps {
	visible: boolean;
	patientId: number | null;
	onClose: () => void;
}
