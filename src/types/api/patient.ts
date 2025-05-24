// 病患相关接口类型定义

// 病患基本信息
export interface Patient {
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
	status?: number;
}

// 病患列表响应类型
export interface PatientListResponse {
	list: Patient[];
	pagination: {
		current: number;
		pageSize: number;
		total: number;
	};
}
