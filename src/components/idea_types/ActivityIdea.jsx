import React from 'react';
import { Form, Input, AutoComplete, theme, Typography, Button, Segmented } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { DollarRating } from '../shared/DollarRating';
const { useToken } = theme;


export const ActivityIdeaForm = () => (
  <>
    <Form.Item name="duration" label="Duration">
      <Input placeholder="e.g. 2 hours" />
    </Form.Item>
    <Form.Item name="price" label="Cost">
      <DollarRating />
    </Form.Item>
    <Form.Item name="location" label="Location">
      <AutoComplete options={[]} placeholder="Type to search location" />
    </Form.Item>
    <Form.Item name="difficulty" label="Difficulty Level">
      <Segmented
        options={[
          { value: 'easy', label: 'Easy' },
          { value: 'moderate', label: 'Moderate' },
          { value: 'challenging', label: 'Challenging' },
          { value: 'extreme', label: 'Extreme' },
        ]}
        block
      />
    </Form.Item>
  </>
);

export const ActivityIdeaCard = ({ subitem, onEdit }) => {
  const { token } = theme.useToken();
  const difficultyColors = {
    easy: '#52c41a',
    moderate: '#faad14',
    challenging: '#fa8c16',
    extreme: '#f5222d'
  };

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
        {subitem.difficulty && (
          <Typography.Tag color={difficultyColors[subitem.difficulty]}>
            {subitem.difficulty}
          </Typography.Tag>
        )}
      </div>

      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 16
      }}>
        {subitem.duration && (
          <div>
            <Typography.Text type="secondary">Duration</Typography.Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>⏱️</span>
              <Typography.Text>{subitem.duration}</Typography.Text>
            </div>
          </div>
        )}
        {subitem.location && (
          <div>
            <Typography.Text type="secondary">Location</Typography.Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>📍</span>
              <Typography.Text>{subitem.location}</Typography.Text>
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
