import request from "@/utils/request";
import { PatientListResponse } from "@/types/api/patient";

// 获取病患列表
export function getPatients(params: any): Promise<PatientListResponse> {
	return request.get("/patients", { params });
}

// 获取单个病患
export function getPatient(id: number) {
	return request.get(`/patients/${id}`);
}

// 创建病患
export function createPatient(data: any) {
	return request.post("/patients", data);
}

export function updatePatient(id: number, data: any) {
	return request.put(`/patients/${id}`, { data });
}

export function deletePatient(id: number) {
	return request.delete(`/patients/${id}`);
}
