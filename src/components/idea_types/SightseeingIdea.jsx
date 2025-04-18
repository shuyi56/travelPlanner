import React from 'react';
import { Form, Input, AutoComplete, Typography, Button,theme } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { DollarRating } from '../shared/DollarRating';

export const SightseeingIdeaForm = () => (
  <>
    <Form.Item name="location" label="Location">
      <AutoComplete options={[]} placeholder="Type to search location" />
    </Form.Item>
    <Form.Item name="price" label="Entry Fee">
      <DollarRating />
    </Form.Item>
    <Form.Item name="openingHours" label="Opening Hours">
      <Input placeholder="e.g. 9 AM - 5 PM" />
    </Form.Item>
    <Form.Item name="bestTime" label="Best Time to Visit">
      <Input placeholder="e.g. Early morning, sunset" />
    </Form.Item>
  </>
);

export const SightseeingIdeaCard = ({ subitem, onEdit }) => {
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
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 16
      }}>
        {subitem.location && (
          <div>
            <Typography.Text type="secondary">Location</Typography.Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>📍</span>
              <Typography.Text>{subitem.location}</Typography.Text>
            </div>
          </div>
        )}
        {subitem.openingHours && (
          <div>
            <Typography.Text type="secondary">Opening Hours</Typography.Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>🕒</span>
              <Typography.Text>{subitem.openingHours}</Typography.Text>
            </div>
          </div>
        )}
        {subitem.bestTime && (
          <div style={{ gridColumn: '1 / -1' }}>
            <Typography.Text type="secondary">Best Time to Visit</Typography.Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>⭐</span>
              <Typography.Text>{subitem.bestTime}</Typography.Text>
            </div>
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
