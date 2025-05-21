import React from "react";
import { Form, Input, Typography, theme } from "antd";
import { DollarRating } from "../../shared/DollarRating";
import { BaseIdea, BaseIdeaCard, BaseIdeaForm } from "./BaseIdea";
import AddressSearch from "../../shared/AddressSearch";

export interface AccommodationIdea extends BaseIdea {
  type?: string;
  price?: number;
  address?: string;
  checkIn?: string;
  checkOut?: string;
}

export function createAccommodationIdea(name: string): AccommodationIdea {
  return {
    name,
    photos: [],
    type: "",
    price: 0,
    address: "",
    checkIn: "",
    checkOut: "",
  };
}

export const AccommodationIdeaForm: React.FC = () => (
  <BaseIdeaForm>
    <Form.Item name="type" label="Accommodation Type">
      <Input placeholder="e.g. Hotel, Hostel, Airbnb" />
    </Form.Item>
    <Form.Item name="price" label="Price per Night">
      <DollarRating />
    </Form.Item>
    <Form.Item name="address" label="Address">
      <AddressSearch placeholder="Type to search address" />
    </Form.Item>
    <Form.Item name="checkIn" label="Check-in Time">
      <Input placeholder="e.g. 14:00" />
    </Form.Item>
    <Form.Item name="checkOut" label="Check-out Time">
      <Input placeholder="e.g. 11:00" />
    </Form.Item>
  </BaseIdeaForm>
);

export const AccommodationIdeaCard: React.FC<{
  subitem: AccommodationIdea;
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
          {subitem.type && (
            <div>
              <Typography.Text type="secondary">Type</Typography.Text>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>🏨</span>
                <Typography.Text>{subitem.type}</Typography.Text>
              </div>
            </div>
          )}
          {subitem.address && (
            <div>
              <Typography.Text type="secondary">Address</Typography.Text>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>📍</span>
                <Typography.Text>{subitem.address}</Typography.Text>
              </div>
            </div>
          )}
          {subitem.checkIn && (
            <div>
              <Typography.Text type="secondary">Check-in</Typography.Text>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>🕒</span>
                <Typography.Text>{subitem.checkIn}</Typography.Text>
              </div>
            </div>
          )}
          {subitem.checkOut && (
            <div>
              <Typography.Text type="secondary">Check-out</Typography.Text>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>🕒</span>
                <Typography.Text>{subitem.checkOut}</Typography.Text>
              </div>
            </div>
          )}
        </div>
      }
    />
  );
};
