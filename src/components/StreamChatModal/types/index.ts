export interface Message {
	id: number;
	role: string;
	content: string;
	roleName?: string;
	roleColor?: string;
	timestamp?: string | number;
}
