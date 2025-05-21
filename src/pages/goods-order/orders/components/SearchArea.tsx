import React from 'react';
import { Form, Input, Button } from 'antd';

interface SearchAreaProps {
  onSearch?: (params: Record<string, any>) => void;
}

const SearchArea: React.FC<SearchAreaProps> = ({ onSearch }) => {
  const [searchForm] = Form.useForm();

  // 搜索
  const onFinish = (values: any) => {
    // 只传递有值的字段，避免无关参数
    const params: any = {};
    if (values.search) params.search = values.search;
    if (values.name) params.name = values.name;
    if (values.phone) params.phone = values.phone;
    if (values.id_card) params.id_card = values.id_card;
    onSearch?.(params);
  };

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        padding: '18px 24px',
        minHeight: 40,
        flex: 1,
        width: '100%',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Form
        form={searchForm}
        layout="vertical"
        onFinish={onFinish}
        style={{ width: '100%' }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 24,
            rowGap: 0,
            alignItems: 'flex-end',
          }}
        >
          <Form.Item label="关键词" name="search" style={{ flex: '1 1 220px', minWidth: 180, marginBottom: 0 }}>
            <Input placeholder="姓名/手机号/身份证/主治医师" style={{ borderRadius: 8, height: 38 }} />
          </Form.Item>
          <Form.Item label="姓名" name="name" style={{ flex: '1 1 120px', minWidth: 100, marginBottom: 0 }}>
            <Input placeholder="请输入姓名" style={{ borderRadius: 8, height: 38 }} />
          </Form.Item>
          <Form.Item label="手机号" name="phone" style={{ flex: '1 1 150px', minWidth: 120, marginBottom: 0 }}>
            <Input placeholder="请输入手机号" style={{ borderRadius: 8, height: 38 }} />
          </Form.Item>
          <Form.Item label="身份证号" name="id_card" style={{ flex: '1 1 180px', minWidth: 140, marginBottom: 0 }}>
            <Input placeholder="请输入身份证号" style={{ borderRadius: 8, height: 38 }} />
          </Form.Item>
          <Form.Item style={{ flex: '0 0 100px', marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" style={{ height: 38, borderRadius: 8, fontWeight: 500, fontSize: 16, background: 'linear-gradient(90deg, #1890ff 0%, #40a9ff 100%)', border: 'none', width: 80 }}>
              搜索
            </Button>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
};

export default SearchArea; 