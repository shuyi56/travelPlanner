import React from "react";
import { Card, Typography } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { Trip } from "./types.ts";

const { Text, Title, Paragraph } = Typography;

interface TripCardProps {
  trip: Trip;
  onEdit?: (trip: Trip) => void;
  onDelete?: (tripId: string) => void;
}

const TripCard: React.FC<TripCardProps> = ({ trip, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/trip-planning/${trip.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(trip);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && trip.id) {
      onDelete(trip.id);
    }
  };

  return (
    <Card
      hoverable
      onClick={handleClick}
      style={{
        maxHeight: 400,
        width: 300,
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
      actions={[
        <EditOutlined
          key="edit"
          onClick={handleEdit}
          style={{ color: "#1890ff" }} // blue color
        />,
        <DeleteOutlined
          key="delete"
          onClick={handleDelete}
          style={{ color: "#ff4d4f" }} // red color
        />,
      ]}
    >
      <Title level={4} ellipsis>
        {trip.tripName}
      </Title>
      <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
        {dayjs(trip.dates[0]).format("MMM D")} -{" "}
        {dayjs(trip.dates[1]).format("MMM D, YYYY")}
      </Text>
      <Paragraph ellipsis={{ rows: 3 }}>{trip.description}</Paragraph>
    </Card>
  );
};

export default TripCard;
