import React, { useEffect } from "react";
import { Form, Input, DatePicker, Button } from "antd";
import { Trip } from "./types.ts";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface TripFormProps {
  onSubmit: (values: Trip) => void;
  initialValues?: Trip | null;
}

const TripForm: React.FC<TripFormProps> = ({ onSubmit, initialValues }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        tripName: initialValues.tripName,
        description: initialValues.description,
        dates: [dayjs(initialValues.dates[0]), dayjs(initialValues.dates[1])],
      });
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const handleSubmit = (values: any) => {
    const tripData: Trip = {
      id: initialValues?.id || "",
      tripName: values.tripName,
      description: values.description,
      travelers: initialValues?.travelers ?? 1,
      dates: values.dates.map((date: dayjs.Dayjs) => date.format("YYYY-MM-DD")),
    };
    onSubmit(tripData);
    form.resetFields();
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item
        name="tripName"
        label="Trip Name"
        rules={[{ required: true, message: "Please input trip name!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="dates"
        label="Trip Dates"
        rules={[{ required: true, message: "Please select trip dates!" }]}
      >
        <RangePicker style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: true, message: "Please input trip description!" }]}
      >
        <TextArea rows={4} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          {initialValues ? "Update Trip" : "Create Trip"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default TripForm;
