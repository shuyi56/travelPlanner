import React from "react";
import { Typography, Button, theme, Form } from "antd";
import { EyeOutlined } from "@ant-design/icons";

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
        <Typography.Title level={4} style={{ margin: 0 }}>
          {subitem.name}
        </Typography.Title>
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
      >
        <Button
          size="middle"
          type="primary"
          ghost
          icon={<EyeOutlined />}
          onClick={onEdit}
        >
          Edit Details
        </Button>
      </div>
    </div>
  );
}

export interface BaseIdeaFormProps {
  children?: React.ReactNode;
}

export function BaseIdeaForm({ children }: BaseIdeaFormProps) {
  return <>{children}</>;
}
