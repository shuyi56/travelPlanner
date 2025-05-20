import React from "react";
import {
  Form,
  Input,
  TimePicker,
  InputNumber,
  Select,
  Row,
  Col,
  Segmented,
} from "antd";
import { BaseTripEvent, TripEvent } from "./TripEventTypes";
import { ActivityIdea } from "../Ideas/idea_types/ActivityIdea";
import AddressSearch from "../shared/AddressSearch";

// Add helper for handling nullable numbers
const handleNumberChange = (
  value: number | null,
  onChange: (val: number | undefined) => void
) => {
  onChange(value ?? undefined);
};

// Add difficulty colors constant
const difficultyColors: Record<string, string> = {
  easy: "#52c41a",
  moderate: "#faad14",
  challenging: "#fa8c16",
  extreme: "#f5222d",
};

type EventFormBuilderProps = {
  event: TripEvent; // Use the more specific TripEvent type
  onChange: (changed: Partial<TripEvent>) => void; // Update to match the specific type
};

export function eventFormBuilder({ event, onChange }: EventFormBuilderProps) {
  // Common layout for half-width items
  const halfWidthStyle = { width: "100%" };

  const commonFields = (
    <>
      <Form.Item label="Name" required style={{ marginBottom: 12 }}>
        <Input
          value={event.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </Form.Item>
      <Form.Item label="Description" style={{ marginBottom: 12 }}>
        <Input.TextArea
          value={event.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
          placeholder="Add a description for this event..."
        />
      </Form.Item>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Begin Time" style={{ marginBottom: 12 }}>
            <TimePicker
              value={event.beginTime}
              onChange={(t) => onChange({ beginTime: t })}
              format="HH:mm"
              style={halfWidthStyle}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="End Time" style={{ marginBottom: 12 }}>
            <TimePicker
              value={event.endTime}
              onChange={(t) => onChange({ endTime: t })}
              format="HH:mm"
              style={halfWidthStyle}
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  switch (event.type) {
    case "Travel":
      return (
        <>
          {commonFields}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Transport Type" style={{ marginBottom: 12 }}>
                <Input
                  value={event.transportType}
                  onChange={(e) => onChange({ transportType: e.target.value })}
                  style={halfWidthStyle}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="From" style={{ marginBottom: 12 }}>
                <AddressSearch
                  placeholder="From"
                  onSelect={(address) => onChange({ from: address })}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="To" style={{ marginBottom: 12 }}>
                <AddressSearch
                  placeholder="To"
                  onSelect={(address) => onChange({ to: address })}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Cost" style={{ marginBottom: 12 }}>
            <InputNumber
              value={event.cost}
              onChange={(val) =>
                handleNumberChange(val, (value) => onChange({ cost: value }))
              }
              prefix="$"
              precision={2}
              style={{ width: "50%" }}
            />
          </Form.Item>
        </>
      );
    case "Eating":
      return (
        <>
          {commonFields}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Cuisine" style={{ marginBottom: 12 }}>
                <Input
                  value={event.cuisine}
                  onChange={(e) => onChange({ cuisine: e.target.value })}
                  style={halfWidthStyle}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Price" style={{ marginBottom: 12 }}>
                <InputNumber
                  value={event.price}
                  onChange={(val) =>
                    handleNumberChange(val, (value) =>
                      onChange({ price: value })
                    )
                  }
                  prefix="$"
                  precision={2}
                  style={halfWidthStyle}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Address" style={{ marginBottom: 12 }}>
            <AddressSearch
              placeholder="Address"
              onSelect={(address) => onChange({ address })}
            />
          </Form.Item>
        </>
      );
    case "Sightseeing":
      return (
        <>
          {commonFields}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Location" style={{ marginBottom: 12 }}>
                <AddressSearch
                  placeholder="Location"
                  onSelect={(address) => onChange({ location: address })}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Price" style={{ marginBottom: 12 }}>
                <InputNumber
                  value={event.price}
                  onChange={(val) =>
                    handleNumberChange(val, (value) =>
                      onChange({ price: value })
                    )
                  }
                  prefix="¥"
                  precision={2}
                  style={halfWidthStyle}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Opening Hours" style={{ marginBottom: 12 }}>
                <Input
                  value={event.openingHours}
                  onChange={(e) => onChange({ openingHours: e.target.value })}
                  style={halfWidthStyle}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Best Time" style={{ marginBottom: 12 }}>
                <Input
                  value={event.bestTime}
                  onChange={(e) => onChange({ bestTime: e.target.value })}
                  style={halfWidthStyle}
                />
              </Form.Item>
            </Col>
          </Row>
        </>
      );
    case "Accommodation":
      return (
        <>
          {commonFields}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Type" style={{ marginBottom: 12 }}>
                <Input
                  value={event.typeName}
                  onChange={(e) => onChange({ typeName: e.target.value })}
                  style={halfWidthStyle}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Price" style={{ marginBottom: 12 }}>
                <InputNumber
                  value={event.price}
                  onChange={(val) =>
                    handleNumberChange(val, (value) =>
                      onChange({ price: value })
                    )
                  }
                  prefix="¥"
                  precision={2}
                  style={halfWidthStyle}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Address" style={{ marginBottom: 12 }}>
            <AddressSearch
              placeholder="Address"
              onSelect={(address) => onChange({ address })}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Check In" style={{ marginBottom: 12 }}>
                <Input
                  value={event.checkIn}
                  onChange={(e) => onChange({ checkIn: e.target.value })}
                  style={halfWidthStyle}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Check Out" style={{ marginBottom: 12 }}>
                <Input
                  value={event.checkOut}
                  onChange={(e) => onChange({ checkOut: e.target.value })}
                  style={halfWidthStyle}
                />
              </Form.Item>
            </Col>
          </Row>
        </>
      );
    case "Activity":
      return (
        <>
          {commonFields}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Price" style={{ marginBottom: 12 }}>
                <InputNumber
                  value={event.price}
                  onChange={(val) =>
                    handleNumberChange(val, (value) =>
                      onChange({ price: value })
                    )
                  }
                  prefix="$"
                  precision={2}
                  style={{ width: "50%" }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Location" style={{ marginBottom: 12 }}>
            <AddressSearch
              placeholder="Location"
              onSelect={(address) => onChange({ location: address })}
            />
          </Form.Item>
          <Form.Item label="Difficulty Level" style={{ marginBottom: 12 }}>
            <Segmented
              value={event.difficulty?.toLowerCase()}
              onChange={(val) =>
                onChange({ difficulty: val as ActivityIdea["difficulty"] })
              }
              options={[
                {
                  value: "easy",
                  label: (
                    <span
                      style={{ color: difficultyColors.easy, fontWeight: 600 }}
                    >
                      Easy
                    </span>
                  ),
                },
                {
                  value: "moderate",
                  label: (
                    <span
                      style={{
                        color: difficultyColors.moderate,
                        fontWeight: 600,
                      }}
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
                      style={{
                        color: difficultyColors.extreme,
                        fontWeight: 600,
                      }}
                    >
                      Extreme
                    </span>
                  ),
                },
              ]}
              block
            />
          </Form.Item>
        </>
      );
    default:
      return commonFields;
  }
}
