import React from "react";
import {
  Steps,
  Typography,
  Button,
  Form,
  TimePicker,
  AutoComplete,
  Segmented,
  theme,
} from "antd";
import { DollarRating } from "../shared/DollarRating";
import { BaseIdea, BaseIdeaCard, BaseIdeaForm } from "./BaseIdea";

export interface TravelIdea extends BaseIdea {
  transportType?: string;
  from?: string;
  to?: string;
  duration?: string;
  cost?: number;
}

export const TravelIdeaForm: React.FC = () => (
  <BaseIdeaForm>
    <Form.Item name="transportType" label="Transport Type">
      <Segmented
        block
        options={[
          {
            value: "plane",
            label: (
              <div style={{ padding: "4px 0" }}>
                <span style={{ fontSize: 16, marginRight: 4 }}>✈️</span>Plane
              </div>
            ),
          },
          {
            value: "train",
            label: (
              <div style={{ padding: "4px 0" }}>
                <span style={{ fontSize: 16, marginRight: 4 }}>🚂</span>Train
              </div>
            ),
          },
          {
            value: "bus",
            label: (
              <div style={{ padding: "4px 0" }}>
                <span style={{ fontSize: 16, marginRight: 4 }}>🚌</span>Bus
              </div>
            ),
          },
          {
            value: "car",
            label: (
              <div style={{ padding: "4px 0" }}>
                <span style={{ fontSize: 16, marginRight: 4 }}>🚗</span>Car
              </div>
            ),
          },
        ]}
      />
    </Form.Item>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        gap: 16,
        alignItems: "flex-start",
      }}
    >
      <Form.Item
        name="from"
        label="From"
        style={{ margin: 0 }}
        rules={[{ required: true, message: "Please enter departure location" }]}
      >
        <AutoComplete
          options={[]}
          placeholder="Departure"
          style={{ width: "100%" }}
        />
      </Form.Item>
      <Form.Item
        name="duration"
        label="Duration"
        style={{ margin: 0, minWidth: 120 }}
        rules={[{ required: true, message: "Set duration" }]}
      >
        <TimePicker
          format="HH:mm"
          showNow={false}
          placeholder="Time"
          style={{ width: "100%" }}
        />
      </Form.Item>
      <Form.Item
        name="to"
        label="To"
        style={{ margin: 0 }}
        rules={[{ required: true, message: "Please enter arrival location" }]}
      >
        <AutoComplete
          options={[]}
          placeholder="Arrival"
          style={{ width: "100%" }}
        />
      </Form.Item>
    </div>
    <Form.Item name="cost" label="Estimated Cost">
      <DollarRating />
    </Form.Item>
  </BaseIdeaForm>
);

export const TravelIdeaCard: React.FC<{
  subitem: TravelIdea;
  onEdit?: (e: React.MouseEvent) => void;
}> = ({ subitem, onEdit }) => {
  const { token } = theme.useToken();
  const transportIcons: Record<string, string> = {
    plane: "✈️",
    train: "🚂",
    bus: "🚌",
    car: "🚗",
    other: "🚐",
  };

  return (
    <BaseIdeaCard
      subitem={subitem}
      onEdit={onEdit}
      extraHeader={
        <Typography.Text style={{ fontSize: 24, lineHeight: 1 }}>
          {transportIcons[subitem.transportType || "other"]}
        </Typography.Text>
      }
      extraBody={
        <Steps
          progressDot
          current={1}
          items={[
            {
              title: "From",
              description: subitem.from || "Not specified",
            },
            {
              title: (
                <div
                  style={{
                    textAlign: "center",
                    padding: "0 12px",
                    color: token.colorTextSecondary,
                    fontSize: 13,
                  }}
                >
                  <div>{subitem.duration}</div>
                  {subitem.cost && (
                    <div style={{ color: "#52c41a" }}>
                      {"$".repeat(subitem.cost)}
                    </div>
                  )}
                </div>
              ),
              description: "",
            },
            {
              title: "To",
              description: subitem.to || "Not specified",
            },
          ]}
        />
      }
    />
  );
};
