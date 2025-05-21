import {render, screen, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TripForm from '../../components/Trips/TripForm';

describe('TripForm', () => {
  it('renders the TripForm component', () => {
    render(<TripForm onSubmit={() => {}} />);

    // Check for Trip Name input
    expect(screen.getByLabelText(/Trip Name/i)).toBeInTheDocument();
    // Check for Trip Dates input
    expect(screen.getByLabelText(/Trip Dates/i)).toBeInTheDocument();
    // Check for Description input
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    // Check for submit button
    expect(
      screen.getByRole('button', {name: /Create Trip|Update Trip/i})
    ).toBeInTheDocument();
  });

  it('calls onSubmit with the correct data when the form is submitted with valid inputs', async () => {
    const handleSubmit = vi.fn();
    render(<TripForm onSubmit={handleSubmit} />);

    await userEvent.type(screen.getByLabelText(/Trip Name/i), 'My Awesome Trip');
    // Click the date range picker
    await userEvent.click(screen.getByLabelText(/Trip Dates/i));
    // Click the start date (e.g., 15th of the current month)
    await userEvent.click(screen.getByText('15'));
    // Click the end date (e.g., 20th of the current month)
    await userEvent.click(screen.getByText('20'));
    await userEvent.type(screen.getByLabelText(/Description/i), 'This is a description of my awesome trip.');

    await userEvent.click(screen.getByRole('button', {name: /Create Trip|Update Trip/i}));

    expect(handleSubmit).toHaveBeenCalledWith({
      name: 'My Awesome Trip',
      dateRange: {
        from: expect.any(Date), // We can't know the exact date, so we check for type
        to: expect.any(Date),
      },
      description: 'This is a description of my awesome trip.',
    });
  });

  it('resets the form after successful submission', async () => {
    const handleSubmit = vi.fn();
    render(<TripForm onSubmit={handleSubmit} />);

    await userEvent.type(screen.getByLabelText(/Trip Name/i), 'My Awesome Trip');
    // Click the date range picker
    await userEvent.click(screen.getByLabelText(/Trip Dates/i));
    // Click the start date (e.g., 15th of the current month)
    await userEvent.click(screen.getByText('15'));
    // Click the end date (e.g., 20th of the current month)
    await userEvent.click(screen.getByText('20'));
    await userEvent.type(screen.getByLabelText(/Description/i), 'This is a description of my awesome trip.');

    await userEvent.click(screen.getByRole('button', {name: /Create Trip|Update Trip/i}));

    // Check if the form fields are reset
    expect(screen.getByLabelText(/Trip Name/i)).toHaveValue('');
    // For date range, we might need a more specific check depending on how it's reset
    // For now, let's assume it clears the input visually or resets to a default placeholder
    expect(screen.getByLabelText(/Trip Dates/i)).toHaveValue('');
    expect(screen.getByLabelText(/Description/i)).toHaveValue('');
  });

  it('shows validation error if trip name is empty', async () => {
    const handleSubmit = vi.fn();
    render(<TripForm onSubmit={handleSubmit} />);

    // Fill other fields
    await userEvent.click(screen.getByLabelText(/Trip Dates/i));
    await userEvent.click(screen.getByText('15'));
    await userEvent.click(screen.getByText('20'));
    await userEvent.type(screen.getByLabelText(/Description/i), 'Test Description');

    await userEvent.click(screen.getByRole('button', {name: /Create Trip|Update Trip/i}));

    expect(await screen.findByText('Please input trip name!')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error if trip dates are not selected', async () => {
    const handleSubmit = vi.fn();
    render(<TripForm onSubmit={handleSubmit} />);

    // Fill other fields
    await userEvent.type(screen.getByLabelText(/Trip Name/i), 'Test Trip');
    await userEvent.type(screen.getByLabelText(/Description/i), 'Test Description');

    await userEvent.click(screen.getByRole('button', {name: /Create Trip|Update Trip/i}));

    expect(await screen.findByText('Please select trip dates!')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error if description is empty', async () => {
    const handleSubmit = vi.fn();
    render(<TripForm onSubmit={handleSubmit} />);

    // Fill other fields
    await userEvent.type(screen.getByLabelText(/Trip Name/i), 'Test Trip');
    await userEvent.click(screen.getByLabelText(/Trip Dates/i));
    await userEvent.click(screen.getByText('15'));
    await userEvent.click(screen.getByText('20'));

    await userEvent.click(screen.getByRole('button', {name: /Create Trip|Update Trip/i}));

    expect(await screen.findByText('Please input trip description!')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});

describe('TripForm with Initial Values', () => {
  const initialValues = {
    id: '1',
    name: 'My Awesome Trip',
    description: 'A great adventure',
    dateRange: {
      from: new Date('2024-03-15T00:00:00.000Z'), // AntD RangePicker uses Date objects
      to: new Date('2024-03-20T00:00:00.000Z'),
    },
  };

  // Helper to format date as YYYY-MM-DD for checking input value
  const formatDate = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  };

  it('pre-fills form fields and sets button to "Update Trip" when initialValues are provided', () => {
    render(<TripForm onSubmit={() => {}} initialValues={initialValues} />);

    expect(screen.getByLabelText(/Trip Name/i)).toHaveValue(initialValues.name);
    expect(screen.getByLabelText(/Description/i)).toHaveValue(initialValues.description);

    // AntD RangePicker renders two input fields for start and end dates
    // Their placeholder is 'Start date' and 'End date' respectively by default when empty
    // When populated, their value attribute holds the formatted date.
    const dateInputs = screen.getAllByRole('textbox'); // DatePickers are textboxes
    // Find the specific inputs for dates. Assuming date inputs are identifiable if other text inputs exist.
    // A more robust way might involve specific test-ids if the form grows more complex.
    // For now, we'll check if the values exist among the textboxes.
    // Note: AntD date pickers can be tricky to test for values directly without user interaction
    // to open them. However, when initialValues are set, the values are directly in the input fields.

    // The antd DatePicker for range will have two input elements.
    // One for start date and one for end date.
    // We expect their values to be formatted as YYYY-MM-DD
    expect(screen.getByDisplayValue(formatDate(initialValues.dateRange.from))).toBeInTheDocument();
    expect(screen.getByDisplayValue(formatDate(initialValues.dateRange.to))).toBeInTheDocument();
    
    expect(screen.getByRole('button', {name: /Update Trip/i})).toBeInTheDocument();
  });
});

describe('TripForm without Initial Values', () => {
  it('sets button to "Create Trip" when initialValues are not provided', () => {
    render(<TripForm onSubmit={() => {}} />);
    expect(screen.getByRole('button', {name: /Create Trip/i})).toBeInTheDocument();
    // Check that "Update Trip" button is not present
    expect(screen.queryByRole('button', { name: /Update Trip/i })).not.toBeInTheDocument();
  });
});