import React, { useState } from 'react';
import { Layout, Button, Input, List, Typography, Form, Empty, theme, Collapse, Card, Carousel, Segmented, Upload, Steps, TimePicker } from 'antd';
import { PlusOutlined, FolderOutlined, CarOutlined, CoffeeOutlined, CameraOutlined, UnorderedListOutlined, ThunderboltOutlined, UploadOutlined, LeftOutlined, RightOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { TravelIdeaCard, TravelIdeaForm } from './idea_types/TravelIdea.tsx';
import { EatingIdeaCard, EatingIdeaForm } from './idea_types/EatingIdea.tsx';
import { ActivityIdeaCard, ActivityIdeaForm } from './idea_types/ActivityIdea.tsx';
import { SightseeingIdeaCard, SightseeingIdeaForm } from './idea_types/SightseeingIdea.tsx';
import dayjs from 'dayjs';
import fallbackImg from '../assets/fallback.png';
const { Sider, Content } = Layout;
const { useToken } = theme;

const categoryIcons = {
  Travel: <CarOutlined style={{ color: '#1890ff' }} />,
  Eating: <CoffeeOutlined style={{ color: '#52c41a' }} />,
  Sightseeing: <CameraOutlined style={{ color: '#eb2f96' }} />,
  Activities: <ThunderboltOutlined style={{ color: '#faad14' }} />,
};

const SubItemCard = ({ 
  subitem, 
  height = 160, 
  onClick,
  showGradient = true,
  isHighlighted = false,
  style = {} 
}) => {
  const { token } = useToken();
  if (!subitem) return null;

  return (
    <Card
      size="small"
      hoverable={!!onClick}
      onClick={onClick}
      style={{ 
        height,
        borderRadius: 8,
        overflow: 'hidden',
        border: isHighlighted ? `2px solid ${token.colorPrimary}` : 'none',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        background: subitem.photos?.length > 0 
          ? `url(${subitem.photos[0].thumbUrl || subitem.photos[0]})` 
          : `url(${fallbackImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'all 0.3s ease',
        transform: isHighlighted ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isHighlighted ? `0 4px 12px ${token.colorPrimaryBg}` : 'none',
        ...style
      }}
      bodyStyle={{ 
        padding: 12,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: showGradient ? 'linear-gradient(transparent, rgba(0,0,0,0.8))' : 'transparent',
        color: '#fff'
      }}
    >
      {typeof subitem === 'string' ? (
        <span>{subitem}</span>
      ) : (
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 4
          }}>
            <Typography.Text strong style={{ color: '#fff', fontSize: 16 }}>
              {subitem.name}
            </Typography.Text>
            {subitem.price && (
              <Typography.Text style={{ color: '#52c41a' }}>
                {'$'.repeat(subitem.price)}
              </Typography.Text>
            )}
          </div>
          {(subitem.cuisine || subitem.address) && (
            <div style={{ 
              fontSize: 12,
              color: 'rgba(255, 255, 255, 0.85)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}>
              {subitem.cuisine && <span>{subitem.cuisine}</span>}
              {subitem.address && (
                <span style={{ 
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  📍 {subitem.address}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

const ImageCollage = ({ images, height = 120 }) => {
  if (!images?.length) return null;
  
  const layouts = {
    1: [['100%']],
    2: [['50%', '50%']],
    3: [['100%'], ['50%', '50%']],
    4: [['50%', '50%'], ['50%', '50%']]
  };

  const layout = layouts[Math.min(images.length, 4)] || layouts[4];
  
  return (
    <div style={{ height, overflow: 'hidden', borderRadius: 6 }}>
      {layout.map((row, i) => (
        <div key={i} style={{ display: 'flex', height: `${100 / layout.length}%`, gap: 8, padding: '4px 0' }}>
          {row.map((width, j) => {
            const imageIndex = i * 2 + j;
            if (imageIndex >= images.length) return null;
            const mockSubitem = {
              photos: [images[imageIndex]]
            };
            return (
              <div key={j} style={{ width, height: '100%' }}>
                <SubItemCard
                  subitem={mockSubitem}
                  height="100%"
                  showGradient={false}
                  style={{
                    margin: 0,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    borderRadius: 0
                  }}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

function Ideas() {
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
  const [form] = Form.useForm();

  const priceOptions = [
    { value: '$', label: '$' },
    { value: '$$', label: '$$' },
    { value: '$$$', label: '$$$' },
    { value: '$$$$', label: '$$$$' },
    { value: '$$$$$', label: '$$$$$' },
  ];

  const handleCreateNew = () => {
    setIsCreating(true);
    setShowOutline(false);
  };

  const handleNewKeyPress = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      setIdeas([...ideas, { 
        title: e.target.value.trim(), 
        content: '',
        category: 'Activities' 
      }]);
      setIsCreating(false);
    } else if (e.key === 'Escape') {
      setIsCreating(false);
    }
  };

  const handleSaveContent = (values) => {
    const updatedIdeas = [...ideas];
    updatedIdeas[selectedIdx] = { ...updatedIdeas[selectedIdx], ...values };
    setIdeas(updatedIdeas);
  };

  const handleSublistKeyPress = (e, parentIdx) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      const category = ideas[parentIdx].category;
      const details = {
        name: e.target.value.trim(),
        photos: [], // Add photos field
      };

      // Add category-specific fields
      switch (category) {
        case 'Eating':
          details.address = '';
          details.price = '';
          details.description = '';
          details.cuisine = '';
          break;
        case 'Travel':
          details.transportType = '';
          details.duration = '';
          details.cost = '';
          details.from = '';
          details.to = '';
          details.notes = '';
          break;
        case 'Sightseeing':
          details.location = '';
          details.price = '';
          details.openingHours = '';
          details.bestTime = '';
          details.notes = '';
          break;
        case 'Activities':
          details.duration = '';
          details.price = '';
          details.location = '';
          details.difficulty = '';
          details.notes = '';
          break;
      }

      setEditingSubitem({
        parentIdx,
        details
      });
      setCreatingSublist(null);
    } else if (e.key === 'Escape') {
      setCreatingSublist(null);
    }
  };

  const handleEditSubitem = (parentIdx, subitem, subIdx) => {
    // Convert duration string back to dayjs object if exists
    const details = { ...subitem };
    if (details.duration && ideas[parentIdx].category === 'Travel') {
      const [hours, minutes] = details.duration.split(':');
      details.duration = dayjs().hour(parseInt(hours)).minute(parseInt(minutes));
    }
    
    setEditingSubitem({
      parentIdx,
      subIdx,
      details
    });
    setSelectedSubitemIdx(subIdx);
    setShowOutline(false);
  };

  const handleEatingDetailsSave = (values) => {
    const updatedIdeas = [...ideas];
    const photos = fileList.map(file => file.thumbUrl);
    const currentSubitems = [...(updatedIdeas[editingSubitem.parentIdx].subitems || [])];

    // Format duration if it's a dayjs object
    if (values.duration && typeof values.duration === 'object' && values.duration.format) {
      values.duration = values.duration.format('HH:mm');
    }

    if (typeof editingSubitem.subIdx === 'number') {
      // Update existing subitem
      currentSubitems[editingSubitem.subIdx] = {
        ...values,
        photos: photos.length > 0 ? photos : currentSubitems[editingSubitem.subIdx].photos
      };
    } else {
      // Add new subitem
      currentSubitems.push({
        ...values,
        photos
      });
    }

    updatedIdeas[editingSubitem.parentIdx] = {
      ...updatedIdeas[editingSubitem.parentIdx],
      subitems: currentSubitems
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
      reader.onerror = error => reject(error);
    });
  };

  const handleCardFlip = (parentIdx, subIdx) => {
    const key = `${parentIdx}-${subIdx}`;
    setFlippedCards(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderOutline = () => (
    <div style={{ padding: '24px' }}>
      <Typography.Title level={3} style={{ marginBottom: 32 }}>Ideas Overview</Typography.Title>
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginTop: 16 
      }}>
        {ideas.map((idea, idx) => (
          <Card
            key={idx}
            hoverable
            style={{ 
              height: '100%',
              borderRadius: 16,
              overflow: 'hidden',
              border: 'none',
              background: token.colorBgElevated,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
            bodyStyle={{
              padding: 0,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{
              padding: '20px 24px',
              borderBottom: `1px solid ${token.colorBorder}`,
              background: token.colorBgContainer,
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12,
                marginBottom: 16
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: token.colorPrimaryBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20
                }}>
                  {categoryIcons[idea.category]}
                </div>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {idea.title}
                </Typography.Title>
              </div>
              {idea.content && (
                <Typography.Paragraph
                  style={{ 
                    color: token.colorTextSecondary,
                    margin: 0
                  }}
                  ellipsis={{ rows: 2 }}
                >
                  {idea.content}
                </Typography.Paragraph>
              )}
            </div>
            
            {idea.subitems?.length > 0 && (
              <div style={{ 
                flex: 1,
                padding: '16px 24px',
                background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.02))'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 12
                }}>
                  <div style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: token.colorPrimary
                  }} />
                  <Typography.Text type="secondary" strong>
                    {idea.subitems.length} {idea.category === 'Eating' ? 'Places' : 'Items'}
                  </Typography.Text>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {idea.subitems.slice(0, 3).map((subitem, subIdx) => (
                    <div
                      key={subIdx}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: token.colorBgContainer,
                        border: `1px solid ${token.colorBorder}`,
                        fontSize: 13
                      }}
                    >
                      {typeof subitem === 'string' ? (
                        <span>{subitem}</span>
                      ) : (
                        <div>
                          {subitem.photos?.length > 0 && (
                            <div style={{ marginBottom: 8 }}>
                              <ImageCollage images={subitem.photos} height={120} />
                            </div>
                          )}
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 4
                          }}>
                            <Typography.Text strong>{subitem.name}</Typography.Text>
                            {subitem.price && (
                              <Typography.Text style={{ color: '#52c41a' }}>
                                {'$'.repeat(subitem.price)}
                              </Typography.Text>
                            )}
                          </div>
                          {(subitem.cuisine || subitem.address) && (
                            <div style={{ 
                              fontSize: 12,
                              color: token.colorTextSecondary,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 2
                            }}>
                              {subitem.cuisine && <span>{subitem.cuisine}</span>}
                              {subitem.address && (
                                <span style={{ 
                                  whiteSpace: 'nowrap',
                                  overflow: 'auto',
                                  textOverflow: 'ellipsis'
                                }}>
                                  📍 {subitem.address}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {idea.subitems.length > 3 && (
                    <Typography.Link style={{ fontSize: 13, textAlign: 'center' }}>
                      +{idea.subitems.length - 3} more items
                    </Typography.Link>
                  )}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );

  const navigatorStyles = {
    background: token.colorBgContainer,
    '.antlistItem': {
      padding: '4px 8px',
      margin: '2px 0',
      transition: 'all 0.2s',
      borderRadius: 4,
      '&:hover': {
        background: token.colorBgTextHover,
      }
    },
  };

  // Helper to render subitems as carousel cards
  const renderSubitemsCarousel = (idea) => {
    if (!idea.subitems || idea.subitems.length === 0) return null;

    const CustomArrow = ({ className, style, onClick, direction }) => (
      <div
        className={className}
        style={{
          ...style,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: token.colorBgContainer,
          width: 40,
          height: 40,
          borderRadius: '50%',
          cursor: 'pointer',
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          [direction]: -20,
          zIndex: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          transition: 'all 0.3s',
          border: `1px solid ${token.colorBorder}`
        }}
        onClick={onClick}
        onMouseEnter={e => {
          e.currentTarget.style.background = token.colorBgContainer;
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = token.colorBgContainer;
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        }}
      >
        {direction === 'left' ? (
          <LeftOutlined style={{ color: token.colorText }} />
        ) : (
          <RightOutlined style={{ color: token.colorText }} />
        )}
      </div>
    );

    return (
      <div style={{ marginBottom: 32 }}>
        <Typography.Title level={4} style={{ marginBottom: 16 }}>Sub Ideas</Typography.Title>
        <div style={{ padding: '0 20px' }}>
          <Carousel
            dots
            slidesToShow={Math.min(idea.subitems.length, 2)}
            slidesToScroll={1}
            arrows
            style={{ maxWidth: '100%' }}
            prevArrow={<CustomArrow direction="left" />}
            nextArrow={<CustomArrow direction="right" />}
          >
            {idea.subitems.map((subitem, subIdx) => {
              const isFlipped = flippedCards[`${selectedIdx}-${subIdx}`];
              return (
                <div key={subIdx} >
                  <div
                    onClick={() => handleCardFlip(selectedIdx, subIdx)}
                  >
                    <div style={{
                      position: 'relative',
                      height: 300,
                      marginRight:10,
                      transition: 'transform 0.6s',
                      transformStyle: 'preserve-3d',
                      transform: isFlipped ? 'rotateY(180deg)' : '',
                    }}>
                      {/* Front side */}
                      <div style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        borderRadius: 8,

                        overflow: 'hidden',
                      }}>
                        {subitem.photos?.length > 0 ? (
                          <ImageCollage images={subitem.photos} height={300} />
                        ) : null}
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: 16,
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.2))',
                        }}>
                          <Typography.Title level={3} style={{
                            color: '#fff',
                            margin: 0,
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                          }}>
                            {subitem.name}
                          </Typography.Title>
                        </div>
                      </div>
                      
                      {/* Back side */}
                      <div style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        background: token.colorBgContainer,
                        borderRadius: 8,
                        padding: 0,
                        border: `1px solid ${token.colorBorder}`,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                      }}>
                        {idea.category === 'Travel' && <TravelIdeaCard subitem={subitem} onEdit={(e) => {
                          e.stopPropagation();
                          handleEditSubitem(selectedIdx, subitem, subIdx);
                        }} />}
                        {idea.category === 'Eating' && <EatingIdeaCard subitem={subitem} onEdit={(e) => {
                          e.stopPropagation();
                          handleEditSubitem(selectedIdx, subitem, subIdx);
                        }} />}
                        {idea.category === 'Sightseeing' && <SightseeingIdeaCard subitem={subitem} onEdit={(e) => {
                          e.stopPropagation();
                          handleEditSubitem(selectedIdx, subitem, subIdx);
                        }} />}
                        {idea.category === 'Activities' && <ActivityIdeaCard subitem={subitem} onEdit={(e) => {
                          e.stopPropagation();
                          handleEditSubitem(selectedIdx, subitem, subIdx);
                        }} />}
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
    <Layout style={{ minHeight: 400, background: 'transparent' }}>
      <Sider 
        width={280} 
        style={{ 
          background: token.colorBgContainer,
          borderRight: `1px solid ${token.colorBorder}`,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Navigation header: Explorer left, Outline right */}
        <div style={{ 
          padding: '12px 16px',
          borderBottom: `1px solid ${token.colorBorder}`,
          background: token.colorBgElevated,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 56,
          gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FolderOutlined />
            <Typography.Text strong style={{ fontSize: 15, letterSpacing: 0.2 }}>EXPLORER</Typography.Text>
          </div>
          <div
            onClick={() => {
              setShowOutline(!showOutline);
              setSelectedIdx(null);
            }}
            style={{
              cursor: 'pointer',
              background: showOutline ? token.colorPrimaryBg : token.colorBgContainer,
              borderRadius: 6,
              padding: '6px 12px',
              color: showOutline ? token.colorPrimaryText : token.colorText,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 600,
              fontSize: 15,
              transition: 'all 0.2s',
              border: showOutline ? `1.5px solid ${token.colorPrimary}` : `1.5px solid ${token.colorBorder}`,
              boxShadow: showOutline ? `0 2px 8px ${token.colorPrimaryBg}` : 'none',
            }}
          >
            <UnorderedListOutlined style={{ fontSize: '16px' }} />
            <Typography.Text
              style={{
                color: showOutline ? token.colorPrimaryText : 'inherit',
                fontSize: '15px',
                fontWeight: 600,
                letterSpacing: 0.2,
              }}
            >
              Outline
            </Typography.Text>
          </div>
        </div>
        <div style={{ padding: '16px 8px 8px 8px', flex: 1, overflow: 'auto' }}>
          {/* Improved New Idea button */}
          {!isCreating ? (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateNew}
              style={{ 
                width: '100%', 
                textAlign: 'center', 
                marginBottom: 16,
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 15,
                letterSpacing: 0.2,
                boxShadow: '0 2px 8px rgba(24,144,255,0.08)'
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
                fontWeight: 500 
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
                activeKey={selectedIdx === idx ? ['1'] : []}
              >
                <Collapse.Panel
                  key="1"
                  header={
                    <div style={{
                      cursor: 'pointer',
                      background: selectedIdx === idx ? token.colorPrimaryBg : 'transparent',
                      borderRadius: 8,
                      padding: '8px 14px',
                      marginLeft: -12,
                      color: selectedIdx === idx ? token.colorPrimaryText : token.colorText,
                      width: 'calc(100% + 24px)',
                      display: 'flex',
                      alignItems: 'center',
                      fontWeight: selectedIdx === idx ? 700 : 600,
                      fontSize: 16,
                      letterSpacing: 0.2,
                      boxShadow: selectedIdx === idx ? `0 2px 8px ${token.colorPrimaryBg}` : 'none',
                      border: selectedIdx === idx ? `1.5px solid ${token.colorPrimary}` : '1.5px solid transparent',
                      transition: 'all 0.2s',
                    }}
                    onClick={(e) => handleItemClick(idx, e)}
                    >
                      {categoryIcons[idea.category] || categoryIcons.Other}
                      <Typography.Text 
                        ellipsis 
                        style={{ 
                          color: selectedIdx === idx ? token.colorPrimaryText : 'inherit',
                          fontSize: '16px',
                          fontWeight: 600,
                          marginLeft: 10,
                          letterSpacing: 0.2,
                          flex: 1,
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {idea.title}
                      </Typography.Text>
                    </div>
                  }
                  style={{ border: 'none' }}
                >
                  <div style={{ padding: '0 8px 0 32px' }}>
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
                          border: selectedIdx === idx && selectedSubitemIdx === subIdx ? `2px solid ${token.colorPrimary}` : '1px solid #f0f0f0',
                          boxShadow: selectedIdx === idx && selectedSubitemIdx === subIdx ? `0 2px 8px ${token.colorPrimaryBg}` : 'none',
                          transition: 'all 0.2s'
                        }}
                      />
                    ))}
                    {/* Improved New Subitem button with distinct background */}
                    {creatingSublist === idx ? (
                      <Input
                        autoFocus
                        placeholder="Enter subitem name and press Enter"
                        onKeyDown={(e) => handleSublistKeyPress(e, idx)}
                        onBlur={() => setCreatingSublist(null)}
                        style={{ 
                          marginBottom: 10, 
                          borderRadius: 8, 
                          fontSize: 15, 
                          fontWeight: 500 
                        }}
                        size="middle"
                      />
                    ) : (
                      <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={() => setCreatingSublist(idx)}
                        style={{ 
                          width: '100%', 
                          textAlign: 'center', 
                          marginBottom: 10,
                          borderRadius: 8,
                          fontWeight: 500,
                          fontSize: 15,
                          background: token.colorFillSecondary, // distinct background
                          border: `1.5px dashed ${token.colorBorder}`,
                          color: token.colorTextSecondary,
                          letterSpacing: 0.1,
                          boxShadow: 'none'
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
              emptyText: <Empty 
                description="No ideas yet" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ margin: '20px 0' }}
              /> 
            }}
            style={{ 
              marginTop: 8,
              ...navigatorStyles
            }}
          />
        </div>
      </Sider>
      <Content style={{ 
        padding: 24, 
        background: token.colorBgContainer,
        marginLeft: 1,
        overflowY: 'auto',
        maxWidth: 1000,
      }}>
        {showOutline ? renderOutline() : editingSubitem ? (
          <Form
            layout="vertical"
            onFinish={handleEatingDetailsSave}
            initialValues={editingSubitem.details}
            style={{ maxWidth: 800 }}
          >
            <Typography.Title level={3}>
              {typeof editingSubitem.subIdx === 'number' ? 'Edit' : 'New'} {ideas[editingSubitem.parentIdx].category} Details
            </Typography.Title>
            {typeof editingSubitem.subIdx === 'number' && editingSubitem.details.photos?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Typography.Text type="secondary">Current Photos:</Typography.Text>
                <ImageCollage images={editingSubitem.details.photos} height={120} />
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
                  setFileList(prev => [...prev, {
                    uid: `-${prev.length + 1}`,
                    name: file.name,
                    status: 'done',
                    thumbUrl: base64,
                  }]);
                  return false;
                }}
                onRemove={(file) => {
                  setFileList(prev => prev.filter(item => item.uid !== file.uid));
                }}
              >
                {fileList.length < 4 && (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
              {fileList.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <ImageCollage images={fileList} height={200} />
                </div>
              )}
            </Form.Item>

            {ideas[editingSubitem.parentIdx].category === 'Eating' && <EatingIdeaForm />}
            {ideas[editingSubitem.parentIdx].category === 'Travel' && <TravelIdeaForm />}
            {ideas[editingSubitem.parentIdx].category === 'Sightseeing' && <SightseeingIdeaForm />}
            {ideas[editingSubitem.parentIdx].category === 'Activities' && <ActivityIdeaForm />}

            <Form.Item name="notes" label="Additional Notes">
              <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">Save</Button>
              <Button style={{ marginLeft: 8 }} onClick={() => setEditingSubitem(null)}>
                Cancel
              </Button>
            </Form.Item>
          </Form>
        ) : selectedIdx !== null && ideas[selectedIdx] ? (
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ 
              marginBottom: 24,
              borderBottom: `1px solid ${token.colorBorder}`,
              paddingBottom: 16
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 24,
                marginBottom: 16 
              }}>
                <Typography.Title 
                  level={2} 
                  style={{ margin: 0 }}
                  editable={{
                    onChange: (newTitle) => handleSaveContent({ title: newTitle }),
                    autoSize: { maxRows: 1 },
                    triggerType: ['text', 'icon']
                  }}
                >
                  {ideas[selectedIdx].title}
                </Typography.Title>
                <Form
                  form={form}
                  initialValues={ideas[selectedIdx]}
                  onValuesChange={(_, allValues) => handleSaveContent(allValues)}
                >
                  <Form.Item 
                    name="category" 
                    style={{ margin: 0, flexShrink: 0 }}
                  >
                    <Segmented
                      options={[
                        {
                          label: 'Travel',
                          value: 'Travel',
                          icon: <CarOutlined />,
                        },
                        {
                          label: 'Eating',
                          value: 'Eating',
                          icon: <CoffeeOutlined />,
                        },
                        {
                          label: 'Sightseeing',
                          value: 'Sightseeing',
                          icon: <CameraOutlined />,
                        },
                        {
                          label: 'Activities',
                          value: 'Activities',
                          icon: <ThunderboltOutlined />,
                        },
                      ]}
                      style={{
                        padding: 4,
                        backgroundColor: token.colorBgContainer,
                        borderRadius: 8,
                      }}
                    />
                  </Form.Item>
                </Form>
              </div>
              <Form
                form={form}
                layout="vertical"
                initialValues={ideas[selectedIdx]}
                onValuesChange={(_, allValues) => handleSaveContent(allValues)}
              >
                <Form.Item
                  name="content"
                  style={{ marginBottom: 0 }}
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="Write your idea details here..."
                    style={{ 
                      fontSize: 14,
                      border: 'none',
                      resize: 'none',
                      padding: 0,
                      background: 'transparent'
                    }}
                  />
                </Form.Item>
              </Form>
            </div>
            
            {/* Subitems section */}
            {(ideas[selectedIdx].subitems?.length > 0) ? (
              <div>
                <Typography.Title level={3} style={{ 
                  marginBottom: 16,
                  fontSize: 18
                }}>
                  Details & Notes
                </Typography.Title>
                {renderSubitemsCarousel(ideas[selectedIdx])}
                <Button
                  type="primary"
                  ghost
                  onClick={() => setCreatingSublist(selectedIdx)}
                  style={{ 
                    width: '100%',
                    marginTop: 16,
                    height: 72,
                    borderRadius: 12,
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    fontSize: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    background: token.colorBgContainer,
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = token.colorPrimaryBg;
                    e.currentTarget.style.borderColor = token.colorPrimary;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = token.colorBgContainer;
                    e.currentTarget.style.borderColor = '';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: token.colorPrimaryBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 2
                    }}>
                      <PlusOutlined style={{ fontSize: 18, color: token.colorPrimary }} />
                    </div>
                    <span style={{ fontWeight: 500, color: token.colorPrimary }}>Add New Detail</span>
                  </div>
                </Button>
              </div>
            ) : (
              <Button
                type="primary"
                ghost
                onClick={() => setCreatingSublist(selectedIdx)}
                style={{ 
                  width: '100%',
                  marginTop: 24,
                  height: 72,
                  borderRadius: 12,
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  fontSize: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  background: token.colorBgContainer,
                  transition: 'all 0.3s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = token.colorPrimaryBg;
                  e.currentTarget.style.borderColor = token.colorPrimary;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = token.colorBgContainer;
                  e.currentTarget.style.borderColor = '';
                }}
              >
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: token.colorPrimaryBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 2
                  }}>
                    <PlusOutlined style={{ fontSize: 18, color: token.colorPrimary }} />
                  </div>
                  <span style={{ fontWeight: 500, color: token.colorPrimary }}>Add New Detail</span>
                </div>
              </Button>
            )}
          </div>
        ) : (
          <Empty description="Select an idea or create a new one" />
        )}
      </Content>
    </Layout>
  );
}

export default Ideas;
