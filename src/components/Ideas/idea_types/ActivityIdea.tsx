import React from "react";
import { Form, Input, AutoComplete, theme, Typography, Segmented } from "antd";
import { DollarRating } from "../../shared/DollarRating";
import { BaseIdea, BaseIdeaCard, BaseIdeaForm } from "./BaseIdea";

export interface ActivityIdea extends BaseIdea {
  duration?: string;
  price?: number;
  location?: string;
  difficulty?: "easy" | "moderate" | "challenging" | "extreme";
}

export function createActivityIdea(name: string): ActivityIdea {
  return {
    name,
    photos: [],
    duration: "",
    price: 0,
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
      <Form.Item name="price" label="Cost">
        <DollarRating />
      </Form.Item>
      <Form.Item name="location" label="Location">
        <AutoComplete options={[]} placeholder="Type to search location" />
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
        </div>
      }
    />
  );
};
