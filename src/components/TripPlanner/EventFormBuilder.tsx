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
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

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

// Add helper function at the top level
const timeOverlaps = (
  beginTime: Dayjs | null,
  endTime: Dayjs | null,
  existingEvents: TripEvent[],
  currentIndex?: number
) => {
  if (!beginTime || !endTime) return false;

  return existingEvents.some((event, idx) => {
    if (idx === currentIndex || !event.beginTime || !event.endTime)
      return false;

    const eventStart = dayjs(event.beginTime);
    const eventEnd = dayjs(event.endTime);
    const newStart = dayjs(beginTime);
    const newEnd = dayjs(endTime);

    return (
      // New event starts during existing event
      (newStart.isAfter(eventStart) && newStart.isBefore(eventEnd)) ||
      // New event ends during existing event
      (newEnd.isAfter(eventStart) && newEnd.isBefore(eventEnd)) ||
      // New event contains existing event
      (newStart.isBefore(eventStart) && newEnd.isAfter(eventEnd)) ||
      // Exact same start or end time
      newStart.isSame(eventStart) ||
      newEnd.isSame(eventEnd)
    );
  });
};

// Update getDisabledTime to accept beginTime for endTime picker
const getDisabledTime = (
  existingEvents: TripEvent[],
  currentIndex?: number,
  beginTime?: Dayjs | null
) => {
  return () => {
    const disabledHours = new Set<number>();

    existingEvents.forEach((event, idx) => {
      if (idx === currentIndex || !event.beginTime || !event.endTime) return;

      const start = dayjs(event.beginTime);
      const end = dayjs(event.endTime);

      for (let h = start.hour(); h <= end.hour(); h++) {
        disabledHours.add(h);
      }
    });

    // For endTime: disable all hours before beginTime, and the beginTime hour if beginTime is set
    if (beginTime) {
      for (let h = 0; h < beginTime.hour(); h++) {
        disabledHours.add(h);
      }
    }

    return {
      disabledHours: () => {
        const arr = Array.from(disabledHours);
        // For endTime: also disable the beginTime hour if minuteStep is 60 (full hour), otherwise handle in disabledMinutes
        if (beginTime) {
          if (!arr.includes(beginTime.hour())) {
            arr.push(beginTime.hour());
          }
        }
        return arr;
      },
      disabledMinutes: (selectedHour: number) => {
        // For endTime: if hour === beginTime.hour(), disable minutes <= beginTime.minute()
        if (beginTime && selectedHour === beginTime.hour()) {
          const arr = [];
          for (let m = 0; m <= beginTime.minute(); m += 1) {
            arr.push(m);
          }
          return arr;
        }
        return [];
      },
      disabledSeconds: () => [],
    };
  };
};

type EventFormBuilderProps = {
  event: TripEvent;
  onChange: (changed: Partial<TripEvent>) => void;
  existingEvents?: TripEvent[];
  currentIndex?: number;
  isSubmitted?: boolean;
};

export const EventFormBuilder: React.FC<EventFormBuilderProps> = ({
  event,
  onChange,
  existingEvents = [],
  currentIndex,
  isSubmitted = false,
}) => {
  const [errors, setErrors] = React.useState({
    name: "",
    beginTime: "",
    endTime: "",
  });

  // Check for time conflicts when time is selected
  const checkTimeConflicts = (
    beginTime: Dayjs | null,
    endTime: Dayjs | null
  ) => {
    if (!beginTime || !endTime) return false;

    return existingEvents.some((existingEvent, idx) => {
      if (
        idx === currentIndex ||
        !existingEvent.beginTime ||
        !existingEvent.endTime
      )
        return false;

      const eventStart = dayjs(existingEvent.beginTime);
      const eventEnd = dayjs(existingEvent.endTime);

      return (
        beginTime.isBetween(eventStart, eventEnd, null, "[]") ||
        endTime.isBetween(eventStart, eventEnd, null, "[]") ||
        eventStart.isBetween(beginTime, endTime, null, "[]") ||
        eventEnd.isBetween(beginTime, endTime, null, "[]")
      );
    });
  };

  React.useEffect(() => {
    if (isSubmitted) {
      const newErrors = {
        name: !event.name ? "Name is required" : "",
        beginTime: !event.beginTime ? "Begin time is required" : "",
        endTime: !event.endTime ? "End time is required" : "",
      };

      if (event.beginTime && event.endTime) {
        if (dayjs(event.beginTime).isAfter(dayjs(event.endTime))) {
          newErrors.beginTime = "Begin time must be before end time";
          newErrors.endTime = "End time must be after begin time";
        } else if (
          timeOverlaps(
            event.beginTime,
            event.endTime,
            existingEvents,
            currentIndex
          )
        ) {
          newErrors.beginTime = "Time conflicts with another event";
          newErrors.endTime = "Time conflicts with another event";
        }
      }

      setErrors(newErrors);
    }
  }, [
    event.name,
    event.beginTime,
    event.endTime,
    isSubmitted,
    existingEvents,
    currentIndex,
  ]);

  // Common layout for half-width items
  const halfWidthStyle = { width: "100%" };

  const commonFields = (
    <>
      <Form.Item
        label="Name"
        required
        validateStatus={errors.name ? "error" : ""}
        help={isSubmitted ? errors.name : undefined}
        style={{ marginBottom: 12 }}
      >
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
          <Form.Item
            label="Begin Time"
            required
            validateStatus={errors.beginTime ? "error" : ""}
            help={isSubmitted ? errors.beginTime : undefined}
            style={{ marginBottom: 12 }}
          >
            <TimePicker
              value={event.beginTime}
              onChange={(t) => {
                onChange({ beginTime: t, endTime: null }); // Reset end time
              }}
              format="HH:mm"
              style={halfWidthStyle}
              minuteStep={30}
              disabledTime={getDisabledTime(existingEvents, currentIndex)}
              hideDisabledOptions
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="End Time"
            required
            validateStatus={errors.endTime ? "error" : ""}
            help={isSubmitted ? errors.endTime : undefined}
            style={{ marginBottom: 12 }}
          >
            <TimePicker
              value={event.endTime}
              onChange={(t) => onChange({ endTime: t })}
              format="HH:mm"
              style={halfWidthStyle}
              minuteStep={30}
              disabledTime={getDisabledTime(
                existingEvents,
                currentIndex,
                event.beginTime
              )}
              hideDisabledOptions
              disabled={!event.beginTime}
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
      return <>{commonFields}</>;
  }
};

// Add this function export for compatibility with tests
export function eventFormBuilder(props: EventFormBuilderProps) {
  return <EventFormBuilder {...props} />;
}
