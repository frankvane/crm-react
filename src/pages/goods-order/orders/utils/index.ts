/**
 * @file 订单模块工具函数
 * @author AI Assistant
 * @date 2024-07-12
 */

import { MedicalRecord } from "../types";

/**
 * 从本地存储获取病例记录
 * @param patientId 患者ID
 * @returns 病例记录数组
 */
export function getLocalMedicalRecords(patientId: number): MedicalRecord[] {
	const key = `medicalRecords_${patientId}`;
	const data = localStorage.getItem(key);
	return data ? JSON.parse(data) : [];
}

/**
 * 添加病例记录到本地存储
 * @param patientId 患者ID
 * @param record 病例记录
 */
export function addLocalMedicalRecord(
	patientId: number,
	record: MedicalRecord,
): void {
	const key = `medicalRecords_${patientId}`;
	const records = getLocalMedicalRecords(patientId);
	records.unshift(record);
	localStorage.setItem(key, JSON.stringify(records));
}

/**
 * 计算年龄
 * @param birthday 生日字符串 (YYYY-MM-DD)
 * @returns 年龄数值
 */
export function calculateAge(birthday: string | undefined): number | string {
	if (!birthday) return "-";
	return new Date().getFullYear() - Number(birthday.split("-")[0]);
}

/**
 * 判断是否为空数据
 * @param value 要检查的值
 * @returns 是否为空
 */
export const isEmpty = (value: any): boolean => {
	return (
		value === undefined ||
		value === null ||
		(typeof value === "string" && value.trim() === "") ||
		(Array.isArray(value) && value.length === 0) ||
		(typeof value === "object" && Object.keys(value).length === 0)
	);
};

/**
 * 格式化手机号
 * @param phone 手机号
 * @returns 格式化后的手机号 (例如: 138****1234)
 */
export function formatPhone(phone: string | undefined): string {
	if (!phone || phone.length !== 11) return phone || "";
	return `${phone.substring(0, 3)}****${phone.substring(7)}`;
}

/**
 * 格式化身份证号
 * @param idCard 身份证号
 * @returns 格式化后的身份证号 (例如: 3305********1234)
 */
export function formatIdCard(idCard: string | undefined): string {
	if (!idCard || idCard.length !== 18) return idCard || "";
	return `${idCard.substring(0, 4)}********${idCard.substring(14)}`;
}
