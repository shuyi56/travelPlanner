import React from "react";
import { Form, Input, AutoComplete, Typography, Button, theme } from "antd";
import { DollarRating } from "../shared/DollarRating";
import { BaseIdea, BaseIdeaCard, BaseIdeaForm } from "./BaseIdea";

export interface EatingIdea extends BaseIdea {
  cuisine?: string;
  price?: number;
  address?: string;
}

export const EatingIdeaForm: React.FC = () => (
  <BaseIdeaForm>
    <Form.Item name="cuisine" label="Cuisine">
      <Input />
    </Form.Item>
    <Form.Item name="price" label="Price Range">
      <DollarRating />
    </Form.Item>
    <Form.Item name="address" label="Address">
      <AutoComplete options={[]} placeholder="Type to search address" />
    </Form.Item>
  </BaseIdeaForm>
);

export const EatingIdeaCard: React.FC<{
  subitem: EatingIdea;
  onEdit?: (e: React.MouseEvent) => void;
}> = ({ subitem, onEdit }) => {
  const { token } = theme.useToken();
  return (
    <BaseIdeaCard
      subitem={subitem}
      onEdit={onEdit}
      extraHeader={
        subitem.price ? (
          <Typography.Text
            style={{
              color: "#52c41a",
              fontSize: 20,
              fontWeight: "bold",
            }}
          >
            {"$".repeat(subitem.price)}
          </Typography.Text>
        ) : null
      }
      extraBody={
        <div
          style={{
            flex: 1,
            display: "grid",
            gap: "20px",
            fontSize: 15,
          }}
        >
          {subitem.cuisine && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>🍽️</span>
              <Typography.Text>{subitem.cuisine}</Typography.Text>
            </div>
          )}
          {subitem.address && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>📍</span>
              <Typography.Text>{subitem.address}</Typography.Text>
            </div>
          )}
        </div>
      }
    />
  );
};
