/**
 * @file 订单管理页面
 * @author AI Assistant
 * @date 2024-07-12
 */
import React, { Suspense } from "react";
import { Layout, Skeleton, ConfigProvider } from "antd";
import SearchArea from "./components/SearchArea";
import AddPatientButton from "./components/AddPatientButton";
import PatientList from "./components/PatientList";
import PatientModal from "./components/PatientModal";
import styles from "./style.module.less";
import { useOrderState } from "./hooks/useOrderState";

const { Content } = Layout;

/**
 * 订单管理页面组件
 */
const OrdersPage: React.FC = () => {
	// 使用自定义Hook管理状态
	const { searchParams, modalVisible, setSearchParams, toggleModal } =
		useOrderState();

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
				<Content className={styles.content}>
					<div className={styles.topBar}>
						<SearchArea onSearch={setSearchParams} />
						<AddPatientButton onClick={() => toggleModal(true)} />
					</div>

					<Suspense fallback={<Skeleton active />}>
						<PatientList searchParams={searchParams} />
					</Suspense>

					<PatientModal
						visible={modalVisible}
						onClose={() => toggleModal(false)}
					/>
				</Content>
			</Layout>
		</ConfigProvider>
	);
};

export default OrdersPage;
