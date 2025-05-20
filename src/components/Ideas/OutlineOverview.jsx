import React from "react";
import { Card, Typography, Divider, Empty } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import ImageCollage from "../shared/ImageCollage";

const SUBCARD_WIDTH = 533;
const SUBCARD_HEIGHT = 300;
const SUB_CARD_META_HEIGHT = 160;

function OutlineOverview({ ideas, token, categoryIcons }) {
  const getMaxWidth = (subitems) => {
    const itemCount = Math.min(subitems?.length || 0, 4);
    const width = itemCount > 0 ? SUBCARD_WIDTH * itemCount + (itemCount - 1) * 24 + 50 : "100%";
    return width;
  };

  return (
    <div style={{ padding: "24px" }}>
      <Typography.Title level={3} style={{ marginBottom: 32 }}>
        Ideas Overview
      </Typography.Title>
      {ideas.map((idea, idx) => (
        <div 
          key={idx} 
          style={{ 
            marginBottom: 48,
            maxWidth: getMaxWidth(idea.subitems)
          }}
        >
          <div 
            style={{ 
              display: "flex", 
              alignItems: "flex-start", 
              gap: 16,
              marginBottom: 16,
              padding: `${2}vh ${3}vh`,
              background: `linear-gradient(to right, ${token.colorBgContainer}, ${token.colorBgElevated})`,
              borderRadius: 16,
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                borderRadius: 12,
                background: token.colorPrimaryBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                width: 56,
                height: 56,
                flexShrink: 0,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                border: `1px solid ${token.colorBorder}`,
              }}
            >
              {categoryIcons[idea.category]}
            </div>
            <div style={{ flex: 1, paddingTop: 4 }}>
              <Typography.Title level={2} style={{ margin: 0, marginBottom: 8 }}>
                {idea.title}
              </Typography.Title>
              <Typography.Paragraph
                style={{
                  color: token.colorTextSecondary,
                  margin: 0,
                  fontSize: 15,
                }}
                ellipsis={{ rows: 2 }}
              >
                {idea.content || "No description added yet"}
              </Typography.Paragraph>
            </div>
          </div>

          <div style={{ padding: "0 24px" }}>
            {idea.subitems?.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 24,
                  justifyContent: "flex-start",
                }}
              >
                {idea.subitems.map((subitem, subIdx) => (
                  <Card
                    key={subIdx}
                    hoverable
                    style={{
                      width: SUBCARD_WIDTH,
                      padding: 0,
                      flex: "0 0 auto",
                    }}
                    cover={
                      subitem.photos?.length > 0 ? (
                        <div style={{ height: SUBCARD_HEIGHT, overflow: "hidden", marginBottom: 4 }}>
                          <ImageCollage
                            images={subitem.photos}
                            height={SUBCARD_HEIGHT}
                            width={SUBCARD_WIDTH}
                          />
                        </div>
                      ) : null
                    }
                    bodyStyle={{
                      padding: 0,
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      height: SUB_CARD_META_HEIGHT,
                      overflow: "auto",
                    }}
                  >
                    <Card.Meta
                      title={
                        <div style={{ textAlign: "center", marginTop: subitem.photos?.length > 0 ? 0 : 8 }}>
                          {subitem.name}
                        </div>
                      }
                      description={
                        <div
                          style={{
                            fontSize: 12,
                            color: token.colorTextSecondary,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 2,
                            textAlign: "left",
                            padding: "0 8px",
                          }}
                        >
                          {subitem.cuisine && (
                            <div style={{ width: "100%" }}>{subitem.cuisine}</div>
                          )}
                          {subitem.address && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-start",
                                gap: 4,
                                width: "100%",
                              }}
                            >
                              <EnvironmentOutlined /> {subitem.address}
                            </div>
                          )}
                          {subitem.notes ? (
                            <div
                              style={{
                                marginTop: 4,
                                color: token.colorText,
                                padding: 4,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                whiteSpace: "normal",
                                width: "100%",
                              }}
                              title={subitem.notes}
                            >
                              {subitem.notes}
                            </div>
                          ) : (
                            <div 
                              style={{
                                marginTop: 8,
                                padding: "8px 12px",
                                background: token.colorFillContent,
                                borderRadius: 6,
                                height:100,
                                color: token.colorTextDisabled,
                                fontSize: 12,
                                width: "100%",
                                textAlign: "center"
                              }}
                            >
                              No description available
                            </div>
                          )}
                        </div>
                      }
                    />
                  </Card>
                ))}
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No items added yet"
                style={{ 
                  margin: "48px 0",
                  padding: "24px",
                  background: token.colorBgContainer,
                  borderRadius: 12,
                }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default OutlineOverview;
