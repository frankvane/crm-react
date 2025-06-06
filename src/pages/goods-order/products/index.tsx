/**
 * @file 商品管理页面
 * @author AI Assistant
 * @date 2024-03-20
 */
import React, { lazy, Suspense } from "react";
import { Layout, Skeleton, message, ConfigProvider } from "antd";
import { useCreateProductMutation } from "@/api/query/useProductQuery";
import CategoryNav from "./components/CategoryNav";
import AddProductModal from "./components/AddProductModal";
import styles from "./style.module.less";
import ProductList from "./components/productList";
import { useProductState } from "./hooks/useProductState";
import { useCategoryData } from "./hooks/useCategoryData";
import ProductOperationBar from "./components/ProductOperationBar";
import CommentPanel from "./components/CommentPanel";
import { ProductFormValues } from "./types";

// 懒加载AI分析对话框组件
const StreamChatModal = lazy(() => import("@/components/StreamChatModal"));

const { Content, Sider } = Layout;

/**
 * 商品管理页面组件
 */
const ProductsPage: React.FC = () => {
	// 使用自定义Hook管理状态
	const {
		selectedCategoryId,
		selectedProductId,
		selectedProductName,
		isModalOpen,
		aiModalVisible,
		selectCategory,
		selectProduct,
		toggleModal,
		toggleAiModal,
	} = useProductState();

	// 使用自定义Hook加载分类数据
	const {
		categoryData: { isLoading, error },
		options: { categoryOptions, brandOptions, dosageFormOptions, unitOptions },
	} = useCategoryData();

	// API调用
	const createProductMutation = useCreateProductMutation({
		onSuccess: () => {
			message.success("创建商品成功");
			toggleModal(false);
		},
	});

	// 处理提交
	const handleSubmit = async (values: ProductFormValues) => {
		try {
			// 转换表单值为API参数格式
			const apiParams = {
				...values,
				brand_id: values.brand_id || 0,
				dosage_form_id: values.dosage_form_id || 0,
				unit_id: values.unit_id || 0,
				specification: values.specification || "",
				manufacturer: values.manufacturer || "",
				approval_number: values.approval_number || "",
				bar_code: values.bar_code || "",
				image_url: values.image_url || "",
				description: values.description || "",
				price: values.price || 0,
				stock: values.stock || 0,
			};
			await createProductMutation.mutateAsync(apiParams);
		} catch (error: any) {
			message.error(error?.message || "创建商品失败");
		}
	};

	// 在数据加载出错时显示错误信息
	if (error) {
		message.error(error.message);
	}

	return (
		<ConfigProvider
			theme={{
				token: {
					borderRadius: 4,
					colorBgContainer: "#fff",
				},
			}}
		>
			<Layout className={styles.container}>
				{/* 左侧分类导航 */}
				<Sider
					width={240}
					theme="light"
					className={styles.leftPanel}
					breakpoint="lg"
					collapsedWidth={0}
				>
					<CategoryNav onSelect={selectCategory} />
				</Sider>

				{/* 中间产品列表 */}
				<Content className={styles.rightPanel}>
					<Suspense fallback={<Skeleton active />}>
						<ProductOperationBar
							onAddProduct={() => toggleModal(true)}
							isLoading={isLoading}
						/>

						<ProductList
							categoryId={selectedCategoryId}
							onShowComments={(id, name) => selectProduct(id, name)}
						/>
					</Suspense>

					<AddProductModal
						open={isModalOpen}
						onOk={handleSubmit}
						onCancel={() => toggleModal(false)}
						brands={brandOptions}
						dosageForms={dosageFormOptions}
						units={unitOptions}
						categories={categoryOptions}
						confirmLoading={createProductMutation.isPending}
					/>
				</Content>

				{/* 右侧评论面板 */}
				<Sider
					width={300}
					theme="light"
					className={styles.middlePanel}
					breakpoint="md"
					collapsedWidth={0}
					reverseArrow
				>
					<CommentPanel
						selectedProductId={selectedProductId}
						selectedProductName={selectedProductName}
						onShowAiModal={() => toggleAiModal(true)}
					/>
				</Sider>

				{/* AI分析弹窗 - 使用React.lazy懒加载 */}
				<Suspense fallback={null}>
					{aiModalVisible && (
						<StreamChatModal
							visible={aiModalVisible}
							onClose={() => toggleAiModal(false)}
							defaultRole="AI分析师"
							defaultQuestion={
								selectedProductName
									? `请分析商品"${selectedProductName}"的用户评论，给出主要观点和建议。`
									: ""
							}
							apiUrl="http://localhost:3000/api/stream-chat"
						/>
					)}
				</Suspense>
			</Layout>
		</ConfigProvider>
	);
};

export default ProductsPage;
