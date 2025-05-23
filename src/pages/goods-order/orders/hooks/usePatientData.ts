/**
 * @file 患者数据管理
 * @author AI Assistant
 * @date 2024-07-12
 */

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPatients } from "@/api/modules/patient";
import { Patient, PatientListResponse } from "@/types/api/patient";

interface PatientDataState {
	isLoading: boolean;
	error: Error | null;
	patients: Patient[];
}

/**
 * 加载并处理患者数据的Hook
 * @param searchParams 搜索参数
 * @returns 患者数据状态
 */
export function usePatientData(searchParams: Record<string, any> = {}) {
	// 使用React Query获取患者数据
	const { data, isLoading, error } = useQuery({
		queryKey: ["patients", searchParams],
		queryFn: () => getPatients(searchParams),
		staleTime: 60000, // 1分钟内不重新获取数据
	});

	// 使用useMemo缓存处理后的数据
	const patientData = useMemo<PatientDataState>(() => {
		return {
			isLoading,
			error: error as Error | null,
			patients: (data as PatientListResponse)?.list || [],
		};
	}, [data, isLoading, error]);

	return patientData;
}
