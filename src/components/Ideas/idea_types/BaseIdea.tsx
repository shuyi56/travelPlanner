import React from "react";
import { Typography, Button, theme, Form } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { createTravelIdea } from "./TravelIdea";
import { createEatingIdea } from "./EatingIdea";
import { createSightseeingIdea } from "./SightseeingIdea";
import { createActivityIdea } from "./ActivityIdea";
import { createAccommodationIdea } from "./AccommodationIdea";

export interface BaseIdea {
  name: string;
  notes?: string;
  photos?: string[];
}

export interface BaseIdeaCardProps<T extends BaseIdea> {
  subitem: T;
  onEdit?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
  extraHeader?: React.ReactNode;
  extraBody?: React.ReactNode;
}

export function BaseIdeaCard<T extends BaseIdea>({
  subitem,
  onEdit,
  children,
  extraHeader,
  extraBody,
}: BaseIdeaCardProps<T>) {
  const { token } = theme.useToken();
  return (
    <div style={{ padding: "20px 16px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        {extraHeader}
      </div>
      {children}
      {extraBody}
      {subitem.notes && (
        <Typography.Paragraph
          type="secondary"
          style={{
            marginTop: 16,
            fontSize: 14,
            background: token.colorBgTextHover,
            padding: 12,
            borderRadius: 6,
          }}
        >
          {subitem.notes}
        </Typography.Paragraph>
      )}
      <div
        style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
        }}
      ></div>
    </div>
  );
}

export interface BaseIdeaFormProps {
  children?: React.ReactNode;
}

export function BaseIdeaForm({ children }: BaseIdeaFormProps) {
  return <>{children}</>;
}

export function ideaFactory(category: string, name: string): BaseIdea {
  switch (category) {
    case "Eating":
      return createEatingIdea(name);
    case "Travel":
      return createTravelIdea(name);
    case "Sightseeing":
      return createSightseeingIdea(name);
    case "Activities":
      return createActivityIdea(name);
    case "Accommodation":
      return createAccommodationIdea(name);
    default:
      return { name, photos: [] };
  }
}

// Represents the entire state of the Ideas component
export interface IdeasAppState {
  ideas: any[];
  selectedIdx: number | null;
  isCreating: boolean;
  creatingSublist: number | null;
  showOutline: boolean;
  editingSubitem: any;
  flippedCards: Record<string, boolean>;
  fileList: any[];
  selectedSubitemIdx: number | null;
  expandedCard: any;
  drawerVisible: boolean;
  breakpoint: number;
}
