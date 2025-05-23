/**
 * @file 文件描述
 * @author 开发人员
 * @date 2025-05-23
 * @last_modified_by 最后修改人
 * @last_modified_time 2025-05-23
 */

import { ICategoryTreeNode } from "@/types/api/category";
import type { CreateProductParams } from "@/types/api/product";
export interface Option {
	label: string;
	value: number;
}

export interface ProductState {
	selectedCategoryId?: string;
	selectedProductId?: number | string;
	selectedProductName?: string;
	isModalOpen: boolean;
	aiModalVisible: boolean;
}

export type ProductAction =
	| { type: "SELECT_CATEGORY"; payload: string }
	| { type: "SELECT_PRODUCT"; payload: { id: number | string; name: string } }
	| { type: "TOGGLE_MODAL"; payload: boolean }
	| { type: "TOGGLE_AI_MODAL"; payload: boolean }
	| { type: "RESET_SELECTION" };

export interface CategoryData {
	productCategories: ICategoryTreeNode[];
	brands: ICategoryTreeNode[];
	dosageForms: ICategoryTreeNode[];
	units: ICategoryTreeNode[];
	isLoading: boolean;
}

export type ProductPageProps = Record<string, never>;

export interface ProductOperationBarProps {
	onAddProduct: () => void;
	isLoading: boolean;
}

export interface CommentPanelProps {
	selectedProductId?: number | string;
	selectedProductName?: string;
	onShowAiModal: () => void;
}

/**
 * 产品表单值类型
 */
export interface ProductFormValues {
	name: string;
	categoryId?: number;
	brandId?: number;
	dosageFormId?: number;
	unitId?: number;
	description?: string;
	price?: number;
	stock?: number;
	status?: "active" | "inactive";
	[key: string]: any; // 允许其他字段
}
export interface SelectOption {
	label: string;
	value: number;
}

export interface AddProductModalProps {
	open: boolean;
	onOk: (values: CreateProductParams) => Promise<void>;
	onCancel: () => void;
	brands: SelectOption[];
	dosageForms: SelectOption[];
	units: SelectOption[];
	categories: SelectOption[];
	confirmLoading?: boolean;
}
