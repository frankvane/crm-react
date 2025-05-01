import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import styles from "./style.module.less";

const UserLayout = () => {
  return (
    <Layout className={styles.layout}>
      <div className={styles.content}>
        <div className={styles.top}>
          <div className={styles.header}>
            <h1>CRM Admin</h1>
          </div>
          <div className={styles.desc}>企业级客户关系管理系统</div>
        </div>
        <div className={styles.main}>
          <Outlet />
        </div>
      </div>
    </Layout>
  );
};

export default UserLayout;
