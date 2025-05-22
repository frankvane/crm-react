import { useReducer, useCallback } from "react";
import { ProductState, ProductAction } from "../types";

// 初始状态
const initialState: ProductState = {
	selectedCategoryId: undefined,
	selectedProductId: undefined,
	selectedProductName: undefined,
	isModalOpen: false,
	aiModalVisible: false,
};

// 状态管理的reducer函数
function productReducer(
	state: ProductState,
	action: ProductAction,
): ProductState {
	switch (action.type) {
		case "SELECT_CATEGORY":
			return {
				...state,
				selectedCategoryId: action.payload,
			};
		case "SELECT_PRODUCT":
			return {
				...state,
				selectedProductId: action.payload.id,
				selectedProductName: action.payload.name,
			};
		case "TOGGLE_MODAL":
			return {
				...state,
				isModalOpen: action.payload,
			};
		case "TOGGLE_AI_MODAL":
			return {
				...state,
				aiModalVisible: action.payload,
			};
		case "RESET_SELECTION":
			return {
				...state,
				selectedProductId: undefined,
				selectedProductName: undefined,
			};
		default:
			return state;
	}
}

/**
 * 产品状态管理自定义Hook
 * @returns 产品状态与操作方法
 */
export function useProductState() {
	const [state, dispatch] = useReducer(productReducer, initialState);

	// 选择分类
	const selectCategory = useCallback((categoryId: string) => {
		dispatch({ type: "SELECT_CATEGORY", payload: categoryId });
	}, []);

	// 选择产品
	const selectProduct = useCallback((id: number | string, name: string) => {
		dispatch({
			type: "SELECT_PRODUCT",
			payload: { id, name },
		});
	}, []);

	// 切换模态框状态
	const toggleModal = useCallback((isOpen: boolean) => {
		dispatch({ type: "TOGGLE_MODAL", payload: isOpen });
	}, []);

	// 切换AI模态框状态
	const toggleAiModal = useCallback((isOpen: boolean) => {
		dispatch({ type: "TOGGLE_AI_MODAL", payload: isOpen });
	}, []);

	// 重置选择
	const resetSelection = useCallback(() => {
		dispatch({ type: "RESET_SELECTION" });
	}, []);

	return {
		...state,
		selectCategory,
		selectProduct,
		toggleModal,
		toggleAiModal,
		resetSelection,
	};
}
