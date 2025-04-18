import React from 'react';
import { Table, Card } from 'antd';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const hours = Array.from({ length: 12 }, (_, i) => `${i + 8}:00`);

const columns = [
  { title: 'Time', dataIndex: 'time', key: 'time', fixed: 'left', width: 80 },
  ...days.map(day => ({
    title: day,
    dataIndex: day.toLowerCase(),
    key: day.toLowerCase(),
    width: 120,
    render: () => <div style={{ minHeight: 32 }}></div>
  })),
];

const data = hours.map(hour => {
  const row = { key: hour, time: hour };
  days.forEach(day => { row[day.toLowerCase()] = ''; });
  return row;
});

function TimeTable() {
  return (
    <Card title="Weekly Schedule" bordered={false}>
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        scroll={{ x: 'max-content' }}
        bordered
        size="middle"
      />
    </Card>
  );
}

export default TimeTable;
