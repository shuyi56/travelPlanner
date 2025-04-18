import React from 'react';
import { Rate, theme } from 'antd';
import { DollarOutlined } from '@ant-design/icons';

export const DollarRating = ({ value = 0 }) => {
  const { token } = theme.useToken();
  return (
    <Rate
      character={<DollarOutlined />}
      count={5}
      value={value}
      style={{ color: '#52c41a', fontSize: 20 }}
      allowClear
    />
  );
};