import React from "react";
import { Form, Input, theme, Typography, Segmented, InputNumber } from "antd";
import { DollarRating } from "../../shared/DollarRating";
import { BaseIdea, BaseIdeaCard, BaseIdeaForm } from "./BaseIdea";
import AddressSearch from "../../shared/AddressSearch";

export interface ActivityIdea extends BaseIdea {
  duration?: string;
  price_low?: number;
  price_high?: number;
  location?: string;
  difficulty?: "easy" | "moderate" | "challenging" | "extreme";
}

export function createActivityIdea(name: string): ActivityIdea {
  return {
    name,
    photos: [],
    duration: "",
    price_low: 0,
    price_high: 0,
    location: "",
    difficulty: "easy",
  };
}

export const ActivityIdeaForm: React.FC = () => {
  const difficultyColors: Record<string, string> = {
    easy: "#52c41a",
    moderate: "#faad14",
    challenging: "#fa8c16",
    extreme: "#f5222d",
  };

  return (
    <BaseIdeaForm>
      <Form.Item name="duration" label="Duration">
        <Input placeholder="e.g. 2 hours" />
      </Form.Item>
      <Form.Item name="price_low" label="Minimum Price">
        <InputNumber min={0} placeholder="e.g. 10" style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item
        name="price_high"
        label="Maximum Price"
        dependencies={["price_low"]}
        rules={[
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("price_low") <= value) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error("Minimum price cannot be greater than maximum price.")
              );
            },
          }),
        ]}
      >
        <InputNumber min={0} placeholder="e.g. 50" style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="location" label="Location">
        <AddressSearch placeholder="Type to search location" />
      </Form.Item>
      <Form.Item name="difficulty" label="Difficulty Level">
        <Segmented
          options={[
            {
              value: "easy",
              label: (
                <span style={{ color: difficultyColors.easy, fontWeight: 600 }}>
                  Easy
                </span>
              ),
            },
            {
              value: "moderate",
              label: (
                <span
                  style={{ color: difficultyColors.moderate, fontWeight: 600 }}
                >
                  Moderate
                </span>
              ),
            },
            {
              value: "challenging",
              label: (
                <span
                  style={{
                    color: difficultyColors.challenging,
                    fontWeight: 600,
                  }}
                >
                  Challenging
                </span>
              ),
            },
            {
              value: "extreme",
              label: (
                <span
                  style={{ color: difficultyColors.extreme, fontWeight: 600 }}
                >
                  Extreme
                </span>
              ),
            },
          ]}
          block
        />
      </Form.Item>
    </BaseIdeaForm>
  );
};

export const ActivityIdeaCard: React.FC<{
  subitem: ActivityIdea;
  onEdit?: (e: React.MouseEvent) => void;
}> = ({ subitem, onEdit }) => {
  const { token } = theme.useToken();
  const difficultyColors: Record<string, string> = {
    easy: "#52c41a",
    moderate: "#faad14",
    challenging: "#fa8c16",
    extreme: "#f5222d",
  };

  const getPriceString = () => {
    const { price_low, price_high } = subitem;
    if (price_low && price_high && price_low !== price_high) {
      return `$${price_low} - $${price_high}`;
    }
    if (price_low && price_high && price_low === price_high) {
      return `$${price_low}`;
    }
    if (price_low && price_low > 0) {
      return `At least $${price_low}`;
    }
    if (price_high && price_high > 0) {
      return `Up to $${price_high}`;
    }
    return null;
  };

  const priceString = getPriceString();

  return (
    <BaseIdeaCard
      subitem={subitem}
      onEdit={onEdit}
      extraHeader={
        subitem.difficulty ? (
          <Typography.Text
            style={{
              color: difficultyColors[subitem.difficulty],
              fontWeight: 600,
              fontSize: 16,
              textTransform: "capitalize",
            }}
          >
            {subitem.difficulty}
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
          {subitem.duration && (
            <div>
              <Typography.Text type="secondary">Duration</Typography.Text>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>⏱️</span>
                <Typography.Text>{subitem.duration}</Typography.Text>
              </div>
            </div>
          )}
          {subitem.location && (
            <div>
              <Typography.Text type="secondary">Location</Typography.Text>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>📍</span>
                <Typography.Text>{subitem.location}</Typography.Text>
              </div>
            </div>
          )}
          {priceString && (
            <div>
              <Typography.Text type="secondary">Estimated Cost</Typography.Text>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>💰</span>
                <Typography.Text>{priceString}</Typography.Text>
              </div>
            </div>
          )}
        </div>
      }
    />
  );
};
