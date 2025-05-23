import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Form } from "antd";
import { ActivityIdeaForm } from "../../components/Ideas/idea_types/ActivityIdea";

describe("ActivityIdeaForm", () => {
  // Test Case 1
  test("renders price input fields correctly", () => {
    render(
      <Form>
        <ActivityIdeaForm />
      </Form>
    );
    expect(screen.getByLabelText("Minimum Price")).toBeInTheDocument();
    expect(screen.getByLabelText("Maximum Price")).toBeInTheDocument();
  });

  // Test Case 2
  test("allows input in price fields", () => {
    render(
      <Form>
        <ActivityIdeaForm />
      </Form>
    );
    const minPriceInput = screen.getByLabelText("Minimum Price") as HTMLInputElement;
    const maxPriceInput = screen.getByLabelText("Maximum Price") as HTMLInputElement;

    fireEvent.change(minPriceInput, { target: { value: "10" } });
    fireEvent.change(maxPriceInput, { target: { value: "50" } });

    expect(minPriceInput.value).toBe("10");
    expect(maxPriceInput.value).toBe("50");
  });

  // Test Case 3
  test("shows validation error if price_low > price_high on form submission attempt", async () => {
    const onFinishFailed = jest.fn();

    render(
      <Form onFinishFailed={onFinishFailed}>
        <ActivityIdeaForm />
      </Form>
    );

    const minPriceInput = screen.getByLabelText("Minimum Price");
    const maxPriceInput = screen.getByLabelText("Maximum Price");

    // antd InputNumber component stores value as string, simulate this
    fireEvent.change(minPriceInput, { target: { value: "50" } });
    fireEvent.change(maxPriceInput, { target: { value: "10" } });
    
    // Try to find the submit button if one exists and click it, or trigger validation manually
    // For antd forms, validation is often triggered on change or blur, or by calling form.validateFields()
    // Here, we'll check for the error message directly if it appears due to inter-field validation rules

    // We need to wait for the validation to occur
    // For antd, the error message appears associated with the form item
    // Let's try to get the form instance to trigger validation or check for the error message
    // This part is a bit tricky without a submit button or direct access to the form instance from outside

    // Directly checking for the error message that should appear
    // The error "Minimum price cannot be greater than maximum price." should be linked to the price_high field.
    // Ant Design typically renders errors in a div with class .ant-form-item-explain-error
    
    // Simulate blur event to trigger validation if not already triggered by change
    fireEvent.blur(maxPriceInput);

    // Wait for the error message to appear
    const errorMessage = await screen.findByText(
      "Minimum price cannot be greater than maximum price."
    );
    expect(errorMessage).toBeInTheDocument();
    
    // Also, check if onFinishFailed was called (if a submit was attempted and failed)
    // This part might not be directly applicable if validation blocks submission entirely
    // but antd's Form validation should prevent onFinish from being called.
    // We can check if the specific error is present, which is more direct for this rule.
  });
});
