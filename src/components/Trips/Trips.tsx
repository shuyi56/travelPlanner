import React from "react";
import { Card, Row, Col, Button, Typography, Form, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import TripCard from "./TripCard.tsx";
import TripForm from "./TripForm.tsx";
import { Trip } from "./types.ts";
import { redirect } from "react-router-dom";

const { Title } = Typography;

const Trips: React.FC = () => {
  const [trips, setTrips] = React.useState<Trip[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingTrip, setEditingTrip] = React.useState<Trip | null>(null);

  const handleCreateTrip = (values: Trip) => {
    if (editingTrip) {
      setTrips(
        trips.map((trip) =>
          trip.id === editingTrip.id ? { ...values, id: trip.id } : trip
        )
      );
      setEditingTrip(null);
    } else {
      setTrips([...trips, { ...values, id: Date.now().toString() }]);
    }
    setIsModalOpen(false);
  };

  const handleEdit = (trip: Trip) => {
    setEditingTrip(trip);
    setIsModalOpen(true);
  };

  const handleDelete = (tripId: string) => {
    setTrips(trips.filter((trip) => trip.id !== tripId));
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTrip(null);
  };

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Title level={2}>My Trips</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Create New Trip
        </Button>
      </div>

      <Row
        gutter={[24, 24]}
        style={{
          display: "flex",
          flexWrap: "wrap",
          margin: "0 -12px", // compensate for gutter
        }}
      >
        {trips.map((trip) => (
          <Col
            xs={24}
            sm={12}
            md={8}
            lg={6}
            key={trip.id}
            style={{
              display: "flex",
              padding: "12px", // add padding to maintain spacing
            }}
          >
            <TripCard trip={trip} onEdit={handleEdit} onDelete={handleDelete} />
          </Col>
        ))}
      </Row>

      <Modal
        title={editingTrip ? "Edit Trip" : "Create New Trip"}
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
      >
        <TripForm onSubmit={handleCreateTrip} initialValues={editingTrip} />
      </Modal>
    </div>
  );
};

export default Trips;
