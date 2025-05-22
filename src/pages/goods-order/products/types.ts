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
