import { Card, Col, Row, Statistic } from "antd";
import {
  DollarOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";

import FileUploader from "../../components/FileUploader";
import styles from "./style.module.less";

const Dashboard = () => {
  return (
    <div className={styles.container}>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={1128}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card>
            <Statistic
              title="总订单数"
              value={93}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card>
            <Statistic
              title="文章数量"
              value={56}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card>
            <Statistic
              title="总收入"
              value={11280}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} className={styles.charts}>
        <Col xs={24} lg={12}>
          <Card title="访问量趋势">{/* 这里可以添加访问量趋势图表 */}</Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="销售额趋势">{/* 这里可以添加销售额趋势图表 */}</Card>
        </Col>
      </Row>

      <FileUploader
        accept=".png,.jpg,.jpeg,.gif,.bmp,.webp,image/*"
        maxSizeMB={10}
        multiple
      />
    </div>
  );
};

export default Dashboard;
