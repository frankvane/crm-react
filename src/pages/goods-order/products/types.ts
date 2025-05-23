/**
 * @file 商品模块类型定义
 * @author AI Assistant
 * @date 2024-03-20
 */

import { ICategoryTreeNode } from "@/types/api/category";

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

export interface CategoryDataState {
	isLoading: boolean;
	error: Error | null;
	data?: any;
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
 * 商品表单值类型
 */
export interface ProductFormValues {
	name: string;
	code: string;
	category_id: number;
	brand_id?: number;
	dosage_form_id?: number;
	unit_id?: number;
	specification?: string;
	manufacturer?: string;
	approval_number?: string;
	bar_code?: string;
	image_url?: string;
	description?: string;
	price?: number;
	stock?: number;
	status: number;
}

export interface SelectOption {
	label: string;
	value: number;
}

export interface AddProductModalProps {
	open: boolean;
	onOk: (values: ProductFormValues) => Promise<void>;
	onCancel: () => void;
	brands: SelectOption[];
	dosageForms: SelectOption[];
	units: SelectOption[];
	categories: SelectOption[];
	confirmLoading?: boolean;
}
