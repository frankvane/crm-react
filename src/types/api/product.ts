export interface Product {
	id: number | string;
	name: string;
	code: string;
	category_id: number | string;
	brand_id: number | string;
	dosage_form_id: number | string;
	specification: string;
	manufacturer: string;
	approval_number: string;
	bar_code: string;
	price: number;
	stock: number;
	unit_id: number | string;
	description?: string;
	image_url?: string;
	status: number;
	createdAt: string;
	updatedAt: string;
}

// 查询参数
export interface ProductQueryParams {
	page?: number;
	pageSize?: number;
	search?: string;
	name?: string;
	code?: string;
	status?: number;
	category_id?: number | string;
}

// 创建/更新参数（可根据实际表单字段调整）
export type CreateProductParams = Omit<
	Product,
	"id" | "createdAt" | "updatedAt"
>;
export type UpdateProductParams = Partial<CreateProductParams>;

// 列表返回
export interface ProductListResponse {
	list: Product[];
	pagination: {
		current: number;
		pageSize: number;
		total: number;
	};
}
