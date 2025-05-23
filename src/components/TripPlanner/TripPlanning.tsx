import React, { useState } from "react";
import {
  Form,
  Input,
  DatePicker,
  InputNumber,
  Button,
  Card,
  Steps,
  List,
  Modal,
  Select,
  theme,
  Image,
  TimePicker,
  Row,
  Col,
  Drawer,
  Breadcrumb,
  Dropdown,
} from "antd";
import {
  CarOutlined,
  CoffeeOutlined,
  EyeOutlined,
  AppstoreOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { MdFlight } from "react-icons/md";
import dayjs, { Dayjs } from "dayjs";
import { Steps as AntSteps } from "antd";
import {
  TripEvent,
  TravelTripEvent,
  EatingTripEvent,
  SightseeingTripEvent,
  AccommodationTripEvent,
  ActivityTripEvent,
} from "./TripEventTypes";
import { EventFormBuilder } from "./EventFormBuilder";
import { eventTypeIcons } from "../shared/EventTypeIcons";
import AddressImage from "../shared/AddressImage";
import { useParams } from "react-router-dom";

const { RangePicker } = DatePicker;
const { Option } = Select;

type EventType = TripEvent["type"] | "Flight" | "Other";

interface TripDetails {
  tripName: string;
  travelers: number;
  dates: [Dayjs, Dayjs];
  days: string[];
}

interface EventModalState {
  open: boolean;
  date: string | null;
}

interface Destination {
  id: string;
  name: string;
  days: string[];
  imageUrl?: string;
}

interface DestinationModalState {
  open: boolean;
  numDays: number;
  name: string;
  imageUrl?: string;
}

interface EventDetailsViewState {
  open: boolean;
  event: TripEvent | null;
  date: string | null;
  eventIndex: number;
  from?: string;
  to?: string;
  depTime?: Dayjs | null;
  arrTime?: Dayjs | null;
  beginTime?: Dayjs | null;
  endTime?: Dayjs | null;
  mapsLink?: string;
  desc?: string;
  description?: string;
  minPrice?: number;
  maxPrice?: number;
}

function getDatesInRange(start: Dayjs, end: Dayjs): string[] {
  const dates: string[] = [];
  let curr = dayjs(start);
  const last = dayjs(end);
  while (curr.isBefore(last) || curr.isSame(last, "day")) {
    dates.push(curr.format("YYYY-MM-DD"));
    curr = curr.add(1, "day");
  }
  return dates;
}

function getEventFormState(
  eventType: EventType,
  input: string,
  details: any
): any {
  const baseFields = {
    name: input,
    description: details.description,
    beginTime: details.beginTime,
    endTime: details.endTime,
    minPrice: details.minPrice, // Changed from price to minPrice
    maxPrice: details.maxPrice, // Added maxPrice
  };

  switch (eventType) {
    case "Travel":
    case "Flight":
      return {
        type: "Travel",
        ...baseFields,
        transportType:
          eventType === "Flight" ? "Flight" : details.transportType,
        from: details.from,
        to: details.to,
      };
    case "Eating":
      return {
        type: "Eating",
        ...baseFields,
        cuisine: details.cuisine,
        address: details.address,
      };
    case "Sightseeing":
      return {
        type: "Sightseeing",
        ...baseFields,
        location: details.location,
        openingHours: details.openingHours,
        bestTime: details.bestTime,
      };
    case "Accommodation":
      return {
        type: "Accommodation",
        ...baseFields,
        typeName: details.typeName,
        address: details.address,
        checkIn: details.checkIn,
        checkOut: details.checkOut,
      };
    case "Activity":
    case "Other":
    default:
      return {
        type: "Activity",
        ...baseFields,
        duration: details.duration,
        location: details.location,
        difficulty: details.difficulty,
      };
  }
}

function TripPlanning() {
  const { id } = useParams<{ id: string }>();
  const [storedTrips, setStoredTrips] = useState(() => {
    const stored = localStorage.getItem("trips");
    return stored ? JSON.parse(stored) : [];
  });
  const [step, setStep] = useState<number>(0);
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [events, setEvents] = useState<Record<string, TripEvent[]>>({});
  const [eventModal, setEventModal] = useState<EventModalState>({
    open: false,
    date: null,
  });
  const [eventInput, setEventInput] = useState<string>("");
  const [eventType, setEventType] = useState<EventType>("Other");
  const [eventDetails, setEventDetails] = useState<{
    from?: string;
    to?: string;
    depTime?: Dayjs | null;
    arrTime?: Dayjs | null;
    beginTime?: Dayjs | null;
    endTime?: Dayjs | null;
    mapsLink?: string;
    description?: string;
    minPrice?: number; // Add these lines
    maxPrice?: number; // Add these lines
  }>({
    from: "",
    to: "",
    depTime: null,
    arrTime: null,
    beginTime: null,
    endTime: null,
    mapsLink: "",
    description: "",
    minPrice: undefined,
    maxPrice: undefined,
  });
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [destinationModal, setDestinationModal] =
    useState<DestinationModalState>({
      open: false,
      numDays: 1,
      name: "",
      imageUrl: undefined,
    });
  const [activeDestination, setActiveDestination] = useState<string>("");
  const [eventDetailsView, setEventDetailsView] =
    useState<EventDetailsViewState>({
      open: false,
      event: null,
      date: null,
      eventIndex: -1,
      from: "",
      to: "",
      depTime: null,
      arrTime: null,
      beginTime: null,
      endTime: null,
      mapsLink: "",
      desc: "",
      description: "",
    });
  const [isEventFormSubmitted, setIsEventFormSubmitted] = useState(false);

  // Add a state to track the edited event details in the modal
  const [editEventDetails, setEditEventDetails] = useState<any>(null);

  // Ant Design theme for dark/light mode
  const { token } = theme.useToken();
  const isDark = token.colorBgBase === "#141414";

  // Card color/type mapping (adapt to theme)

  // Stage 1: Trip Details
  const [form] = Form.useForm();
  const [destinationForm] = Form.useForm(); // Add new form for destination

  const handleTripDetails = (values: {
    tripName: string;
    travelers: number;
    dates: [Dayjs, Dayjs];
  }) => {
    const [start, end] = values.dates;
    const days = getDatesInRange(start, end);
    setTripDetails({ ...values, days });
    // Initialize events for each day
    const initialEvents: Record<string, TripEvent[]> = {};
    days.forEach((d) => {
      initialEvents[d] = [];
    });
    setEvents(initialEvents);
    setDestinations([]); // Initialize empty destinations
    setStep(1);
  };

  // Stage 2: Add Events
  const openAddEvent = (date: string) => {
    const dayEvents = events[date] || [];
    let latestEndTime: Dayjs | null = null;
    if (dayEvents.length > 0) {
      // Find the latest endTime (ignoring null/undefined)
      latestEndTime =
        dayEvents
          .map((ev) => ev.endTime)
          .filter((t): t is Dayjs => !!t)
          .sort((a, b) => dayjs(a).diff(dayjs(b)))[dayEvents.length - 1] ||
        null;
    }

    setEventInput("");
    setEventType("Other");
    setEventDetails({
      from: "",
      to: "",
      depTime: null,
      arrTime: null,
      beginTime: latestEndTime,
      endTime: null,
      mapsLink: "",
      description: "",
      minPrice: undefined,
      maxPrice: undefined,
      address: "", // <-- reset address
      location: "", // <-- reset location
      cuisine: "", // <-- reset cuisine (optional, for Eating)
      openingHours: "", // <-- reset openingHours (optional, for Sightseeing)
      bestTime: "", // <-- reset bestTime (optional, for Sightseeing)
      typeName: "", // <-- reset typeName (optional, for Accommodation)
      checkIn: "", // <-- reset checkIn (optional, for Accommodation)
      checkOut: "", // <-- reset checkOut (optional, for Accommodation)
      difficulty: "", // <-- reset difficulty (optional, for Activity)
      duration: "", // <-- reset duration (optional, for Activity)
    });
    setEventModal({ open: true, date });
  };

  const handleAddEvent = () => {
    setIsEventFormSubmitted(true);
    if (
      !eventInput.trim() ||
      !eventModal.date ||
      !eventDetails.beginTime ||
      !eventDetails.endTime
    )
      return;
    const baseEvent = {
      name: eventInput.trim(),
      description: eventDetails.description,
      beginTime: eventDetails.beginTime,
      endTime: eventDetails.endTime,
      minPrice: eventDetails.minPrice,
      maxPrice: eventDetails.maxPrice,
    };

    let event: TripEvent;
    if (eventType === "Travel" || eventType === "Flight") {
      event = {
        type: "Travel",
        ...baseEvent,
        ...eventDetails, // Ensure all additional fields are included
      } as TravelTripEvent;
    } else if (eventType === "Eating") {
      event = {
        type: "Eating",
        ...baseEvent,
        ...eventDetails, // Include cuisine, address, etc.
      } as EatingTripEvent;
    } else if (eventType === "Sightseeing") {
      event = {
        type: "Sightseeing",
        ...baseEvent,
        ...eventDetails, // Include location, openingHours, bestTime, etc.
      } as SightseeingTripEvent;
    } else if (eventType === "Accommodation") {
      event = {
        type: "Accommodation",
        ...baseEvent,
        ...eventDetails, // Include typeName, address, checkIn, checkOut, etc.
      } as AccommodationTripEvent;
    } else if (eventType === "Activity") {
      event = {
        type: "Activity",
        ...baseEvent,
        ...eventDetails, // Include duration, location, difficulty, etc.
      } as ActivityTripEvent;
    } else {
      event = {
        type: "Activity",
        ...baseEvent,
        ...eventDetails,
      } as ActivityTripEvent;
    }
    setEvents((prev) => ({
      ...prev,
      [eventModal.date!]: [...(prev[eventModal.date!] || []), event],
    }));
    console.log(events);
    setEventModal({ open: false, date: null });
    setEventInput("");
    setEventType("Other");
    setEventDetails({
      from: "",
      to: "",
      depTime: null,
      arrTime: null,
      beginTime: null,
      endTime: null,
      mapsLink: "",
      description: "",
    });
    // Reset the submitted state after successful submission
    setIsEventFormSubmitted(false);
  };

  const handleAddDestination = () => {
    if (!tripDetails || !destinationModal.name) return;
    const availableDays = tripDetails.days.filter(
      (day) => !destinations.some((dest) => dest.days.includes(day))
    );
    if (availableDays.length < destinationModal.numDays) return;

    const newDest: Destination = {
      id: `dest-${Date.now()}`,
      name: destinationModal.name,
      days: availableDays.slice(0, destinationModal.numDays),
      imageUrl: destinationModal.imageUrl,
    };

    setDestinations([...destinations, newDest]);
    setDestinationModal({
      open: false,
      numDays: 1,
      name: "",
      imageUrl: undefined,
    });
    destinationForm.resetFields();
  };

  // Add a function to handle the numDays change
  const handleNumDaysChange = (val: number | null) => {
    const newValue = val || 1;
    setDestinationModal((prev) => ({
      ...prev,
      numDays: newValue,
    }));
    destinationForm.setFieldValue("numDays", newValue);
  };

  // Modify handleDestinationModalCancel to initialize form with current values
  const handleDestinationModalCancel = () => {
    setDestinationModal({
      open: false,
      numDays: 1,
      name: "",
      imageUrl: undefined,
    });
    destinationForm.resetFields();
  };

  const handleStepClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveDestination(id);
    }
  };

  // When opening the event details modal, initialize editEventDetails
  const handleViewEventDetails = (
    date: string,
    index: number,
    event: TripEvent
  ) => {
    setEventDetailsView({
      open: true,
      event,
      date,
      eventIndex: index,
      from: (event as any).from || "",
      to: (event as any).to || "",
      depTime: (event as any).depTime || null,
      arrTime: (event as any).arrTime || null,
      beginTime: event.beginTime || null,
      endTime: event.endTime || null,
      mapsLink: (event as any).mapsLink || "",
      desc: event.name,
      description: event.description || "",
      minPrice: event.minPrice,
      maxPrice: event.maxPrice,
    });
    setEditEventDetails({
      ...event,
      name: event.name,
      from: (event as any).from || "",
      to: (event as any).to || "",
      depTime: (event as any).depTime || null,
      arrTime: (event as any).arrTime || null,
      beginTime: event.beginTime || null,
      endTime: event.endTime || null,
      mapsLink: (event as any).mapsLink || "",
      description: event.description || "",
      desc: event.name,
      minPrice: event.minPrice,
      maxPrice: event.maxPrice,
    });
  };

  // Update handleUpdateEventDetails to use editEventDetails
  const handleUpdateEventDetails = () => {
    if (
      !eventDetailsView.date ||
      eventDetailsView.eventIndex < 0 ||
      !editEventDetails
    )
      return;

    setEvents((prev) => ({
      ...prev,
      [eventDetailsView.date!]: prev[eventDetailsView.date!].map((ev, idx) =>
        idx === eventDetailsView.eventIndex
          ? {
              ...ev,
              ...editEventDetails,
              name: editEventDetails.desc ?? editEventDetails.name ?? "",
              description: editEventDetails.description,
              from: editEventDetails.from ?? (ev as any).from,
              to: editEventDetails.to ?? (ev as any).to,
              depTime: editEventDetails.depTime ?? (ev as any).depTime,
              arrTime: editEventDetails.arrTime ?? (ev as any).arrTime,
              beginTime: editEventDetails.beginTime,
              endTime: editEventDetails.endTime,
              mapsLink: editEventDetails.mapsLink,
              minPrice: editEventDetails.minPrice, // Add these lines
              maxPrice: editEventDetails.maxPrice, // Add these lines
            }
          : ev
      ),
    }));
    setEventDetailsView((prev) => ({ ...prev, open: false }));
    setEditEventDetails(null);
  };

  const handleDeleteEvent = (date: string, index: number) => {
    setEvents((prev) => ({
      ...prev,
      [date]: prev[date].filter((_, idx) => idx !== index),
    }));
  };

  React.useEffect(() => {
    if (!step || !destinations.length) return;
    const scrollArea = document.getElementById("dest-scroll-area");
    if (!scrollArea) return;

    // Handler to update activeDestination as user scrolls
    const handleScroll = () => {
      let found = "";
      for (const dest of destinations) {
        const el = document.getElementById(dest.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const areaRect = scrollArea.getBoundingClientRect();
          // If the top of the card is within the scroll area, or above but not fully out of view
          if (rect.top <= areaRect.top + 40) {
            found = dest.id;
          }
        }
      }
      if (found && found !== activeDestination) {
        setActiveDestination(found);
      }
    };

    scrollArea.addEventListener("scroll", handleScroll, { passive: true });
    // Initial call to set correct active step
    handleScroll();

    return () => {
      scrollArea.removeEventListener("scroll", handleScroll);
    };
    // eslint-disable-next-line
  }, [step, destinations, activeDestination]);

  // Set tripDetails from id on mount or id change
  React.useEffect(() => {
    if (id && storedTrips.length > 0) {
      const found = storedTrips.find((t: any) => t.id === id);
      if (found) {
        const parsedDates = found.dates
          ? [dayjs(found.dates[0]), dayjs(found.dates[1])]
          : undefined;
        setTripDetails({
          ...found,
          dates: parsedDates,
          days:
            found.days ||
            (parsedDates
              ? getDatesInRange(parsedDates[0], parsedDates[1])
              : []),
        });
        setDestinations([]);
        setEvents({});
        setStep(1);
      }
    }
    // eslint-disable-next-line
  }, [id, storedTrips]);

  // Handler to switch trip details when a trip is selected from dropdown
  const handleSelectTrip = (trip: any) => {
    const parsedDates = trip.dates
      ? [dayjs(trip.dates[0]), dayjs(trip.dates[1])]
      : undefined;
    setTripDetails({
      ...trip,
      dates: parsedDates,
      days:
        trip.days ||
        (parsedDates ? getDatesInRange(parsedDates[0], parsedDates[1]) : []),
    });
    setDestinations([]);
    setEvents({});
    setStep(1);
    // Optionally update the URL if you want to reflect the trip id in the route
    // navigate(`/trip-planning/${trip.id}`);
  };

  const breadcrumbItems = [
    { title: "Home" },
    {
      title: (
        <Dropdown
          menu={{
            items: storedTrips.map((trip: any) => ({
              key: trip.id,
              label: trip.tripName,
              onClick: () => handleSelectTrip(trip),
            })),
          }}
        >
          <span style={{ cursor: "pointer" }}>
            {tripDetails ? tripDetails.tripName : "Select a Trip"}{" "}
            <DownOutlined />
          </span>
        </Dropdown>
      ),
    },
  ];

  return (
    <Card title="Trip Planning" variant="borderless">
      <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 16 }} />
      <div style={{ display: "flex" }}>
        <div
          style={{
            width: 200,
            position: "sticky",
            top: 0,
            height: "100vh",
            borderRight: `1px solid ${token.colorBorder}`,
            padding: "24px 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: token.colorBgContainer,
            zIndex: 1,
          }}
        >
          {tripDetails && (
            <Button
              type="primary"
              onClick={() =>
                setDestinationModal({ ...destinationModal, open: true })
              }
              style={{
                marginBottom: 32,
                width: "90%",
                fontSize: 18,
                padding: "16px 0",
              }}
              size="large"
              block
            >
              Add Destination
            </Button>
          )}
          <AntSteps
            style={{ height: "100%" }}
            direction="vertical"
            current={destinations.findIndex((d) => d.id === activeDestination)}
            items={destinations.map((dest) => {
              // Compute date range for this destination
              const sortedDays = [...dest.days].sort();
              const numDays = dest.days.length;
              let dateRange = "";
              if (numDays > 0) {
                const start = dayjs(sortedDays[0]).format("MMM D");
                const end = dayjs(sortedDays[numDays - 1]).format(
                  "MMM D, YYYY"
                );
                dateRange = numDays === 1 ? start : `${start} - ${end}`;
              }
              return {
                title: (
                  <span>
                    {dest.name}
                    <br />
                    <span style={{ fontSize: 12, color: "#888" }}>
                      {numDays} day{numDays > 1 ? "s" : ""}
                    </span>
                    <br />
                    <span style={{ fontSize: 12, color: "#888" }}>
                      {dateRange}
                    </span>
                  </span>
                ),
                status: dest.id === activeDestination ? "process" : "wait",
                onClick: () => handleStepClick(dest.id),
              };
            })}
          />
        </div>
        <div
          style={{
            flex: 1,
            paddingLeft: 20,
            overflowY: "auto",
            height: "100vh",
          }}
          id="dest-scroll-area"
        >
          <List
            itemLayout="vertical"
            dataSource={destinations}
            renderItem={(destination) => (
              <List.Item
                key={destination.id}
                id={destination.id}
                style={{
                  padding: "32px 0",
                  borderBottom: `1px solid ${token.colorBorder}`,
                }}
              >
                <div
                  style={{
                    marginBottom: 32,
                    borderBottom: `1px solid ${token.colorBorder}`,
                    paddingBottom: 24,
                    display: "flex",
                    gap: 24,
                    alignItems: "flex-start",
                  }}
                >
                  {destination.imageUrl && (
                    <Image
                      src={destination.imageUrl}
                      alt={destination.name}
                      style={{
                        width: 200,
                        height: 140,
                        objectFit: "cover",
                        borderRadius: 8,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <List.Item.Meta
                      title={
                        <div
                          style={{
                            fontSize: 28,
                            fontWeight: 600,
                            color: token.colorTextHeading,
                            marginBottom: 8,
                          }}
                        >
                          {destination.name}
                        </div>
                      }
                      description={
                        <div
                          style={{
                            fontSize: 14,
                            color: token.colorTextSecondary,
                          }}
                        >
                          {destination.days.length} day
                          {destination.days.length > 1 ? "s" : ""} •{" "}
                          {dayjs(destination.days[0]).format("MMM D")} -{" "}
                          {dayjs(
                            destination.days[destination.days.length - 1]
                          ).format("MMM D, YYYY")}
                        </div>
                      }
                    />
                  </div>
                </div>
                <List
                  itemLayout="vertical"
                  dataSource={destination.days}
                  renderItem={(date) => (
                    <div
                      key={date}
                      style={{
                        marginBottom: 24,
                        padding: "16px 0",
                        borderTop:
                          date !== destination.days[0]
                            ? `1px solid ${token.colorBorderSecondary}`
                            : "none",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 16,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 500,
                            color: token.colorTextHeading,
                          }}
                        >
                          {dayjs(date).format("dddd, MMM D, YYYY")}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <Button
                            type="text"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => openAddEvent(date)}
                          >
                            Add Event
                          </Button>
                          <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                          >
                            Edit Day
                          </Button>
                        </div>
                      </div>
                      <div>
                        {events[date] && events[date].length > 0 ? (
                          <List
                            dataSource={events[date]}
                            renderItem={(ev, idx) => (
                              <List.Item
                                key={idx}
                                style={{
                                  padding: "8px 0",
                                  borderBottom: `1px solid ${token.colorBorderSecondary}`,
                                }}
                                actions={[
                                  <Button
                                    type="text"
                                    icon={<EllipsisOutlined />}
                                    onClick={() =>
                                      handleViewEventDetails(date, idx, ev)
                                    }
                                  />,
                                  <Button
                                    type="text"
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDeleteEvent(date, idx)}
                                    danger
                                  />,
                                ]}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 4,
                                    width: "100%",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 16,
                                    }}
                                  >
                                    <div
                                      style={{
                                        minWidth: 120,
                                        fontSize: 14,
                                        color: token.colorTextSecondary,
                                      }}
                                    >
                                      {ev.beginTime
                                        ? dayjs(ev.beginTime).format("HH:mm")
                                        : "--:--"}
                                      {" → "}
                                      {ev.endTime
                                        ? dayjs(ev.endTime).format("HH:mm")
                                        : "--:--"}
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        color: token.colorTextSecondary,
                                      }}
                                    >
                                      {eventTypeIcons[ev.type]}
                                      <span>{ev.type}</span>
                                    </div>
                                    <div style={{ flex: 1 }}>{ev.name}</div>
                                  </div>
                                  {ev.description && (
                                    <div
                                      style={{
                                        fontSize: 12,
                                        color: token.colorTextTertiary,
                                        paddingLeft: 120, // Align with content after time
                                      }}
                                    >
                                      {ev.description}
                                    </div>
                                  )}
                                </div>
                              </List.Item>
                            )}
                          />
                        ) : (
                          <div
                            style={{
                              color: token.colorTextQuaternary,
                              fontStyle: "italic",
                              padding: "12px 0",
                            }}
                          >
                            No events planned.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                />
              </List.Item>
            )}
          />
        </div>
      </div>

      <Drawer
        title={`Add Event for ${
          eventModal.date ? dayjs(eventModal.date).format("MMM D, YYYY") : ""
        }`}
        open={eventModal.open}
        onClose={() => setEventModal({ open: false, date: null })}
        width={480}
        extra={
          <Button type="primary" onClick={handleAddEvent}>
            Add Event
          </Button>
        }
        getContainer={false}
      >
        <div style={{ marginBottom: 16 }}>
          <Select<EventType>
            value={eventType}
            onChange={(val) => {
              setEventType(val);
              setEventDetails({});
              setEventInput("");
            }}
            style={{ width: "100%" }}
          >
            <Option value="Flight">Flight</Option>
            <Option value="Travel">Travel</Option>
            <Option value="Eating">Eating</Option>
            <Option value="Sightseeing">Sightseeing</Option>
            <Option value="Accommodation">Accommodation</Option>
            <Option value="Activity">Activity</Option>
            <Option value="Other">Other</Option>
          </Select>
        </div>
        <Form layout="vertical">
          <EventFormBuilder
            event={getEventFormState(eventType, eventInput, eventDetails)}
            onChange={(changed) => {
              if ("name" in changed) {
                setEventInput(changed.name ?? "");
              } else {
                setEventDetails((prev) => ({ ...prev, ...changed }));
              }
            }}
            isSubmitted={isEventFormSubmitted}
            existingEvents={eventModal.date ? events[eventModal.date] : []}
            currentIndex={undefined}
          />
        </Form>
      </Drawer>

      <Modal
        title="Add Destination"
        open={destinationModal.open}
        onOk={handleAddDestination}
        onCancel={handleDestinationModalCancel}
        getContainer={false}
      >
        <Form
          form={destinationForm}
          layout="vertical"
          initialValues={{ numDays: destinationModal.numDays }}
        >
          <Form.Item label="Destination" required name="destination">
            <AddressImage
              onSelect={(
                address: string,
                placeId?: string,
                photoUrl?: string
              ) =>
                setDestinationModal((prev) => ({
                  ...prev,
                  name: address,
                  imageUrl: photoUrl,
                }))
              }
            />
          </Form.Item>
          <Form.Item label="Number of Days" required name="numDays">
            <InputNumber
              min={1}
              max={tripDetails?.days.length || 1}
              onChange={handleNumDaysChange}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Event Details"
        open={eventDetailsView.open}
        onOk={handleUpdateEventDetails}
        onCancel={() => {
          setEventDetailsView((prev) => ({ ...prev, open: false }));
          setEditEventDetails(null);
        }}
        okText="Save Changes"
        getContainer={false}
      >
        <Form layout="vertical">
          {eventDetailsView.event && (
            <EventFormBuilder
              event={
                editEventDetails || {
                  ...eventDetailsView.event,
                  ...eventDetailsView,
                  name:
                    eventDetailsView.desc ?? eventDetailsView.event?.name ?? "",
                }
              }
              onChange={(changed) => {
                setEditEventDetails((prev: any) => ({
                  ...((prev as any) || {
                    ...eventDetailsView.event,
                    ...eventDetailsView,
                    name:
                      eventDetailsView.desc ??
                      eventDetailsView.event?.name ??
                      "",
                  }),
                  ...changed,
                }));
              }}
              isSubmitted={isEventFormSubmitted}
              existingEvents={
                eventDetailsView.date ? events[eventDetailsView.date] : []
              }
              currentIndex={eventDetailsView.eventIndex}
            />
          )}
        </Form>
      </Modal>
    </Card>
  );
}

export default TripPlanning;
