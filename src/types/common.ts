/**
 * 树形数据节点接口
 */
export interface TreeData {
	id: number;
	name: string;
	children?: TreeData[];
	[key: string]: any;
}
