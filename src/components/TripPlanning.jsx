import React, { useState } from 'react';
import {
  Form, Input, DatePicker, InputNumber, Button, Card, Steps, List, Modal, Select, theme, TimePicker
} from 'antd';
import {
  CarOutlined,
  CoffeeOutlined,
  EyeOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { MdFlight } from 'react-icons/md';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

function getDatesInRange(start, end) {
  const dates = [];
  let curr = dayjs(start);
  const last = dayjs(end);
  while (curr.isBefore(last) || curr.isSame(last, 'day')) {
    dates.push(curr.format('YYYY-MM-DD'));
    curr = curr.add(1, 'day');
  }
  return dates;
}

function TripPlanning() {
  const [step, setStep] = useState(0);
  const [tripDetails, setTripDetails] = useState(null);
  const [events, setEvents] = useState({});
  const [eventModal, setEventModal] = useState({ open: false, date: null });
  const [eventInput, setEventInput] = useState('');
  const [eventType, setEventType] = useState('Other');
  const [eventDetails, setEventDetails] = useState({
    from: '', to: '', depTime: null, arrTime: null, beginTime: null, endTime: null, mapsLink: ''
  });

  // Ant Design theme for dark/light mode
  const { token } = theme.useToken();
  const isDark = token.colorBgBase === '#141414';

  // Card color/type mapping (adapt to theme)
  const eventTypeStyles = {
    Flight: {},
    Travel: {},
    Eating: {},
    Sightseeing: {},
    Other: {}
  };

  // Icon mapping
  const eventTypeIcons = {
    Flight: <MdFlight style={{ color: '#1890ff', marginRight: 8, verticalAlign: 'middle' }} />,
    Travel: <CarOutlined style={{ color: '#faad14', marginRight: 8 }} />,
    Eating: <CoffeeOutlined style={{ color: '#52c41a', marginRight: 8 }} />,
    Sightseeing: <EyeOutlined style={{ color: '#eb2f96', marginRight: 8 }} />,
    Other: <AppstoreOutlined style={{ color: '#888', marginRight: 8 }} />
  };

  // Stage 1: Trip Details
  const [form] = Form.useForm();

  const handleTripDetails = (values) => {
    const [start, end] = values.dates;
    const days = getDatesInRange(start, end);
    setTripDetails({ ...values, days });
    // Initialize events for each day
    const initialEvents = {};
    days.forEach(d => { initialEvents[d] = []; });
    setEvents(initialEvents);
    setStep(1);
  };

  // Stage 2: Add Events
  const openAddEvent = (date) => {
    setEventInput('');
    setEventType('Other');
    setEventDetails({ from: '', to: '', depTime: null, arrTime: null, beginTime: null, endTime: null, mapsLink: '' });
    setEventModal({ open: true, date });
  };

  const handleAddEvent = () => {
    if (!eventInput.trim()) return;
    let extra = {};
    if (eventType === 'Flight' || eventType === 'Travel') {
      extra = {
        from: eventDetails.from,
        to: eventDetails.to,
        depTime: eventDetails.depTime,
        arrTime: eventDetails.arrTime,
        beginTime: eventDetails.beginTime,
        endTime: eventDetails.endTime,
        mapsLink: eventDetails.mapsLink
      };
    } else {
      extra = {
        beginTime: eventDetails.beginTime,
        endTime: eventDetails.endTime,
        mapsLink: eventDetails.mapsLink
      };
    }
    setEvents(prev => ({
      ...prev,
      [eventModal.date]: [
        ...prev[eventModal.date],
        { type: eventType, desc: eventInput.trim(), ...extra }
      ]
    }));
    setEventModal({ open: false, date: null });
    setEventInput('');
    setEventType('Other');
    setEventDetails({ from: '', to: '', depTime: null, arrTime: null, beginTime: null, endTime: null, mapsLink: '' });
  };

  return (
    <Card title="Trip Planning" bordered={false}>
      <Steps current={step} items={[
        { title: 'Trip Details' },
        { title: 'Plan Daily Events' }
      ]} style={{ marginBottom: 32 }} />

      {step === 0 && (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleTripDetails}
          initialValues={{ travelers: 1 }}
        >
          <Form.Item label="Destination" name="destination" rules={[{ required: true }]}>
            <Input placeholder="Enter destination" />
          </Form.Item>
          <Form.Item label="Travelers" name="travelers" rules={[{ required: true }]}>
            <InputNumber min={1} max={20} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Dates" name="dates" rules={[{ required: true }]}>
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Next: Plan Daily Events
            </Button>
          </Form.Item>
        </Form>
      )}

      {step === 1 && tripDetails && (
        <div>
          <div style={{ marginBottom: 24 }}>
            <b>Destination:</b> {tripDetails.destination} &nbsp; | &nbsp;
            <b>Travelers:</b> {tripDetails.travelers} &nbsp; | &nbsp;
            <b>Dates:</b> {tripDetails.days[0]} to {tripDetails.days[tripDetails.days.length - 1]}
          </div>
          <List
            itemLayout="vertical"
            dataSource={tripDetails.days}
            renderItem={date => (
              <List.Item
                key={date}
                actions={[
                  <Button size="small" onClick={() => openAddEvent(date)} key="add">Add Event</Button>
                ]}
              >
                <List.Item.Meta
                  title={<b>{dayjs(date).format('dddd, MMM D, YYYY')}</b>}
                />
                <div>
                  {events[date] && events[date].length > 0 ? (
                    events[date].map((ev, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'stretch', marginBottom: 8 }}>
                        {/* Left panel for Begin/End times */}
                        <div style={{
                          minWidth: 70,
                          borderRadius: 4,
                          padding: '8px 8px',
                          marginRight: 12,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'flex-start'
                        }}>
                          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
                            <b>Begin</b><br />
                            {ev.beginTime ? dayjs(ev.beginTime).format('HH:mm') : '--:--'}
                          </div>
                          <div style={{ fontSize: 12, color: '#888' }}>
                            <b>End</b><br />
                            {ev.endTime ? dayjs(ev.endTime).format('HH:mm') : '--:--'}
                          </div>
                        </div>
                        {/* Event card */}
                        <Card
                          size="small"
                          style={{ flex: 1 }}
                          title={
                            <span>
                              {eventTypeIcons[ev.type || 'Other']}
                              {ev.type}
                            </span>
                          }
                          bodyStyle={{ padding: 12 }}
                        >
                          <div>
                            {ev.type === 'Flight' || ev.type === 'Travel' ? (
                              <div style={{ marginBottom: 4 }}>
                                <b>{ev.from || 'From'} &rarr; {ev.to || 'To'}</b>
                                <br />
                                <span style={{ fontSize: 12, color: '#888' }}>
                                  {ev.depTime ? `Depart: ${dayjs(ev.depTime).format('HH:mm')}` : ''}
                                  {ev.arrTime ? `, Arrive: ${dayjs(ev.arrTime).format('HH:mm')}` : ''}
                                </span>
                              </div>
                            ) : null}
                            <div>{ev.desc}</div>
                            {ev.mapsLink && (
                              <div style={{ marginTop: 6 }}>
                                <a
                                  href={ev.mapsLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: '#1890ff', fontSize: 13 }}
                                >
                                  View on Google Maps
                                </a>
                              </div>
                            )}
                          </div>
                        </Card>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#aaa' }}>No events planned.</div>
                  )}
                </div>
              </List.Item>
            )}
          />
          <Button style={{ marginTop: 16 }} onClick={() => setStep(0)}>
            Back
          </Button>
        </div>
      )}

      <Modal
        title={`Add Event for ${eventModal.date ? dayjs(eventModal.date).format('MMM D, YYYY') : ''}`}
        open={eventModal.open}
        onOk={handleAddEvent}
        onCancel={() => setEventModal({ open: false, date: null })}
        okText="Add"
      >
        <div style={{ marginBottom: 12 }}>
          <Select
            value={eventType}
            onChange={val => {
              setEventType(val);
              setEventDetails({ from: '', to: '', depTime: null, arrTime: null, beginTime: null, endTime: null, mapsLink: '' });
            }}
            style={{ width: '100%' }}
          >
            <Option value="Flight">Flight</Option>
            <Option value="Travel">Travel</Option>
            <Option value="Eating">Eating</Option>
            <Option value="Sightseeing">Sightseeing</Option>
            <Option value="Other">Other</Option>
          </Select>
        </div>
        {(eventType === 'Flight' || eventType === 'Travel') && (
          <div style={{ marginBottom: 12 }}>
            <Input
              style={{ marginBottom: 8 }}
              placeholder="From (Location/Airport)"
              value={eventDetails.from}
              onChange={e => setEventDetails(d => ({ ...d, from: e.target.value }))}
            />
            <Input
              style={{ marginBottom: 8 }}
              placeholder="To (Location/Airport)"
              value={eventDetails.to}
              onChange={e => setEventDetails(d => ({ ...d, to: e.target.value }))}
            />
            <TimePicker
              style={{ width: '48%', marginRight: '4%' }}
              value={eventDetails.depTime}
              onChange={t => setEventDetails(d => ({ ...d, depTime: t }))}
              placeholder="Departure Time"
              format="HH:mm"
            />
            <TimePicker
              style={{ width: '48%' }}
              value={eventDetails.arrTime}
              onChange={t => setEventDetails(d => ({ ...d, arrTime: t }))}
              placeholder="Arrival Time"
              format="HH:mm"
            />
          </div>
        )}
        <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
          <TimePicker
            style={{ width: '48%' }}
            value={eventDetails.beginTime}
            onChange={t => setEventDetails(d => ({ ...d, beginTime: t }))}
            placeholder="Begin Time"
            format="HH:mm"
          />
          <TimePicker
            style={{ width: '48%' }}
            value={eventDetails.endTime}
            onChange={t => setEventDetails(d => ({ ...d, endTime: t }))}
            placeholder="End Time"
            format="HH:mm"
          />
        </div>
        <Input
          style={{ marginBottom: 12 }}
          placeholder="Google Maps Link (optional)"
          value={eventDetails.mapsLink}
          onChange={e => setEventDetails(d => ({ ...d, mapsLink: e.target.value }))}
        />
        <Input.TextArea
          rows={3}
          value={eventInput}
          onChange={e => setEventInput(e.target.value)}
          placeholder="Describe the event/activity"
        />
      </Modal>
    </Card>
  );
}

export default TripPlanning;
