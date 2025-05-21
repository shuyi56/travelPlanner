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
    const day15s = screen.getAllByText((content, element) => {
      return element.classList.contains('ant-picker-cell-inner') && content === '15' && !element.parentElement.classList.contains('ant-picker-cell-disabled');
    });
    await userEvent.click(day15s[0]);
    // Click the end date (e.g., 20th of the current month)
    const day20s = screen.getAllByText((content, element) => {
      return element.classList.contains('ant-picker-cell-inner') && content === '20' && !element.parentElement.classList.contains('ant-picker-cell-disabled');
    });
    await userEvent.click(day20s[0]);
    await userEvent.type(screen.getByLabelText(/Description/i), 'This is a description of my awesome trip.');

    await userEvent.click(screen.getByRole('button', {name: /Create Trip|Update Trip/i}));

    expect(handleSubmit).toHaveBeenCalledWith({
      id: '', // Expect an empty id for new submissions
      tripName: 'My Awesome Trip',
      dates: [expect.any(String), expect.any(String)], // Form submits dates as strings
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
    const day15sReset = screen.getAllByText((content, element) => {
      return element.classList.contains('ant-picker-cell-inner') && content === '15' && !element.parentElement.classList.contains('ant-picker-cell-disabled');
    });
    await userEvent.click(day15sReset[0]);
    // Click the end date (e.g., 20th of the current month)
    const day20sReset = screen.getAllByText((content, element) => {
      return element.classList.contains('ant-picker-cell-inner') && content === '20' && !element.parentElement.classList.contains('ant-picker-cell-disabled');
    });
    await userEvent.click(day20sReset[0]);
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
    const day15sNameValidation = screen.getAllByText((content, element) => {
      return element.classList.contains('ant-picker-cell-inner') && content === '15' && !element.parentElement.classList.contains('ant-picker-cell-disabled');
    });
    await userEvent.click(day15sNameValidation[0]);
    const day20sNameValidation = screen.getAllByText((content, element) => {
      return element.classList.contains('ant-picker-cell-inner') && content === '20' && !element.parentElement.classList.contains('ant-picker-cell-disabled');
    });
    await userEvent.click(day20sNameValidation[0]);
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
    const day15sDescValidation = screen.getAllByText((content, element) => {
      return element.classList.contains('ant-picker-cell-inner') && content === '15' && !element.parentElement.classList.contains('ant-picker-cell-disabled');
    });
    await userEvent.click(day15sDescValidation[0]);
    const day20sDescValidation = screen.getAllByText((content, element) => {
      return element.classList.contains('ant-picker-cell-inner') && content === '20' && !element.parentElement.classList.contains('ant-picker-cell-disabled');
    });
    await userEvent.click(day20sDescValidation[0]);

    await userEvent.click(screen.getByRole('button', {name: /Create Trip|Update Trip/i}));

    expect(await screen.findByText('Please input trip description!')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});

describe('TripForm with Initial Values', () => {
  const initialValues = {
    id: '1',
    tripName: 'My Awesome Trip', // Changed from name to tripName
    description: 'A great adventure',
    // Using date strings directly as per subtask example
    dates: ['2024-03-15', '2024-03-20'],
  };

  it('pre-fills form fields and sets button to "Update Trip" when initialValues are provided', () => {
    render(<TripForm onSubmit={() => {}} initialValues={initialValues} />);

    expect(screen.getByLabelText(/Trip Name/i)).toHaveValue(initialValues.tripName);
    expect(screen.getByLabelText(/Description/i)).toHaveValue(initialValues.description);

    // AntD RangePicker renders two input fields for start and end dates.
    // Their value attribute holds the formatted date string.
    expect(screen.getByDisplayValue(initialValues.dates[0])).toBeInTheDocument();
    expect(screen.getByDisplayValue(initialValues.dates[1])).toBeInTheDocument();
    
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