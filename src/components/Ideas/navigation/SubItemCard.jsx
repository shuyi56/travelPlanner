import React from "react";
import { Card, Typography, theme } from "antd";
import fallbackImg from "../../../assets/fallback.png";

const { useToken } = theme;

const SubItemCard = ({
  subitem,
  height = 160,
  onClick,
  showGradient = true,
  isHighlighted = false,
  style = {},
}) => {
  const { token } = useToken();
  if (!subitem) return null;

  const photoUrl =
    subitem.photos?.length > 0
      ? subitem.photos[0].thumbUrl || subitem.photos[0]
      : fallbackImg;

  return (
    <Card
      size="small"
      hoverable={!!onClick}
      onClick={onClick}
      style={{
        height,
        borderRadius: 8,
        overflow: "hidden",
        border: isHighlighted ? `2px solid ${token.colorPrimary}` : "none",
        position: "relative",
        cursor: onClick ? "pointer" : "default",
        background: "none",
        transition: "all 0.3s ease",
        transform: isHighlighted ? "scale(1.02)" : "scale(1)",
        boxShadow: isHighlighted
          ? `0 4px 12px ${token.colorPrimaryBg}`
          : "none",
        ...style,
      }}
      bodyStyle={{
        padding: 0,
        height: "100%",
        position: "relative",
        background: "none",
        color: "#fff",
      }}
    >
      <div style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, zIndex: 0 }}>
        <img
          src={photoUrl}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
        {showGradient && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: "40%",
              background: "linear-gradient(transparent, rgba(0,0,0,0.35))",
              zIndex: 1,
            }}
          />
        )}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 2,
          padding: 10,
          color: "#fff",
        }}
      >
        {typeof subitem === "string" ? (
          <span>{subitem}</span>
        ) : (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 4,
              }}
            >
              <Typography.Text strong style={{ color: "#fff", fontSize: 16 }}>
                {subitem.name}
              </Typography.Text>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SubItemCard;
