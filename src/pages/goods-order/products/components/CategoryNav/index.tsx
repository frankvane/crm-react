import React from "react";
import { Spin, Menu } from "antd";
import type { MenuProps } from "antd";
import { getAllCategoryTypes } from "@/api/modules/category-type";
import { getCategoryTree } from "@/api/modules/category";
import type { ICategoryType } from "@/types/api/category-type";
import type { ICategoryTreeNode } from "@/types/api/category";
import { useQuery } from "@tanstack/react-query";
import styles from "./style.module.less";

// 递归构建菜单项
const buildMenuItems = (nodes: ICategoryTreeNode[]): MenuProps["items"] => {
	return nodes.map((node) => {
		// 如果没有子项，返回普通菜单项
		if (!node.children?.length) {
			return {
				key: String(node.id),
				label: node.name,
			};
		}
		// 如果有子项，返回子菜单
		return {
			key: String(node.id),
			label: node.name,
			children: buildMenuItems(node.children),
		};
	});
};

interface CategoryNavProps {
	onSelect?: (key: string) => void;
}

const CategoryNav: React.FC<CategoryNavProps> = ({ onSelect }) => {
	// 只获取产品分类类型
	const { data: categories = [], isLoading: isCategoryLoading } = useQuery<
		ICategoryType[]
	>({
		queryKey: ["categoryTypes", "all"],
		queryFn: getAllCategoryTypes,
	});

	// 只保留第一个（产品分类）类型
	const productCategory = categories[0];
	const { data: categoryTree = [], isLoading: isCategoryTreeLoading } =
		useQuery({
			queryKey: ["categories", productCategory?.id],
			queryFn: () =>
				productCategory
					? getCategoryTree(productCategory.id)
					: Promise.resolve([]),
			enabled: !!productCategory,
		});

	// 构建菜单项
	const rootMenuItems: MenuProps["items"] = productCategory
		? [
				{
					key: String(productCategory.id),
					label: productCategory.name,
					children: buildMenuItems(categoryTree),
				},
			]
		: [];

	// 处理菜单选择
	const handleSelect: MenuProps["onSelect"] = ({ key }) => {
		onSelect?.(key);
	};

	return (
		<div className={styles.categoryNav}>
			<div className={styles.header}>
				<span>分类导航</span>
			</div>
			<div className={styles.content}>
				<Spin spinning={isCategoryLoading || isCategoryTreeLoading}>
					<Menu
						mode="inline"
						items={rootMenuItems}
						style={{ width: "100%", border: "none" }}
						defaultOpenKeys={
							productCategory ? [String(productCategory.id)] : []
						}
						onSelect={handleSelect}
					/>
				</Spin>
			</div>
		</div>
	);
};

export default CategoryNav;
