import request from '@/utils/request';

// 获取病例列表
export function getMedicalRecords(params: any) {
  return request.get('/medical-records', { params });
}

// 创建病例
export function createMedicalRecord(data: any) {
  return request.post('/medical-records', data);
} 