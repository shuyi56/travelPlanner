import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { eventFormBuilder } from '../../components/TripPlanner/EventFormBuilder';
import dayjs from 'dayjs'; // For TimePicker values

// Mocking AddressSearch: A_S_M stands for AddressSearchMock
vi.mock('../../components/shared/AddressSearch', () => {
  const A_S_M = ({ placeholder, onSelect }) => (
    <input
      data-testid={`address-search-${placeholder}`}
      placeholder={placeholder}
      onChange={(e) => {
        // Simulate selecting an address to test onSelect callback
        if (e.target.value === 'test address') {
          onSelect({
            formatted_address: 'Test Address, 123 Main St',
            geometry: { location: { lat: () => 0, lng: () => 0 } },
            // Add other necessary PlaceResult properties if your component uses them
          });
        }
      }}
    />
  );
  return { default: A_S_M }; // Vitest requires a default export for the mock
});

describe('eventFormBuilder', () => {
  const mockOnChange = vi.fn();

  // Minimal event data for testing common fields (e.g., using 'Travel' type as a default for now)
  const baseEventData = {
    id: 'evt1',
    type: 'Travel', // Or any type that renders common fields
    name: 'Test Event',
    description: 'Test Description',
    beginTime: dayjs('10:00', 'HH:mm'),
    endTime: dayjs('11:00', 'HH:mm'),
    // other type-specific fields can be omitted if only testing common ones initially
  };

  beforeEach(() => {
    mockOnChange.mockReset(); // Changed from mockClear to mockReset for safety, though mockClear exists
  });

  it('renders common fields correctly', () => {
    const formUI = eventFormBuilder({ event: baseEventData, onChange: mockOnChange });
    // Ant Design's Form component is not used directly by eventFormBuilder,
    // it returns JSX that should be wrapped in a Form for context if needed,
    // but for basic rendering checks, direct rendering might be fine.
    // However, testing library works best with actual components.
    // Let's wrap it in a simple functional component for the test.
    const TestHost = () => <form>{formUI}</form>; // Basic form wrapper for context
    render(<TestHost />);

    // Check for labels and their corresponding inputs by displayed value
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByDisplayValue(baseEventData.name)).toBeInTheDocument();

    expect(screen.getByText('Description')).toBeInTheDocument();
    // For textarea, getByDisplayValue might not work as expected, using .value property or checking text content
    expect(screen.getByDisplayValue(baseEventData.description)).toBeInTheDocument();


    expect(screen.getByText('Begin Time')).toBeInTheDocument();
    expect(screen.getByText('End Time')).toBeInTheDocument();

    // Check if TimePicker inputs display the correct time
    // This requires knowing how AntD TimePicker displays its value or using specific queries.
    // For now, let's assume the value is present in an input.
    // format 'HH:mm'
    expect(screen.getByDisplayValue(baseEventData.beginTime.format('HH:mm'))).toBeInTheDocument();
    expect(screen.getByDisplayValue(baseEventData.endTime.format('HH:mm'))).toBeInTheDocument();

    // Add checks for price range fields
    expect(screen.getByText('Min Price')).toBeInTheDocument();
    expect(screen.getByText('Max Price')).toBeInTheDocument();
  });

  // Add new test for price range validation
  it('shows validation error when max price is less than min price', async () => {
    const formUI = eventFormBuilder({
      event: { ...baseEventData, minPrice: 100, maxPrice: 50 },
      onChange: mockOnChange
    });
    const TestHost = () => <form>{formUI}</form>;
    render(<TestHost />);

    // Get price inputs
    const maxPriceInput = screen.getByRole('spinbutton', { name: /max price/i });
    
    // Trigger blur to show validation
    await userEvent.click(maxPriceInput);
    await userEvent.tab(); // Move focus away to trigger blur

    // Check for error message
    expect(screen.getByText('Maximum price cannot be less than minimum price')).toBeInTheDocument();
  });

  it('shows validation error when min price is greater than max price', async () => {
    const formUI = eventFormBuilder({
      event: { ...baseEventData, minPrice: 150, maxPrice: 100 },
      onChange: mockOnChange
    });
    const TestHost = () => <form>{formUI}</form>;
    render(<TestHost />);

    // Get price inputs
    const minPriceInput = screen.getByRole('spinbutton', { name: /min price/i });
    
    // Trigger blur to show validation
    await userEvent.click(minPriceInput);
    await userEvent.tab(); // Move focus away to trigger blur

    // Check for error message
    expect(screen.getByText('Minimum price cannot be greater than maximum price')).toBeInTheDocument();
  });

  it('calls onChange for Name field', async () => {
    const formUI = eventFormBuilder({ event: baseEventData, onChange: mockOnChange });
    const TestHost = () => <form>{formUI}</form>;
    render(<TestHost />);
    const nameInput = screen.getByDisplayValue(baseEventData.name);
    // Using fireEvent.change for direct value setting to avoid complex userEvent interactions for text replacement
    fireEvent.change(nameInput, { target: { value: 'New Event Name' } });
    expect(mockOnChange).toHaveBeenLastCalledWith({ name: 'New Event Name' });
  });

  it('calls onChange for Description field', async () => {
    const formUI = eventFormBuilder({ event: baseEventData, onChange: mockOnChange });
    const TestHost = () => <form>{formUI}</form>;
    render(<TestHost />);
    const descriptionInput = screen.getByDisplayValue(baseEventData.description);
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } });
    expect(mockOnChange).toHaveBeenLastCalledWith({ description: 'New Description' });
  });

  it('calls onChange for Begin Time field', async () => {
    const formUI = eventFormBuilder({ event: baseEventData, onChange: mockOnChange });
    const TestHost = () => <form>{formUI}</form>;
    render(<TestHost />);
    const beginTimeInput = screen.getByDisplayValue(baseEventData.beginTime.format('HH:mm'));
    // For TimePicker, clearing and typing might need specific handling.
    // Often, it's better to interact with the picker UI if possible, or ensure clear works.
    // If direct input clear/type is problematic, this test might need adjustment.
    await userEvent.click(beginTimeInput);
    await userEvent.keyboard('{Control>}a{/Control}{Backspace}');
    await userEvent.type(beginTimeInput, '12:30');
    await userEvent.click(document.body); // Trigger blur or apply
    // We need to check that mockOnChange was called and the time part of the dayjs object matches.
    expect(mockOnChange).toHaveBeenCalled();
    const lastCallArgs = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
    expect(lastCallArgs.beginTime.format('HH:mm')).toBe('12:30');
  });

  it('calls onChange for End Time field', async () => {
    const formUI = eventFormBuilder({ event: baseEventData, onChange: mockOnChange });
    const TestHost = () => <form>{formUI}</form>;
    render(<TestHost />);
    const endTimeInput = screen.getByDisplayValue(baseEventData.endTime.format('HH:mm'));
    await userEvent.click(endTimeInput);
    await userEvent.keyboard('{Control>}a{/Control}{Backspace}');
    await userEvent.type(endTimeInput, '13:45');
    await userEvent.click(document.body); // Trigger blur or apply
    expect(mockOnChange).toHaveBeenCalled();
    const lastCallArgs = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
    expect(lastCallArgs.endTime.format('HH:mm')).toBe('13:45');
  });

  describe('Travel Event Type', () => {
    const travelEventData = {
      id: 'evtTravel',
      type: 'Travel',
      name: 'Trip to City',
      description: 'Traveling by train',
      beginTime: dayjs('09:00', 'HH:mm'),
      endTime: dayjs('17:00', 'HH:mm'),
      transportType: 'Train',
      from: { formatted_address: 'Station A' }, // Simplified for initial rendering check
      to: { formatted_address: 'Station B' }, // Simplified for initial rendering check
      minPrice: 80,  // Add these fields
      maxPrice: 120, // instead of cost
    };

    it('renders common and Travel-specific fields', () => {
      const formUI = eventFormBuilder({ event: travelEventData, onChange: mockOnChange });
      const TestHost = () => <form>{formUI}</form>;
      render(<TestHost />);

      // Check common fields (can be more brief here if covered in detail elsewhere)
      expect(screen.getByDisplayValue(travelEventData.name)).toBeInTheDocument();
      expect(screen.getByDisplayValue(travelEventData.beginTime.format('HH:mm'))).toBeInTheDocument();

      // Check Travel-specific fields
      expect(screen.getByText('Transport Type')).toBeInTheDocument();
      expect(screen.getByDisplayValue(travelEventData.transportType)).toBeInTheDocument();

      expect(screen.getByText('From')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('From')).toBeInTheDocument();

      expect(screen.getByText('To')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('To')).toBeInTheDocument();

      expect(screen.getByText('Min Price')).toBeInTheDocument();
      expect(screen.getByRole('spinbutton', { name: /min price/i })).toHaveValue('80.00');

      expect(screen.getByText('Max Price')).toBeInTheDocument();
      expect(screen.getByRole('spinbutton', { name: /max price/i })).toHaveValue('120.00');
    });

    it('calls onChange for Transport Type field (Travel)', async () => {
      const formUI = eventFormBuilder({ event: travelEventData, onChange: mockOnChange });
      const TestHost = () => <form>{formUI}</form>;
      render(<TestHost />);
      const transportInput = screen.getByDisplayValue(travelEventData.transportType);
      fireEvent.change(transportInput, { target: { value: 'Bus' } });
      expect(mockOnChange).toHaveBeenLastCalledWith({ transportType: 'Bus' });
    });

    it('calls onChange for price range fields', async () => {
      const formUI = eventFormBuilder({ event: travelEventData, onChange: mockOnChange });
      const TestHost = () => <form>{formUI}</form>;
      render(<TestHost />);

      const minPriceInput = screen.getByRole('spinbutton', { name: /min price/i });
      await userEvent.clear(minPriceInput);
      await userEvent.type(minPriceInput, '90');
      await userEvent.tab();

      expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ minPrice: 90 }));

      const maxPriceInput = screen.getByRole('spinbutton', { name: /max price/i });
      await userEvent.clear(maxPriceInput);
      await userEvent.type(maxPriceInput, '150');
      await userEvent.tab();

      expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ maxPrice: 150 }));
    });

    it('calls onChange for "From" AddressSearch field (Travel)', async () => {
      const formUI = eventFormBuilder({ event: travelEventData, onChange: mockOnChange });
      const TestHost = () => <form>{formUI}</form>;
      render(<TestHost />);
      const fromAddressInput = screen.getByTestId('address-search-From'); // Using data-testid from mock
      await userEvent.type(fromAddressInput, 'test address'); // This value triggers onSelect in mock
      expect(mockOnChange).toHaveBeenLastCalledWith({
        from: {
          formatted_address: 'Test Address, 123 Main St',
          geometry: { location: { lat: expect.any(Function), lng: expect.any(Function) } },
        },
      });
    });
  });

  describe('Eating Event Type', () => {
    const eatingEventData = {
      id: 'evtEating',
      type: 'Eating',
      name: 'Dinner at Restaurant',
      description: 'Nice Italian place',
      beginTime: dayjs('19:00', 'HH:mm'),
      endTime: dayjs('20:30', 'HH:mm'),
      cuisine: 'Italian',
      minPrice: 40,  // Replace price with minPrice/maxPrice
      maxPrice: 60,
      address: { formatted_address: '123 Food St' },
    };

    it('renders common and Eating-specific fields', () => {
      const formUI = eventFormBuilder({ event: eatingEventData, onChange: mockOnChange });
      const TestHost = () => <form>{formUI}</form>;
      render(<TestHost />);

      expect(screen.getByDisplayValue(eatingEventData.name)).toBeInTheDocument();
      expect(screen.getByText('Cuisine')).toBeInTheDocument();
      expect(screen.getByDisplayValue(eatingEventData.cuisine)).toBeInTheDocument();
      expect(screen.getByText('Min Price')).toBeInTheDocument();
      expect(screen.getByRole('spinbutton', { name: /min price/i })).toHaveValue('40.00');
      expect(screen.getByText('Max Price')).toBeInTheDocument();
      expect(screen.getByRole('spinbutton', { name: /max price/i })).toHaveValue('60.00');
      expect(screen.getByText('Address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Address')).toBeInTheDocument();
    });
  });

  describe('Sightseeing Event Type', () => {
    const sightseeingEventData = {
      id: 'evtSightseeing',
      type: 'Sightseeing',
      name: 'Museum Visit',
      description: 'Modern art museum',
      beginTime: dayjs('14:00', 'HH:mm'),
      endTime: dayjs('16:00', 'HH:mm'),
      location: { formatted_address: '456 Art Ave' },
      minPrice: 15,  // Replace price with minPrice/maxPrice
      maxPrice: 25,
      openingHours: '10 AM - 6 PM',
      bestTime: 'Afternoon',
    };

    it('renders common and Sightseeing-specific fields', () => {
      const formUI = eventFormBuilder({ event: sightseeingEventData, onChange: mockOnChange });
      const TestHost = () => <form>{formUI}</form>;
      render(<TestHost />);

      expect(screen.getByDisplayValue(sightseeingEventData.name)).toBeInTheDocument();
      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Location')).toBeInTheDocument();
      expect(screen.getByText('Min Price')).toBeInTheDocument();
      expect(screen.getByRole('spinbutton', { name: /min price/i })).toHaveValue('15.00');
      expect(screen.getByText('Max Price')).toBeInTheDocument();
      expect(screen.getByRole('spinbutton', { name: /max price/i })).toHaveValue('25.00');
      expect(screen.getByText('Opening Hours')).toBeInTheDocument();
      expect(screen.getByDisplayValue(sightseeingEventData.openingHours)).toBeInTheDocument();
      expect(screen.getByText('Best Time')).toBeInTheDocument();
      expect(screen.getByDisplayValue(sightseeingEventData.bestTime)).toBeInTheDocument();
    });
  });

  describe('Accommodation Event Type', () => {
    const accommodationEventData = {
      id: 'evtAccommodation',
      type: 'Accommodation',
      name: 'Hotel Stay',
      description: 'City center hotel',
      beginTime: dayjs('15:00', 'HH:mm'), // Check-in time as beginTime
      endTime: dayjs('11:00', 'HH:mm'),   // Check-out time as endTime
      typeName: 'Hotel',
      minPrice: 120,  // Replace price with minPrice/maxPrice
      maxPrice: 180,
      address: { formatted_address: '789 Hotel Rd' },
      checkIn: '3:00 PM', // These are distinct from begin/end time in some models
      checkOut: '11:00 AM',
    };

    it('renders common and Accommodation-specific fields', () => {
      const formUI = eventFormBuilder({ event: accommodationEventData, onChange: mockOnChange });
      const TestHost = () => <form>{formUI}</form>;
      render(<TestHost />);

      expect(screen.getByDisplayValue(accommodationEventData.name)).toBeInTheDocument();
      expect(screen.getByText(/^Type$/i)).toBeInTheDocument(); // Check for label "Type"
      expect(screen.getByDisplayValue(accommodationEventData.typeName)).toBeInTheDocument();
      expect(screen.getByText('Min Price')).toBeInTheDocument();
      expect(screen.getByRole('spinbutton', { name: /min price/i })).toHaveValue('120.00');
      expect(screen.getByText('Max Price')).toBeInTheDocument();
      expect(screen.getByRole('spinbutton', { name: /max price/i })).toHaveValue('180.00');
      expect(screen.getByText('Address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Address')).toBeInTheDocument();
      expect(screen.getByText('Check In')).toBeInTheDocument();
      expect(screen.getByDisplayValue(accommodationEventData.checkIn)).toBeInTheDocument();
      expect(screen.getByText('Check Out')).toBeInTheDocument();
      expect(screen.getByDisplayValue(accommodationEventData.checkOut)).toBeInTheDocument();
    });
  });

  describe('Activity Event Type', () => {
    const activityEventData = {
      id: 'evtActivity',
      type: 'Activity',
      name: 'Hiking Trip',
      description: 'Mountain trail hike',
      beginTime: dayjs('09:00', 'HH:mm'),
      endTime: dayjs('13:00', 'HH:mm'),
      minPrice: 0,    // Replace price with minPrice/maxPrice
      maxPrice: 0,
      location: { formatted_address: 'Mountain Trailhead' },
      difficulty: 'moderate',
    };

    it('renders common and Activity-specific fields', () => {
      const formUI = eventFormBuilder({ event: activityEventData, onChange: mockOnChange });
      const TestHost = () => <form>{formUI}</form>;
      render(<TestHost />);

      expect(screen.getByDisplayValue(activityEventData.name)).toBeInTheDocument();
      expect(screen.getByText('Min Price')).toBeInTheDocument();
      expect(screen.getByRole('spinbutton', { name: 'Min Price' })).toHaveValue('0.00');
      expect(screen.getByText('Max Price')).toBeInTheDocument();
      expect(screen.getByRole('spinbutton', { name: 'Max Price' })).toHaveValue('0.00');
      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Location')).toBeInTheDocument();
      expect(screen.getByText('Difficulty Level')).toBeInTheDocument();
      // For Ant Design Segmented control, check for the active segment.
      // The text "Moderate" should be visible and have styling indicating it's selected.
      // A simple check for the text for now.
      expect(screen.getByText('Moderate')).toBeInTheDocument();
    });

    it('calls onChange for Difficulty Level field (Activity)', async () => {
      const formUI = eventFormBuilder({
        event: { ...activityEventData, difficulty: 'easy' }, // Start with 'easy'
        onChange: mockOnChange,
      });
      const TestHost = () => <form>{formUI}</form>;
      render(<TestHost />);

      // The Segmented control renders options as radio buttons or similar roles.
      // We'll find the 'Challenging' option by its text/label.
      const challengingOption = screen.getByText('Challenging'); // AntD renders labels within spans/divs

      await userEvent.click(challengingOption);

      // Verify onChange was called with the new difficulty
      // The difficulty value should be lowercase as per the component's Segmented options
      expect(mockOnChange).toHaveBeenLastCalledWith({ difficulty: 'challenging' });
    });
  });
});
