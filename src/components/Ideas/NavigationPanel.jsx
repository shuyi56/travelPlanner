import React from "react";
import { Button, Input, List, Typography, Empty, Collapse } from "antd";
import {
  PlusOutlined,
  FolderOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import SubItemCard from "./navigation/SubItemCard";

function NavigationPanel({
  token,
  isCreating,
  showOutline,
  ideas,
  selectedIdx,
  selectedSubitemIdx,
  creatingSublist,
  categoryIcons,
  darkMode,
  handleCreateNew,
  handleNewKeyPress,
  setIsCreating,
  setShowOutline,
  setSelectedIdx,
  handleItemClick,
  handleEditSubitem,
  setCreatingSublist,
  onSublistKeyPress,
}) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          padding: "12px 16px",
          borderBottom: `1px solid ${token.colorBorder}`,
          background: token.colorBgElevated,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 56,
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FolderOutlined />
          <Typography.Text strong style={{ fontSize: 15, letterSpacing: 0.2 }}>
            EXPLORER
          </Typography.Text>
        </div>
        <div
          onClick={() => {
            setShowOutline(!showOutline);
            setSelectedIdx(null);
          }}
          className="add-detail-button"
          style={{
            cursor: "pointer",
            background: showOutline ? token.colorPrimaryBg : token.colorBgContainer,
            borderRadius: 6,
            padding: "6px 12px",
            color: showOutline ? token.colorPrimaryText : token.colorText,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontWeight: 600,
            fontSize: 15,
            transition: "all 0.2s",
            border: showOutline
              ? `1.5px solid ${token.colorPrimary}`
              : `1.5px solid ${token.colorBorder}`,
            boxShadow: showOutline ? `0 2px 8px ${token.colorPrimaryBg}` : "none",
          }}
        >
          <UnorderedListOutlined style={{ fontSize: "16px" }} />
          <Typography.Text
            style={{
              color: showOutline ? token.colorPrimaryText : "inherit",
              fontSize: "15px",
              fontWeight: 600,
              letterSpacing: 0.2,
            }}
          >
            Outline
          </Typography.Text>
        </div>
      </div>
      <div style={{ padding: "16px 8px 8px 8px", flex: 1, overflow: "auto" }}>
        {!isCreating ? (
          <Button
            icon={<PlusOutlined />}
            onClick={handleCreateNew}
            className="gradient-button gradient-new-idea"
            style={{
              width: "100%",
              textAlign: "center",
              marginBottom: 16,
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 15,
              letterSpacing: 0.2,
            }}
            size="large"
          >
            New Idea
          </Button>
        ) : (
          <Input
            autoFocus
            placeholder="Enter idea name and press Enter"
            onKeyDown={handleNewKeyPress}
            onBlur={() => setIsCreating(false)}
            style={{
              marginBottom: 16,
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 500,
            }}
            size="large"
          />
        )}
        <List
          dataSource={ideas}
          renderItem={(idea, idx) => (
            <Collapse
              ghost
              style={{ marginBottom: 8 }}
              expandIcon={({ isActive }) => null}
              activeKey={selectedIdx === idx ? ["1"] : []}
            >
              <Collapse.Panel
                key="1"
                header={
                  <div
                    style={{
                      cursor: "pointer",
                      background: selectedIdx === idx ? token.colorPrimaryBg : "transparent",
                      borderRadius: 8,
                      padding: "8px 14px",
                      marginLeft: -12,
                      color: selectedIdx === idx ? token.colorPrimaryText : token.colorText,
                      width: "calc(100% + 24px)",
                      display: "flex",
                      alignItems: "center",
                      fontWeight: selectedIdx === idx ? 700 : 600,
                      fontSize: 16,
                      letterSpacing: 0.2,
                      boxShadow: selectedIdx === idx ? `0 2px 8px ${token.colorPrimaryBg}` : "none",
                      border: selectedIdx === idx
                        ? `1.5px solid ${token.colorPrimary}`
                        : "1.5px solid transparent",
                      transition: "all 0.2s",
                    }}
                    onClick={(e) => handleItemClick(idx, e)}
                  >
                    {categoryIcons[idea.category]}
                    <Typography.Text
                      ellipsis
                      style={{
                        color: selectedIdx === idx ? token.colorPrimaryText : "inherit",
                        fontSize: "16px",
                        fontWeight: 600,
                        marginLeft: 10,
                        letterSpacing: 0.2,
                        flex: 1,
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {idea.title}
                    </Typography.Text>
                  </div>
                }
                style={{ border: "none" }}
              >
                <div style={{ padding: "0 8px 0 32px" }}>
                  {idea.subitems?.map((subitem, subIdx) => (
                    <SubItemCard
                      key={subIdx}
                      subitem={subitem}
                      onClick={() => handleEditSubitem(idx, subitem, subIdx)}
                      isHighlighted={selectedIdx === idx && selectedSubitemIdx === subIdx}
                      style={{
                        marginBottom: 10,
                        fontWeight: 500,
                        fontSize: 15,
                        border: selectedIdx === idx && selectedSubitemIdx === subIdx
                          ? `2px solid ${token.colorPrimary}`
                          : "1px solid #f0f0f0",
                        boxShadow: selectedIdx === idx && selectedSubitemIdx === subIdx
                          ? `0 2px 8px ${token.colorPrimaryBg}`
                          : "none",
                        transition: "all 0.2s",
                      }}
                    />
                  ))}
                  {creatingSublist === idx ? (
                    <Input
                      autoFocus
                      placeholder="Enter subitem name and press Enter"
                      onKeyDown={(e) => onSublistKeyPress(e, idx)}
                      onBlur={() => setCreatingSublist(null)}
                      style={{
                        marginBottom: 10,
                        borderRadius: 8,
                        fontSize: 15,
                        fontWeight: 500,
                      }}
                      size="middle"
                    />
                  ) : (
                    <Button
                      variant={darkMode ? "outlined" : "filled"}
                      onClick={() => setCreatingSublist(idx)}
                      icon={<PlusOutlined />}
                      className={`gradient-button gradient-${idea.category.toLowerCase()}`}
                      style={{
                        width: "100%",
                        textAlign: "center",
                      }}
                      size="middle"
                    >
                      New Sub Idea
                    </Button>
                  )}
                </div>
              </Collapse.Panel>
            </Collapse>
          )}
          locale={{
            emptyText: (
              <Empty
                description="No ideas yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ margin: "20px 0" }}
              />
            ),
          }}
          style={{ marginTop: 8 }}
        />
      </div>
    </div>
  );
}

export default NavigationPanel;
