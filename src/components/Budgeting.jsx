import { useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Card, Table, Typography, Row, Col, Progress } from 'antd';
import { CarOutlined, HomeOutlined, CoffeeOutlined, SmileOutlined, MoreOutlined } from '@ant-design/icons';

const { Option } = Select;

const categoryIcons = {
  transportation: <CarOutlined style={{ color: '#1890ff' }} />,
  accommodation: <HomeOutlined style={{ color: '#52c41a' }} />,
  food: <CoffeeOutlined style={{ color: '#faad14' }} />,
  activities: <SmileOutlined style={{ color: '#eb2f96' }} />,
  other: <MoreOutlined style={{ color: '#bfbfbf' }} />,
};

function Budgeting() {
  const [expenses, setExpenses] = useState([]);
  const [form] = Form.useForm();
  const [budgetForm] = Form.useForm();
  const [budget, setBudget] = useState({
    transportation: 0,
    accommodation: 0,
    food: 0,
    activities: 0,
    other: 0,
    total: 0,
  });

  const onFinish = (values) => {
    setExpenses([...expenses, { ...values, id: Date.now() }]);
    form.resetFields();
  };

  const onBudgetFinish = (values) => {
    const total = Object.values(values).reduce((sum, v) => sum + Number(v || 0), 0);
    setBudget({ ...values, total });
  };

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  // Calculate spent per category
  const spentByCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});

  const columns = [
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => (
        <span>
          {categoryIcons[cat]} <span style={{ marginLeft: 8, textTransform: 'capitalize' }}>{cat}</span>
        </span>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (amt) => `$${Number(amt).toFixed(2)}`,
    },
  ];

  return (
    <Card title="Budget Tracker" variant="borderless">
      {/* Budget Allocation Section */}
      <Card type="inner" title="Budget Allocation" style={{ marginBottom: 24 }}>
        <Form
          form={budgetForm}
          layout="inline"
          onFinish={onBudgetFinish}
          initialValues={budget}
        >
          <Form.Item name="transportation" label={<span>{categoryIcons.transportation} Transportation</span>}>
            <InputNumber
              min={0}
              placeholder="0"
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
          <Form.Item name="accommodation" label={<span>{categoryIcons.accommodation} Accommodation</span>}>
            <InputNumber
              min={0}
              placeholder="0"
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
          <Form.Item name="food" label={<span>{categoryIcons.food} Food</span>}>
            <InputNumber
              min={0}
              placeholder="0"
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
          <Form.Item name="activities" label={<span>{categoryIcons.activities} Activities</span>}>
            <InputNumber
              min={0}
              placeholder="0"
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
          <Form.Item name="other" label={<span>{categoryIcons.other} Other</span>}>
            <InputNumber
              min={0}
              placeholder="0"
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Set Budget
            </Button>
          </Form.Item>
        </Form>
        <Row gutter={16} style={{ marginTop: 16 }}>
          {['transportation', 'accommodation', 'food', 'activities', 'other'].map(cat => (
            <Col key={cat}>
              <div style={{ textAlign: 'center', minWidth: 120 }}>
                <div>{categoryIcons[cat]}</div>
                <div style={{ fontWeight: 500, textTransform: 'capitalize' }}>{cat}</div>
                <Progress
                  percent={
                    budget[cat]
                      ? Math.round(Math.min(100, ((spentByCategory[cat] || 0) / budget[cat]) * 100))
                      : 0
                  }
                  status={
                    budget[cat] && (spentByCategory[cat] || 0) > budget[cat]
                      ? 'exception'
                      : 'active'
                  }
                  size="small"
                />
                <div>
                  <span style={{ color: '#888' }}>
                    ${spentByCategory[cat] ? spentByCategory[cat].toFixed(2) : '0.00'} / ${budget[cat] ? Number(budget[cat]).toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Expense Entry Form */}
      <Form form={form} layout="inline" onFinish={onFinish} style={{ marginBottom: 24, marginTop: 24 }}>
        <Form.Item name="description" rules={[{ required: true, message: 'Description required' }]}>
          <Input placeholder="Description" />
        </Form.Item>
        <Form.Item name="amount" rules={[{ required: true, message: 'Amount required' }]}>
          <InputNumber
            min={0}
            placeholder="Amount"
            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>
        <Form.Item name="category" initialValue="transportation">
          <Select style={{ width: 140 }}>
            <Option value="transportation">Transportation</Option>
            <Option value="accommodation">Accommodation</Option>
            <Option value="food">Food</Option>
            <Option value="activities">Activities</Option>
            <Option value="other">Other</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Add Expense
          </Button>
        </Form.Item>
      </Form>

      {/* Spreadsheet-like Table */}
      <Table
        dataSource={expenses}
        columns={columns}
        rowKey="id"
        pagination={false}
        bordered
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0}><b>Total</b></Table.Summary.Cell>
            <Table.Summary.Cell index={1} />
            <Table.Summary.Cell index={2} align="right"><b>${totalSpent.toFixed(2)}</b></Table.Summary.Cell>
          </Table.Summary.Row>
        )}
        style={{ marginTop: 16 }}
      />
    </Card>
  );
}

export default Budgeting;
