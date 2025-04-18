import React from 'react';
import { Steps, theme, Typography, Button, Form, TimePicker, AutoComplete, Segmented } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { DollarRating } from '../shared/DollarRating';
const { useToken } = theme;

export const TravelIdeaForm = () => (
  <>
    <Form.Item name="transportType" label="Transport Type">
      <Segmented
        block
        options={[
          { value: 'plane', label: <div style={{ padding: '4px 0' }}><span style={{ fontSize: 16, marginRight: 4 }}>✈️</span>Plane</div> },
          { value: 'train', label: <div style={{ padding: '4px 0' }}><span style={{ fontSize: 16, marginRight: 4 }}>🚂</span>Train</div> },
          { value: 'bus', label: <div style={{ padding: '4px 0' }}><span style={{ fontSize: 16, marginRight: 4 }}>🚌</span>Bus</div> },
          { value: 'car', label: <div style={{ padding: '4px 0' }}><span style={{ fontSize: 16, marginRight: 4 }}>🚗</span>Car</div> }
        ]}
      />
    </Form.Item>
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr auto 1fr',
      gap: 16,
      alignItems: 'flex-start'
    }}>
      <Form.Item 
        name="from" 
        label="From"
        style={{ margin: 0 }}
        rules={[{ required: true, message: 'Please enter departure location' }]}
      >
        <AutoComplete
          options={[]}
          placeholder="Departure"
          style={{ width: '100%' }}
        />
      </Form.Item>
      <Form.Item 
        name="duration" 
        label="Duration"
        style={{ margin: 0, minWidth: 120 }}
        rules={[{ required: true, message: 'Set duration' }]}
      >
        <TimePicker
          format="HH:mm"
          showNow={false}
          placeholder="Time"
          style={{ width: '100%' }}
        />
      </Form.Item>
      <Form.Item 
        name="to" 
        label="To"
        style={{ margin: 0 }}
        rules={[{ required: true, message: 'Please enter arrival location' }]}
      >
        <AutoComplete
          options={[]}
          placeholder="Arrival"
          style={{ width: '100%' }}
        />
      </Form.Item>
    </div>
    <Form.Item name="cost" label="Estimated Cost">
      <DollarRating />
    </Form.Item>
  </>
);

export const TravelIdeaCard = ({ subitem, onEdit }) => {
  const { token } = theme.useToken();
  const transportIcons = {
    plane: '✈️',
    train: '🚂',
    bus: '🚌',
    car: '🚗',
    other: '🚐',
  };

  return (
    <div style={{ padding: '20px 16px' }}>
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24
      }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {subitem.name}
        </Typography.Title>
        <Typography.Text style={{ fontSize: 24, lineHeight: 1 }}>
          {transportIcons[subitem.transportType] || transportIcons.other}
        </Typography.Text>
      </div>

      <Steps
        progressDot
        current={1}
        items={[
          {
            title: 'From',
            description: subitem.from || 'Not specified',
          },
          {
            title: (
              <div style={{ 
                textAlign: 'center', 
                padding: '0 12px',
                color: token.colorTextSecondary,
                fontSize: 13
              }}>
                <div>{subitem.duration}</div>
                {subitem.cost && <div style={{ color: '#52c41a' }}>{'$'.repeat(subitem.cost)}</div>}
              </div>
            ),
            description: '',
          },
          {
            title: 'To',
            description: subitem.to || 'Not specified',
          },
        ]}
      />

      {subitem.notes && (
        <Typography.Paragraph
          type="secondary"
          style={{ 
            marginTop: 16,
            fontSize: 14,
            background: token.colorBgTextHover,
            padding: 12,
            borderRadius: 6
          }}
        >
          {subitem.notes}
        </Typography.Paragraph>
      )}

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
