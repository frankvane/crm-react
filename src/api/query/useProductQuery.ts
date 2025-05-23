/**
 * @file 文件描述
 * @author 开发人员
 * @date YYYY-MM-DD
 * @last_modified_by 最后修改人
 * @last_modified_time YYYY-MM-DD
 */
import {
	useQuery,
	useMutation,
	useQueryClient,
	UseMutationOptions,
} from "@tanstack/react-query";
import {
	getProducts,
	getProduct,
	createProduct,
	updateProduct,
	deleteProduct,
	deleteProducts,
} from "@/api/modules/product";
import type {
	Product,
	ProductQueryParams,
	CreateProductParams,
	UpdateProductParams,
} from "@/types/api/product";

// 获取产品列表
export function useProductsQuery(params: ProductQueryParams) {
	return useQuery({
		queryKey: ["products", params],
		queryFn: () => getProducts(params),
	});
}

// 获取单个产品
export function useProductQuery(id: number) {
	return useQuery({
		queryKey: ["product", id],
		queryFn: () => getProduct(id),
		enabled: !!id,
	});
}

// 创建产品
export function useCreateProductMutation(
	options?: UseMutationOptions<Product, Error, CreateProductParams>,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createProduct,
		...options,
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
			options?.onSuccess?.(data, variables, context);
		},
	});
}

// 更新产品
export function useUpdateProductMutation(
	options?: UseMutationOptions<
		Product,
		Error,
		{ id: number; data: UpdateProductParams }
	>,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }) => updateProduct(id, data),
		...options,
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
			options?.onSuccess?.(data, variables, context);
		},
	});
}

// 删除产品
export function useDeleteProductMutation(
	options?: UseMutationOptions<null, Error, number>,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteProduct,
		...options,
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
			options?.onSuccess?.(data, variables, context);
		},
	});
}

// 批量删除产品
export function useDeleteProductsMutation(
	options?: UseMutationOptions<{ deleted: number }, Error, number[]>,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteProducts,
		...options,
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
			options?.onSuccess?.(data, variables, context);
		},
	});
}
