/**
 * @file 订单状态管理
 * @author AI Assistant
 * @date 2024-07-12
 */
import { useReducer, useCallback } from "react";
import { OrderState, OrderAction, MedicalRecord } from "../types";
import { Patient } from "@/types/api/patient";

// 初始状态
const initialState: OrderState = {
	searchParams: {},
	modalVisible: false,
	editingPatientId: null,
	detailPatientId: null,
	medicalRecordModalVisible: false,
	medicalRecordDetailVisible: false,
	selectedPatient: null,
	selectedRecord: null,
};

// 状态管理的reducer函数
function orderReducer(state: OrderState, action: OrderAction): OrderState {
	switch (action.type) {
		case "SET_SEARCH_PARAMS":
			return {
				...state,
				searchParams: action.payload,
			};
		case "TOGGLE_MODAL":
			return {
				...state,
				modalVisible: action.payload,
				// 关闭模态框时清除编辑状态
				editingPatientId: action.payload ? state.editingPatientId : null,
			};
		case "SET_EDITING_PATIENT":
			return {
				...state,
				editingPatientId: action.payload,
				modalVisible: action.payload !== null,
			};
		case "SET_DETAIL_PATIENT":
			return {
				...state,
				detailPatientId: action.payload,
			};
		case "TOGGLE_MEDICAL_RECORD_MODAL":
			return {
				...state,
				medicalRecordModalVisible: action.payload,
			};
		case "TOGGLE_MEDICAL_RECORD_DETAIL":
			return {
				...state,
				medicalRecordDetailVisible: action.payload,
			};
		case "SET_SELECTED_PATIENT":
			return {
				...state,
				selectedPatient: action.payload,
			};
		case "SET_SELECTED_RECORD":
			return {
				...state,
				selectedRecord: action.payload,
			};
		default:
			return state;
	}
}

/**
 * 订单状态管理自定义Hook
 * @returns 订单状态与操作方法
 */
export function useOrderState() {
	const [state, dispatch] = useReducer(orderReducer, initialState);

	// 设置搜索参数
	const setSearchParams = useCallback((params: Record<string, any>) => {
		dispatch({ type: "SET_SEARCH_PARAMS", payload: params });
	}, []);

	// 切换模态框状态
	const toggleModal = useCallback((isOpen: boolean) => {
		dispatch({ type: "TOGGLE_MODAL", payload: isOpen });
	}, []);

	// 设置编辑患者ID
	const setEditingPatient = useCallback((id: number | null) => {
		dispatch({ type: "SET_EDITING_PATIENT", payload: id });
	}, []);

	// 设置详情患者ID
	const setDetailPatient = useCallback((id: number | null) => {
		dispatch({ type: "SET_DETAIL_PATIENT", payload: id });
	}, []);

	// 切换病例模态框状态
	const toggleMedicalRecordModal = useCallback((isOpen: boolean) => {
		dispatch({ type: "TOGGLE_MEDICAL_RECORD_MODAL", payload: isOpen });
	}, []);

	// 切换病例详情模态框状态
	const toggleMedicalRecordDetail = useCallback((isOpen: boolean) => {
		dispatch({ type: "TOGGLE_MEDICAL_RECORD_DETAIL", payload: isOpen });
	}, []);

	// 设置选中患者
	const setSelectedPatient = useCallback((patient: Patient | null) => {
		dispatch({ type: "SET_SELECTED_PATIENT", payload: patient });
	}, []);

	// 设置选中病例
	const setSelectedRecord = useCallback((record: MedicalRecord | null) => {
		dispatch({ type: "SET_SELECTED_RECORD", payload: record });
	}, []);

	return {
		...state,
		setSearchParams,
		toggleModal,
		setEditingPatient,
		setDetailPatient,
		toggleMedicalRecordModal,
		toggleMedicalRecordDetail,
		setSelectedPatient,
		setSelectedRecord,
	};
}
