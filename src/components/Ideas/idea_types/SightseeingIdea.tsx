import React from "react";
import { Form, Input, Typography, theme } from "antd";
import { DollarRating } from "../../shared/DollarRating";
import { BaseIdea, BaseIdeaCard, BaseIdeaForm } from "./BaseIdea";
import AddressSearch from "../../shared/AddressSearch";

export interface SightseeingIdea extends BaseIdea {
  location?: string;
  price?: number;
  openingHours?: string;
  bestTime?: string;
}

export function createSightseeingIdea(name: string): SightseeingIdea {
  return {
    name,
    photos: [],
    location: "",
    price: 0,
    openingHours: "",
    bestTime: "",
  };
}

export const SightseeingIdeaForm: React.FC = () => (
  <BaseIdeaForm>
    <Form.Item name="location" label="Location">
      <AddressSearch placeholder="Type to search location" />
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
  </BaseIdeaForm>
);

export const SightseeingIdeaCard: React.FC<{
  subitem: SightseeingIdea;
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
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 16,
          }}
        >
          {subitem.location && (
            <div>
              <Typography.Text type="secondary">Location</Typography.Text>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>📍</span>
                <Typography.Text>{subitem.location}</Typography.Text>
              </div>
            </div>
          )}
          {subitem.openingHours && (
            <div>
              <Typography.Text type="secondary">Opening Hours</Typography.Text>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>🕒</span>
                <Typography.Text>{subitem.openingHours}</Typography.Text>
              </div>
            </div>
          )}
          {subitem.bestTime && (
            <div style={{ gridColumn: "1 / -1" }}>
              <Typography.Text type="secondary">
                Best Time to Visit
              </Typography.Text>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>⭐</span>
                <Typography.Text>{subitem.bestTime}</Typography.Text>
              </div>
            </div>
          )}
        </div>
      }
    />
  );
};
