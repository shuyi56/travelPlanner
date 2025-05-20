import React from "react";
import { Rate, theme } from "antd";
import { DollarOutlined } from "@ant-design/icons";

interface DollarRatingProps {
  value?: number;
  onChange?: (value: number) => void;
}

export const DollarRating: React.FC<DollarRatingProps> = ({
  value = 0,
  onChange,
}) => {
  const { token } = theme.useToken();
  return (
    <Rate
      character={<DollarOutlined />}
      count={5}
      value={value}
      onChange={onChange}
      style={{ color: "#52c41a", fontSize: 20 }}
      allowClear
    />
  );
};
