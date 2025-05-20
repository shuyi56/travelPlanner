import React from "react";
import {
  CarOutlined,
  CoffeeOutlined,
  CameraOutlined,
  ThunderboltOutlined,
  HomeOutlined,
} from "@ant-design/icons";

export const eventTypeIcons = {
  Travel: <CarOutlined style={{ color: "#1890ff" }} />,
  Flight: <span style={{ fontSize: 16 }}>✈️</span>,
  Eating: <CoffeeOutlined style={{ color: "#52c41a" }} />,
  Sightseeing: <CameraOutlined style={{ color: "#eb2f96" }} />,
  Activities: <ThunderboltOutlined style={{ color: "#faad14" }} />,
  Accommodation: <HomeOutlined style={{ color: "rgba(201, 9, 35, 0.95)" }} />,
  Activity: <ThunderboltOutlined style={{ color: "#faad14" }} />,
  Other: <span style={{ fontSize: 16 }}>📝</span>,
};
