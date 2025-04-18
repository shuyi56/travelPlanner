import React from 'react';
import { Form, Input, AutoComplete, Typography, Button,theme } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { DollarRating } from '../shared/DollarRating';
const { useToken } = theme;
export const EatingIdeaForm = () => (
  <>
    <Form.Item name="cuisine" label="Cuisine">
      <Input />
    </Form.Item>
    <Form.Item name="price" label="Price Range">
      <DollarRating />
    </Form.Item>
    <Form.Item name="address" label="Address">
      <AutoComplete options={[]} placeholder="Type to search address" />
    </Form.Item>
  </>
);

export const EatingIdeaCard = ({ subitem, onEdit }) => {
  const { token } = theme.useToken();
  return (
    <div style={{ padding: '16px 24px' }}>
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        paddingBottom: 16
      }}>
        <Typography.Title level={3} style={{ margin: 0, fontSize: 24 }}>
          {subitem.name}
        </Typography.Title>
        {subitem.price && (
          <Typography.Text style={{ 
            color: '#52c41a',
            fontSize: 20,
            fontWeight: 'bold'
          }}>
            {'$'.repeat(subitem.price)}
          </Typography.Text>
        )}
      </div>

      <div style={{ 
        flex: 1,
        display: 'grid',
        gap: '20px',
        fontSize: 15
      }}>
        {subitem.cuisine && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🍽️</span>
            <Typography.Text>{subitem.cuisine}</Typography.Text>
          </div>
        )}
        {subitem.address && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>📍</span>
            <Typography.Text>{subitem.address}</Typography.Text>
          </div>
        )}
      </div>

      <div style={{
        marginTop: 20,
        paddingTop: 16,
        borderTop: `1px solid ${token.colorBorderSecondary}`,
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 8
      }}>
        <Button 
          size="middle"
          type="primary"
          ghost
          icon={<EyeOutlined />}
          onClick={onEdit}
        >
          Edit Details
        </Button>
      </div>
    </div>
  );
};
