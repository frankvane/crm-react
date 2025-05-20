import React, { useState } from "react";
import { Button, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import CategoryNav from "./components/CategoryNav";
import AddProductModal from "./components/AddProductModal";
import styles from "./style.module.less";
import { getCategoryTree } from "@/api/modules/category";
import { createProduct } from "@/api/modules/product";
import ProductList from "./components/productList";
import CommentList from './components/commentList';
import StreamChatModal from '@/components/StreamChatModal';
// import type { ICreateProductParams } from "@/types/api/product";


const Index = () => {
  const queryClient = useQueryClient();
  // 添加模态框显示状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [selectedProductId, setSelectedProductId] = useState<number | string | undefined>();
  const [selectedProductName, setSelectedProductName] = useState<string | undefined>();
  const [aiModalVisible, setAiModalVisible] = useState(false);

  // 获取各种分类数据
  const { data: productCategories = [] } = useQuery({
    queryKey: ["categories", 23],
    queryFn: () => getCategoryTree(23)
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["categories", 21],
    queryFn: () => getCategoryTree(21)
  });

  const { data: dosageForms = [] } = useQuery({
    queryKey: ["categories", 18],
    queryFn: () => getCategoryTree(18)
  });

  const { data: units = [] } = useQuery({
    queryKey: ["categories", 22],
    queryFn: () => getCategoryTree(22)
  });

  // 将树形数据转换为只包含叶子节点的选项数组
  const flattenTreeToOptions = (nodes: any[]): { label: string; value: number }[] => {
    let options: { label: string; value: number }[] = [];
    nodes.forEach(node => {
      if (!node.children || node.children.length === 0) {
        options.push({ label: node.name, value: node.id });
      } else if (node.children && node.children.length > 0) {
        options = options.concat(flattenTreeToOptions(node.children));
      }
    });
    return options;
  };

  // 处理分类选择
  const handleCategorySelect = (key: string) => {
    setSelectedCategoryId(key);
    console.log('选中的分类ID:', key);
  };

  // 处理模态框提交
  const handleSubmit = async (values: any) => {
    try {
      await createProduct(values);
      message.success('创建产品成功');
      // 刷新产品列表
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsModalOpen(false);
    } catch (error: any) {
      message.error(error?.message || '创建产品失败');
    }
  };

  // 处理模态框关闭
  const handleCloseModal = () => {
    console.log('关闭模态框');
    setIsModalOpen(false);
  };

  // 处理打开模态框
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // 准备下拉选项数据
  const categoryOptions = flattenTreeToOptions(productCategories);
  const brandOptions = flattenTreeToOptions(brands);
  const dosageFormOptions = flattenTreeToOptions(dosageForms);
  const unitOptions = flattenTreeToOptions(units);

  return (
    <div className={styles.container}>
      {/* 左侧面板 */}
      <div className={styles.leftPanel}>
        <CategoryNav onSelect={handleCategorySelect} />
      </div>

      {/* 中间面板 */}
      <div className={styles.rightPanel}>
        <div className={styles.rightPanelContent}>
          <div className={styles.operationBar}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenModal}
            >
              添加商品
            </Button>
          </div>
          <ProductList
            categoryId={selectedCategoryId}
            onShowComments={(id, name) => {
              setSelectedProductId(id);
              setSelectedProductName(name);
            }}
          />
        </div>

        <AddProductModal
          open={isModalOpen}
          onOk={handleSubmit}
          onCancel={handleCloseModal}
          brands={brandOptions}
          dosageForms={dosageFormOptions}
          units={unitOptions}
          categories={categoryOptions}
        />
      </div>

      {/* 右侧面板 */}
      <div className={styles.middlePanel}>
        <div className={styles.categoryHeader} style={{ display: 'flex', alignItems: 'center' }}>
          <span>评论{selectedProductName ? `（${selectedProductName}）` : ''}</span>
          {selectedProductId && (
            <button
              style={{ marginLeft: 12, padding: '2px 10px', border: '1px solid #1890ff', borderRadius: 4, background: '#fff', color: '#1890ff', cursor: 'pointer', fontSize: 13 }}
              onClick={() => setAiModalVisible(true)}
            >
              AI分析
            </button>
          )}
        </div>
        <div
          className={styles.categoryContent}
          style={{
            opacity: selectedProductId ? 1 : 0,
            pointerEvents: selectedProductId ? 'auto' : 'none',
            transition: 'opacity 0.3s',
          }}
        >
          {selectedProductId ? <CommentList productId={selectedProductId} /> : null}
        </div>
      </div>

      {/* AI分析弹窗 */}
      <StreamChatModal
        visible={aiModalVisible}
        onClose={() => setAiModalVisible(false)}
        defaultRole="AI分析师"
        defaultQuestion={selectedProductName ? `请分析商品"${selectedProductName}"的用户评论，给出主要观点和建议。` : ''}
        apiUrl="http://localhost:3000/api/stream-chat"
      />
    </div>
  );
};

export default Index;