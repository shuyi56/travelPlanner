import React, { useState, useEffect } from "react";
import {
  Layout,
  Button,
  Input,
  Typography,
  Form,
  Empty,
  theme,
  Carousel,
  Upload,
  Steps,
  Modal,
  Drawer,
  Segmented,
} from "antd";
import {
  PlusOutlined,
  CarOutlined,
  CoffeeOutlined,
  CameraOutlined,
  ThunderboltOutlined,
  UploadOutlined,
  EnvironmentOutlined,
  FullscreenOutlined,
  EditOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { TravelIdeaCard, TravelIdeaForm } from "./idea_types/TravelIdea.tsx";
import { EatingIdeaCard, EatingIdeaForm } from "./idea_types/EatingIdea.tsx";
import { ActivityIdeaCard, ActivityIdeaForm } from "./idea_types/ActivityIdea.tsx";
import {
  SightseeingIdeaCard,
  SightseeingIdeaForm,
} from "./idea_types/SightseeingIdea.tsx";
import {
  AccommodationIdeaCard,
  AccommodationIdeaForm,
} from "./idea_types/AccommodationIdea.tsx";
import dayjs from "dayjs";
import fallbackImg from "../../assets/fallback.png";
import "./Ideas.css";
import { handleSublistKeyPress } from './Ideas.tsx';
import ImageCollage from "../shared/ImageCollage.jsx";
import OutlineOverview from "./OutlineOverview.jsx";
import NavigationPanel from "./NavigationPanel.jsx";

const { Sider, Content } = Layout;
const { useToken } = theme;

const categoryStyles = {
  Travel: {
    color: "#1890ff",
    bgColor: "#e6f7ff",
    borderColor: "#91d5ff",
    iconBg: "rgba(24, 144, 255, 0.1)",
  },
  Eating: {
    color: "#52c41a",
    bgColor: "#f6ffed",
    borderColor: "#b7eb8f",
    iconBg: "rgba(82, 196, 26, 0.1)",
  },
  Sightseeing: {
    color: "#eb2f96",
    bgColor: "#fff0f6",
    borderColor: "#ffadd2",
    iconBg: "rgba(235, 47, 150, 0.1)",
  },
  Activities: {
    color: "#faad14",
    bgColor: "#fffbe6",
    borderColor: "#ffe58f",
    iconBg: "rgba(250, 173, 20, 0.1)",
  },
  Accommodation: {
    color: "#f41d85",
    bgColor: "#fff0f6",
    borderColor: "#ffadd2",
    iconBg: "rgba(201, 9, 35, 0.95)",
  },
};

const categoryIcons = {
  Travel: <CarOutlined style={{ color: "#1890ff" }} />,
  Eating: <CoffeeOutlined style={{ color: "#52c41a" }} />,
  Sightseeing: <CameraOutlined style={{ color: "#eb2f96" }} />,
  Activities: <ThunderboltOutlined style={{ color: "#faad14" }} />,
  Accommodation: <HomeOutlined style={{color:categoryStyles.Accommodation.iconBg}} />,
};

function Ideas({darkMode}) {
  const { token } = useToken();
  const [ideas, setIdeas] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [creatingSublist, setCreatingSublist] = useState(null);
  const [showOutline, setShowOutline] = useState(false);
  const [editingSubitem, setEditingSubitem] = useState(null);
  const [flippedCards, setFlippedCards] = useState({});
  const [fileList, setFileList] = useState([]);
  const [selectedSubitemIdx, setSelectedSubitemIdx] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [form] = Form.useForm();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [breakpoint, setBreakpoint] = useState(window.innerWidth);

  // Add breakpoint listener
  useEffect(() => {
    const handleResize = () => setBreakpoint(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = breakpoint <= 500; // Changed from 1000 to 500

  // Fix: Reset and set form fields when editingSubitem changes
  React.useEffect(() => {
    if (editingSubitem) {
      form.resetFields();
      form.setFieldsValue(editingSubitem.details);
      setFileList(
        editingSubitem.details.photos
          ? editingSubitem.details.photos.map((photo, index) => ({
              uid: `-${index}`,
              name: `photo-${index}`,
              status: 'done',
              thumbUrl: photo
            }))
          : []
      );
    }
  }, [editingSubitem, form]);

  const priceOptions = [
    { value: "$", label: "$" },
    { value: "$$", label: "$$" },
    { value: "$$$", label: "$$$" },
    { value: "$$$$", label: "$$$$" },
    { value: "$$$$$", label: "$$$$$" },
  ];

  const handleCreateNew = () => {
    setIsCreating(true);
    setShowOutline(false);
  };

  const handleNewKeyPress = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      setIdeas([
        ...ideas,
        {
          title: e.target.value.trim(),
          content: "",
          category: "Activities",
        },
      ]);
      setIsCreating(false);
    } else if (e.key === "Escape") {
      setIsCreating(false);
    }
  };

  const handleSaveContent = (values) => {
    const updatedIdeas = [...ideas];
    updatedIdeas[selectedIdx] = { ...updatedIdeas[selectedIdx], ...values };
    setIdeas(updatedIdeas);
  };

  const handleSublistKeyPressWrapper = (e, parentIdx) => {
    const category = ideas[parentIdx].category;
    const result = handleSublistKeyPress(e, parentIdx, category, ideas);
    if (result) {
      setEditingSubitem({
        parentIdx,
        details: result,
      });
      setCreatingSublist(null);
    } else if (e.key === "Escape") {
      setCreatingSublist(null);
    }
  };

  const onSublistKeyPress = (e, idx) => handleSublistKeyPressWrapper(e, idx);

  const handleEditSubitem = (parentIdx, subitem, subIdx) => {
    const details = { ...subitem };
    if (details.duration && ideas[parentIdx].category === "Travel") {
      const [hours, minutes] = details.duration.split(":");
      details.duration = dayjs()
        .hour(parseInt(hours))
        .minute(parseInt(minutes));
    }

    setEditingSubitem({
      parentIdx,
      subIdx,
      details,
    });
    setSelectedSubitemIdx(subIdx);
    setShowOutline(false);
  };

  const handleEatingDetailsSave = (values) => {
    const updatedIdeas = [...ideas];
    const photos = fileList.map((file) => file.thumbUrl);
    const currentSubitems = [
      ...(updatedIdeas[editingSubitem.parentIdx].subitems || []),
    ];

    if (
      values.duration &&
      typeof values.duration === "object" &&
      values.duration.format
    ) {
      values.duration = values.duration.format("HH:mm");
    }

    if (typeof editingSubitem.subIdx === "number") {
      currentSubitems[editingSubitem.subIdx] = {
        ...values,
        photos:
          photos.length > 0
            ? photos
            : currentSubitems[editingSubitem.subIdx].photos,
      };
    } else {
      currentSubitems.push({
        ...values,
        photos,
      });
    }

    updatedIdeas[editingSubitem.parentIdx] = {
      ...updatedIdeas[editingSubitem.parentIdx],
      subitems: currentSubitems,
    };

    setIdeas(updatedIdeas);
    setFileList([]);
    setEditingSubitem(null);
  };

  const handleItemClick = (idx, e) => {
    setSelectedIdx(selectedIdx === idx ? null : idx);
    setShowOutline(false);
  };

  const handleImageUpload = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleCardFlip = (parentIdx, subIdx) => {
    const key = `${parentIdx}-${subIdx}`;
    setFlippedCards((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderSubitemsCarousel = (idea) => {
    if (!idea.subitems || idea.subitems.length === 0) return null;

    const carouselHeight = 600;
    const carouselWidth = 800; // fixed width for consistent shape

    const TravelSteps = ({ subitem }) => {
      const steps = [];
      if (subitem.from)
        steps.push({ title: subitem.from, icon: <EnvironmentOutlined /> });
      if (subitem.transportType)
        steps.push({ title: subitem.transportType, icon: <CarOutlined /> });
      if (subitem.to)
        steps.push({ title: subitem.to, icon: <EnvironmentOutlined /> });
      if (steps.length < 2 && subitem.duration)
        steps.push({ title: subitem.duration, icon: <ThunderboltOutlined /> });
      if (steps.length < 2 && subitem.cost)
        steps.push({
          title: `$${subitem.cost}`,
          icon: <ThunderboltOutlined />,
        });
      if (steps.length < 2)
        steps.push({ title: "Travel", icon: <CarOutlined /> });
      return (
        <Steps
          direction="vertical"
          size="small"
          current={steps.length - 1}
          style={{ height: "100%", minHeight: 180, marginRight: 16 }}
          items={steps}
        />
      );
    };

    return (
      <div style={{ marginBottom: 24, width: carouselWidth, maxWidth: "100%", marginLeft: "auto", marginRight: "auto" }}>
        <div style={{ padding: 0 }}>
          <Carousel
            dots
            slidesToShow={1}
            slidesToScroll={1}
            arrows
            className={darkMode ? "slick-next-dark" : ""}
            style={{ minWidth: carouselWidth, maxWidth: carouselWidth, width: carouselWidth }}
          >
            {idea.subitems.map((subitem, subIdx) => {
              const isFlipped = flippedCards[`${selectedIdx}-${subIdx}`];
              return (
                <div key={subIdx} style={{ width: carouselWidth, maxWidth: "100%" }}>
                  <div
                    onClick={() => handleCardFlip(selectedIdx, subIdx)}
                    style={{
                      height: carouselHeight,
                      width: carouselWidth,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        height: carouselHeight,
                        width: "100%",
                        margin: "0 3%",
                        transition: "transform 0.6s",
                        transformStyle: "preserve-3d",
                        transform: isFlipped ? "rotateY(180deg)" : "",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          width: "100%",
                          height: "100%",
                          backfaceVisibility: "hidden",
                          borderRadius: 12,
                          overflow: "hidden",
                          background:
                            subitem.photos?.length > 0
                              ? ``
                              : `url(${fallbackImg})`,
                        }}
                      >
                        {subitem.photos?.length > 0 ? (
                          <ImageCollage
                            images={subitem.photos}
                            height={carouselHeight}
                          />
                        ) : null}
                        <div
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: 20,
                            background:
                              "linear-gradient(transparent, rgba(0,0,0,0.05))",
                          }}
                        >
                          <Typography.Title
                            level={3}
                            style={{
                              color: "#fff",
                              margin: 0,
                              textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                            }}
                          ></Typography.Title>
                        </div>
                      </div>

                      <div
                        style={{
                          position: "absolute",
                          width: "100%",
                          height: "100%",
                          backfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                          background: token.colorBgContainer,
                          padding: 0,
                          border: `0.2px solid ${token.colorBorder}`,
                          display: "flex",
                          borderRadius: 12,

                          flexDirection: "column",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            padding: "12px 16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderBottom: `1px solid ${token.colorBorder}`,
                            minHeight: 48,
                            background: token.colorBgElevated,
                          }}
                        >
                          <Typography.Title
                            level={4}
                            style={{
                              margin: 0,
                              fontSize: 18,
                              fontWeight: 700,
                              flex: 1,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {subitem.name}
                          </Typography.Title>
                          <div style={{ display: "flex", gap: 8 }}>
                            <Button
                              type="text"
                              icon={<EditOutlined />}
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditSubitem(selectedIdx, subitem, subIdx);
                              }}
                              title="Edit"
                            />
                            <Button
                              type="text"
                              icon={<FullscreenOutlined />}
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedCard({
                                  category: idea.category,
                                  subitem,
                                  subIdx,
                                });
                              }}
                              title="Expand"
                            />
                          </div>
                        </div>
                        <div
                          style={{
                            overflow: "auto",
                            flex: 1,
                            padding: "0 16px",
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "stretch",
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {idea.category === "Travel" && (
                              <TravelIdeaCard
                                subitem={subitem}
                                onEdit={(e) => {
                                  e.stopPropagation();
                                  handleEditSubitem(
                                    selectedIdx,
                                    subitem,
                                    subIdx
                                  );
                                }}
                              />
                            )}
                            {idea.category === "Eating" && (
                              <EatingIdeaCard
                                subitem={subitem}
                                onEdit={(e) => {
                                  e.stopPropagation();
                                  handleEditSubitem(
                                    selectedIdx,
                                    subitem,
                                    subIdx
                                  );
                                }}
                              />
                            )}
                            {idea.category === "Sightseeing" && (
                              <SightseeingIdeaCard
                                subitem={subitem}
                                onEdit={(e) => {
                                  e.stopPropagation();
                                  handleEditSubitem(
                                    selectedIdx,
                                    subitem,
                                    subIdx
                                  );
                                }}
                              />
                            )}
                            {idea.category === "Activities" && (
                              <ActivityIdeaCard
                                subitem={subitem}
                                onEdit={(e) => {
                                  e.stopPropagation();
                                  handleEditSubitem(
                                    selectedIdx,
                                    subitem,
                                    subIdx
                                  );
                                }}
                              />
                            )}
                            {idea.category === "Accommodation" && (
                              <AccommodationIdeaCard
                                subitem={subitem}
                                onEdit={(e) => {
                                  e.stopPropagation();
                                  handleEditSubitem(
                                    selectedIdx,
                                    subitem,
                                    subIdx
                                  );
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </Carousel>
        </div>
      </div>
    );
  };

  return (
    <Layout
      style={{
        background: "transparent",
        minHeight:'100vh'
      }}
    >
      {isMobile ? (
        <>
          <Button
            type="text"
            icon={drawerVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            onClick={() => setDrawerVisible(!drawerVisible)}
            style={{
              position: 'fixed',
              top: 80,
              left: 10,
              zIndex: 100,
              background: token.colorBgContainer,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              width: 40,
              height: 40,
              borderRadius: '50%',
            }}
          />
          <Drawer
            placement="left"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            width={280}
            bodyStyle={{ padding: 0 }}
            contentWrapperStyle={{ position: 'fixed' }}
          >
            <NavigationPanel
              token={token}
              isCreating={isCreating}
              showOutline={showOutline}
              ideas={ideas}
              selectedIdx={selectedIdx}
              selectedSubitemIdx={selectedSubitemIdx}
              creatingSublist={creatingSublist}
              categoryIcons={categoryIcons}
              darkMode={darkMode}
              handleCreateNew={handleCreateNew}
              handleNewKeyPress={handleNewKeyPress}
              setIsCreating={setIsCreating}
              setShowOutline={setShowOutline}
              setSelectedIdx={setSelectedIdx}
              handleItemClick={handleItemClick}
              handleEditSubitem={handleEditSubitem}
              setCreatingSublist={setCreatingSublist}
              onSublistKeyPress={onSublistKeyPress}
            />
          </Drawer>
        </>
      ) : (
        <Sider
          width={280}
          style={{
            background: token.colorBgContainer,
            borderRight: `1px solid ${token.colorBorder}`,
            padding: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <NavigationPanel
            token={token}
            isCreating={isCreating}
            showOutline={showOutline}
            ideas={ideas}
            selectedIdx={selectedIdx}
            selectedSubitemIdx={selectedSubitemIdx}
            creatingSublist={creatingSublist}
            categoryIcons={categoryIcons}
            darkMode={darkMode}
            handleCreateNew={handleCreateNew}
            handleNewKeyPress={handleNewKeyPress}
            setIsCreating={setIsCreating}
            setShowOutline={setShowOutline}
            setSelectedIdx={setSelectedIdx}
            handleItemClick={handleItemClick}
            handleEditSubitem={handleEditSubitem}
            setCreatingSublist={setCreatingSublist}
            onSublistKeyPress={onSublistKeyPress}
          />
        </Sider>
      )}
      <Content
        style={{
          padding: 24,
          background: token.colorBgContainer,
          marginLeft: isMobile ? 0 : 1,
          overflowY: "auto",
          maxWidth: "100%",
        }}
      >
        {showOutline ? (
          <OutlineOverview
            ideas={ideas}
            token={token}
            categoryIcons={categoryIcons}
          />
        ) : editingSubitem ? (
          <Form
            form={form} // <-- Fix: use controlled form instance
            layout="vertical"
            onFinish={handleEatingDetailsSave}
            initialValues={editingSubitem.details}
            key={editingSubitem.parentIdx + '-' + (editingSubitem.subIdx ?? 'new')}
          >
            <Typography.Title level={3}>
              {typeof editingSubitem.subIdx === "number" ? "Edit" : "New"}{" "}
              {ideas[editingSubitem.parentIdx].category} Details
            </Typography.Title>
            {typeof editingSubitem.subIdx === "number" &&
              editingSubitem.details.photos?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <Typography.Text type="secondary">
                    Current Photos:
                  </Typography.Text>
                  <div key={`${editingSubitem.parentIdx}-${editingSubitem.subIdx}`}>
                    <ImageCollage
                      images={editingSubitem.details.photos}
                      height={300}
                    />
                  </div>
                </div>
              )}
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Photos">
              <Upload
                fileList={fileList}
                maxCount={4}
                multiple
                listType="picture-card"
                beforeUpload={async (file) => {
                  const base64 = await handleImageUpload(file);
                  setFileList((prev) => [
                    ...prev,
                    {
                      uid: `-${prev.length + 1}`,
                      name: file.name,
                      status: "done",
                      thumbUrl: base64,
                    },
                  ]);
                  return false;
                }}
                onRemove={(file) => {
                  setFileList((prev) =>
                    prev.filter((item) => item.uid !== file.uid)
                  );
                }}
              >
                {fileList.length < 4 && (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </Form.Item>

            {ideas[editingSubitem.parentIdx].category === "Eating" && (
              <EatingIdeaForm />
            )}
            {ideas[editingSubitem.parentIdx].category === "Travel" && (
              <TravelIdeaForm />
            )}
            {ideas[editingSubitem.parentIdx].category === "Sightseeing" && (
              <SightseeingIdeaForm />
            )}
            {ideas[editingSubitem.parentIdx].category === "Activities" && (
              <ActivityIdeaForm />
            )}
            {ideas[editingSubitem.parentIdx].category === "Accommodation" && (
              <AccommodationIdeaForm />
            )}

            <Form.Item name="notes" label="Additional Notes">
              <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                onClick={() => setEditingSubitem(null)}
              >
                Cancel
              </Button>
            </Form.Item>
          </Form>
        ) : selectedIdx !== null && ideas[selectedIdx] ? (
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div
              style={{
                marginBottom: 32,
                borderBottom: `1px solid ${token.colorBorder}`,
                paddingBottom: 24,
                background: token.colorBgContainer,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 24,
                  margin: "0 auto",
                }}
              >
                <Typography.Title
                  level={3}
                  style={{
                    margin: 0,
                    fontSize: 32,
                    fontWeight: 800,
                    textAlign: "center"
                  }}
                  editable={{
                    onChange: (newTitle) =>
                      handleSaveContent({ title: newTitle }),
                    autoSize: { maxRows: 1 },
                    triggerType: ["text", "icon"],
                  }}
                >
                  {ideas[selectedIdx].title}
                </Typography.Title>

                <Form
                  form={form}
                  initialValues={ideas[selectedIdx]}
                  onValuesChange={(_, allValues) =>
                    handleSaveContent(allValues)
                  }
                >
                  <Form.Item name="category" style={{ margin: 0 }}>
                    <Segmented
                      block
                      options={[
                        {
                          label: (
                            <div style={{ padding: "4px 0" }}>
                              <CarOutlined
                                style={{
                                  fontSize: 20,
                                  color:
                                    ideas[selectedIdx]?.category === "Travel"
                                      ? categoryStyles.Travel.color
                                      : "inherit",
                                  marginBottom: 4,
                                }}
                              />
                              <div>Travel</div>
                            </div>
                          ),
                          value: "Travel",
                        },
                        {
                          label: (
                            <div style={{ padding: "4px 0" }}>
                              <CoffeeOutlined
                                style={{
                                  fontSize: 20,
                                  color:
                                    ideas[selectedIdx]?.category === "Eating"
                                      ? categoryStyles.Eating.color
                                      : "inherit",
                                  marginBottom: 4,
                                }}
                              />
                              <div>Eating</div>
                            </div>
                          ),
                          value: "Eating",
                        },
                        {
                          label: (
                            <div style={{ padding: "4px 0" }}>
                              <CameraOutlined
                                style={{
                                  fontSize: 20,
                                  color:
                                    ideas[selectedIdx]?.category ===
                                    "Sightseeing"
                                      ? categoryStyles.Sightseeing.color
                                      : "inherit",
                                  marginBottom: 4,
                                }}
                              />
                              <div>Sightseeing</div>
                            </div>
                          ),
                          value: "Sightseeing",
                        },
                        {
                          label: (
                            <div style={{ padding: "4px 0" }}>
                              <ThunderboltOutlined
                                style={{
                                  fontSize: 20,
                                  color:
                                    ideas[selectedIdx]?.category ===
                                    "Activities"
                                      ? categoryStyles.Activities.color
                                      : "inherit",
                                  marginBottom: 4,
                                }}
                              />
                              <div>Activities</div>
                            </div>
                          ),
                          value: "Activities",
                        },
                        {
                          label: (
                            <div style={{ padding: "4px 0" }}>
                              <HomeOutlined
                                style={{
                                  fontSize: 20,
                                  color:
                                    ideas[selectedIdx]?.category ===
                                    "Accommodation"
                                      ? categoryStyles.Accommodation.iconBg
                                      : "inherit",
                                  marginBottom: 4,
                                }}
                              />
                              <div>Accommodation</div>
                            </div>
                          ),
                          value: "Accommodation",
                        },
                      ]}
                      style={{
                        backgroundColor: token.colorBgContainer,
                      }}
                      styles={{
                        block: {
                          borderRadius: 8,
                        },
                        item: {
                          padding: "8px 4px",
                          fontWeight: 500,
                          borderRadius: 6,
                          transition: "all 0.3s ease",
                        },
                        itemActive: (value) => ({
                          background: categoryStyles[value].bgColor,
                          color: categoryStyles[value].color,
                          fontWeight: 600,
                        }),
                      }}
                    />
                  </Form.Item>
                </Form>

                <Form
                  form={form}
                  layout="vertical"
                  initialValues={ideas[selectedIdx]}
                  onValuesChange={(_, allValues) =>
                    handleSaveContent(allValues)
                  }
                >
                  <Form.Item name="content" style={{ margin: 0 }}>
                    <Input.TextArea
                      rows={4}
                      placeholder="Write your idea details here..."
                      style={{
                        fontSize: 15,
                        border: "none",
                        resize: "none",
                        padding: 0,
                        background: "transparent",
                        lineHeight: 1.6,
                      }}
                    />
                  </Form.Item>
                </Form>
              </div>
            </div>

            {ideas[selectedIdx].subitems?.length > 0 ? (
              <div>
                <Typography.Title
                  level={2}
                  style={{
                    marginBottom: 12,
                    fontSize: 24,
                  }}
                >
                  Details & Notes
                </Typography.Title>
                {renderSubitemsCarousel(ideas[selectedIdx])}
                <Button
                  type="primary"
                  ghost
                  onClick={() => setCreatingSublist(selectedIdx)}
                  className="add-detail-button"
                  style={{
                    width: 180,
                    margin: "16px auto 0 auto",
                    height: 40,
                    borderRadius: 8,
                    borderStyle: "dashed",
                    borderWidth: 2,
                    fontSize: 15,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    background: token.colorBgContainer,
                    transition: "all 0.3s",
                    padding: 0,
                    boxShadow: "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <div

                    >
                      <PlusOutlined
                        style={{ fontSize: 16, color: token.colorPrimary }}
                      />
                    </div>
                    <span
                      style={{ fontWeight: 500, color: token.colorPrimary }}
                    >
                      Add Detail
                    </span>
                  </div>
                </Button>
              </div>
            ) : (
              <Button
                type="primary"
                ghost
                className="add-detail-button"
                onClick={() => setCreatingSublist(selectedIdx)}
                style={{
                  width: 180,
                  margin: "24px auto 0 auto",
                  height: 40,
                  borderRadius: 8,
                  borderStyle: "dashed",
                  borderWidth: 2,
                  fontSize: 15,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: token.colorBgContainer,
                  transition: "all 0.3s",
                  padding: 0,
                  boxShadow: "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <div
                    className="plus-icon-rounded"
                  >
                    <PlusOutlined
                    />
                  </div>
                  <span style={{ fontWeight: 500, color: token.colorPrimary }}>
                    Add Detail
                  </span>
                </div>
              </Button>
            )}
          </div>
        ) : (
          <Empty description="Select an idea or create a new one" />
        )}
        {expandedCard && (
          <Modal
            open={!!expandedCard}
            onCancel={() => setExpandedCard(null)}
            footer={null}
            width={800}
            style={{ top: 20 }}
            bodyStyle={{ padding: "24px" }}
          >
            {expandedCard && (
              <div>
                <Typography.Title level={3} style={{ marginBottom: 24 }}>
                  {expandedCard.subitem.name}
                </Typography.Title>
                <div
                  style={{ maxHeight: "calc(90vh - 200px)", overflow: "auto" }}
                >
                  {expandedCard.category === "Travel" && (
                    <TravelIdeaCard
                      subitem={expandedCard.subitem}
                      onEdit={(e) => {
                        e.stopPropagation();
                        handleEditSubitem(
                          selectedIdx,
                          expandedCard.subitem,
                          expandedCard.subIdx
                        );
                        setExpandedCard(null);
                      }}
                    />
                  )}
                  {expandedCard.category === "Eating" && (
                    <EatingIdeaCard
                      subitem={expandedCard.subitem}
                      onEdit={(e) => {
                        e.stopPropagation();
                        handleEditSubitem(
                          selectedIdx,
                          expandedCard.subitem,
                          expandedCard.subIdx
                        );
                        setExpandedCard(null);
                      }}
                    />
                  )}
                  {expandedCard.category === "Sightseeing" && (
                    <SightseeingIdeaCard
                      subitem={expandedCard.subitem}
                      onEdit={(e) => {
                        e.stopPropagation();
                        handleEditSubitem(
                          selectedIdx,
                          expandedCard.subitem,
                          expandedCard.subIdx
                        );
                        setExpandedCard(null);
                      }}
                    />
                  )}
                  {expandedCard.category === "Activities" && (
                    <ActivityIdeaCard
                      subitem={expandedCard.subitem}
                      onEdit={(e) => {
                        e.stopPropagation();
                        handleEditSubitem(
                          selectedIdx,
                          expandedCard.subitem,
                          expandedCard.subIdx
                        );
                        setExpandedCard(null);
                      }}
                    />
                  )}
                  {expandedCard.category === "Accommodation" && (
                    <AccommodationIdeaCard
                      subitem={expandedCard.subitem}
                      onEdit={(e) => {
                        e.stopPropagation();
                        handleEditSubitem(
                          selectedIdx,
                          expandedCard.subitem,
                          expandedCard.subIdx
                        );
                        setExpandedCard(null);
                      }}
                    />
                  )}

                  {expandedCard.subitem.photos?.length > 0 && (
                    <div style={{ marginTop: 24 }}>
                      <Typography.Title level={4}>Photos</Typography.Title>
                      <ImageCollage
                        images={expandedCard.subitem.photos}
                        height={300}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </Modal>
        )}
      </Content>
    </Layout>
  );
}

export default Ideas;
