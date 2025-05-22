import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd'; // Import Form from antd
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
    notes: 'Some general notes', // Add this
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

    // After description assertions
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByDisplayValue(baseEventData.notes)).toBeInTheDocument();

    expect(screen.getByText('Begin Time')).toBeInTheDocument();
    expect(screen.getByText('End Time')).toBeInTheDocument();

    // Check if TimePicker inputs display the correct time
    // This requires knowing how AntD TimePicker displays its value or using specific queries.
    // For now, let's assume the value is present in an input.
    // format 'HH:mm'
    expect(screen.getByDisplayValue(baseEventData.beginTime.format('HH:mm'))).toBeInTheDocument();
    expect(screen.getByDisplayValue(baseEventData.endTime.format('HH:mm'))).toBeInTheDocument();
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

  it('calls onChange for Notes field', async () => {
    const formUI = eventFormBuilder({ event: baseEventData, onChange: mockOnChange });
    const TestHost = () => <form>{formUI}</form>;
    render(<TestHost />);
    const notesInput = screen.getByDisplayValue(baseEventData.notes);
    fireEvent.change(notesInput, { target: { value: 'New Notes Content' } });
    expect(mockOnChange).toHaveBeenLastCalledWith({ notes: 'New Notes Content' });
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
      cost: 100,
      bookingReference: 'Ref123',
      notes: 'Travel notes here',
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

      expect(screen.getByText('Cost')).toBeInTheDocument();
      // Find the spinbutton by its current value if the label association is problematic
      expect(screen.getByRole('spinbutton', { valueNow: travelEventData.cost.toString() })).toBeInTheDocument();

      // ... existing checks ...
      expect(screen.getByText('Booking Reference')).toBeInTheDocument();
      expect(screen.getByDisplayValue(travelEventData.bookingReference)).toBeInTheDocument();
      expect(screen.getByText('Notes')).toBeInTheDocument(); // Common field
      expect(screen.getByDisplayValue(travelEventData.notes)).toBeInTheDocument();
    });

    it('calls onChange for Transport Type field (Travel)', async () => {
      const formUI = eventFormBuilder({ event: travelEventData, onChange: mockOnChange });
      const TestHost = () => <form>{formUI}</form>;
      render(<TestHost />);
      const transportInput = screen.getByDisplayValue(travelEventData.transportType);
      fireEvent.change(transportInput, { target: { value: 'Bus' } });
      expect(mockOnChange).toHaveBeenLastCalledWith({ transportType: 'Bus' });
    });

    it('calls onChange for Cost field (Travel - InputNumber)', async () => {
      const formUI = eventFormBuilder({ event: travelEventData, onChange: mockOnChange });
      const TestHost = () => <form>{formUI}</form>;
      render(<TestHost />);
      const costInput = screen.getByRole('spinbutton', { valueNow: travelEventData.cost.toString() });
      await userEvent.click(costInput);
      await userEvent.keyboard('{Control>}a{/Control}{Backspace}');
      await userEvent.type(costInput, '125');
      // Clicking outside to ensure blur.
      await userEvent.click(document.body);
      expect(mockOnChange).toHaveBeenLastCalledWith({ cost: 125 });
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

    it('calls onChange for Booking Reference field (Travel)', async () => {
      const formUI = eventFormBuilder({ event: travelEventData, onChange: mockOnChange });
      const TestHost = () => <form>{formUI}</form>;
      render(<TestHost />);
      const bookingRefInput = screen.getByDisplayValue(travelEventData.bookingReference);
      fireEvent.change(bookingRefInput, { target: { value: 'NewRef456' } });
      expect(mockOnChange).toHaveBeenLastCalledWith({ bookingReference: 'NewRef456' });
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
      price: 50,
      address: { formatted_address: '123 Food St' },
      reservationDetails: 'Reservation for 2',
      notes: 'Eating notes here',
    };

    it('renders common and Eating-specific fields', () => {
      const formUI = eventFormBuilder({ event: eatingEventData, onChange: mockOnChange });
      const TestHost = () => <form>{formUI}</form>;
      render(<TestHost />);

      expect(screen.getByDisplayValue(eatingEventData.name)).toBeInTheDocument();
      expect(screen.getByText('Cuisine')).toBeInTheDocument();
      expect(screen.getByDisplayValue(eatingEventData.cuisine)).toBeInTheDocument();
      expect(screen.getByText('Price')).toBeInTheDocument();
      expect(screen.getByRole('spinbutton', { valueNow: eatingEventData.price.toString() })).toBeInTheDocument();
      expect(screen.getByText('Address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Address')).toBeInTheDocument();

      // ... existing checks ...
      expect(screen.getByText('Reservation Details')).toBeInTheDocument();
      expect(screen.getByDisplayValue(eatingEventData.reservationDetails)).toBeInTheDocument();
      expect(screen.getByText('Notes')).toBeInTheDocument(); // Common field
      expect(screen.getByDisplayValue(eatingEventData.notes)).toBeInTheDocument();
    });

    it('calls onChange for Reservation Details field (Eating)', async () => {
      const formUI = eventFormBuilder({ event: eatingEventData, onChange: mockOnChange });
      const TestHost = () => <form>{formUI}</form>;
      render(<TestHost />);
      const reservationDetailsInput = screen.getByDisplayValue(eatingEventData.reservationDetails);
      fireEvent.change(reservationDetailsInput, { target: { value: 'For 4 at 8 PM' } });
      expect(mockOnChange).toHaveBeenLastCalledWith({ reservationDetails: 'For 4 at 8 PM' });
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
      price: 20,
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
      expect(screen.getByText('Price')).toBeInTheDocument();
      expect(screen.getByRole('spinbutton', { valueNow: sightseeingEventData.price.toString() })).toBeInTheDocument();
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
      price: 150,
      address: { formatted_address: '789 Hotel Rd' },
      checkIn: '3:00 PM', // These are distinct from begin/end time in some models
      checkOut: '11:00 AM',
      roomDetails: 'Room 202, Sea view',
      notes: 'Accommodation notes here',
    };

    it('renders common and Accommodation-specific fields', () => {
      const formUI = eventFormBuilder({ event: accommodationEventData, onChange: mockOnChange });
      const TestHost = () => <form>{formUI}</form>;
      render(<TestHost />);

      expect(screen.getByDisplayValue(accommodationEventData.name)).toBeInTheDocument();
      expect(screen.getByText(/^Type$/i)).toBeInTheDocument(); // Check for label "Type"
      expect(screen.getByDisplayValue(accommodationEventData.typeName)).toBeInTheDocument();
      expect(screen.getByText('Price')).toBeInTheDocument();
      expect(screen.getByRole('spinbutton', { valueNow: accommodationEventData.price.toString() })).toBeInTheDocument();
      expect(screen.getByText('Address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Address')).toBeInTheDocument();
      expect(screen.getByText('Check In')).toBeInTheDocument();
      expect(screen.getByDisplayValue(accommodationEventData.checkIn)).toBeInTheDocument();
      expect(screen.getByText('Check Out')).toBeInTheDocument();
      expect(screen.getByDisplayValue(accommodationEventData.checkOut)).toBeInTheDocument();

      // ... existing checks ...
      expect(screen.getByText('Room Details')).toBeInTheDocument();
      expect(screen.getByDisplayValue(accommodationEventData.roomDetails)).toBeInTheDocument(); // This should now pass
      expect(screen.getByText('Notes')).toBeInTheDocument(); // Common field
      expect(screen.getByDisplayValue(accommodationEventData.notes)).toBeInTheDocument();
    });

    it('calls onChange for Room Details field (Accommodation)', async () => {
      const formUI = eventFormBuilder({ event: accommodationEventData, onChange: mockOnChange });
      const TestHost = () => <form>{formUI}</form>;
      render(<TestHost />);
      const roomDetailsInput = screen.getByDisplayValue(accommodationEventData.roomDetails);
      fireEvent.change(roomDetailsInput, { target: { value: 'Suite 100' } });
      expect(mockOnChange).toHaveBeenLastCalledWith({ roomDetails: 'Suite 100' });
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
      price: 0,
      location: { formatted_address: 'Mountain Trailhead' },
      difficulty: 'moderate',
      equipmentNeeded: 'Water, snacks',
      notes: 'Activity notes here',
    };

    it('renders common and Activity-specific fields', () => {
      const formUI = eventFormBuilder({ event: activityEventData, onChange: mockOnChange });
      const TestHost = () => <form>{formUI}</form>;
      render(<TestHost />);

      expect(screen.getByDisplayValue(activityEventData.name)).toBeInTheDocument();
      expect(screen.getByText('Price')).toBeInTheDocument();
      // For price 0, valueNow might be "0" or "0.00". Let's try "0".
      // If there are multiple spinbuttons, this needs to be more specific.
      // Assuming this is the only spinbutton or the one for Activity's price.
      const priceSpinbuttons = screen.getAllByRole('spinbutton');
      // This is fragile; ideally, test IDs or more specific selectors would be used.
      // For now, let's assume the last spinbutton on this form is the relevant one.
      // Expect "0.00" for a price of 0 due to InputNumber formatting.
      expect(priceSpinbuttons[priceSpinbuttons.length -1]).toHaveValue(
        activityEventData.price === 0 ? '0.00' : activityEventData.price.toString()
      );

      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Location')).toBeInTheDocument();
      expect(screen.getByText('Difficulty Level')).toBeInTheDocument();
      // For Ant Design Segmented control, check for the active segment.
      // The text "Moderate" should be visible and have styling indicating it's selected.
      // A simple check for the text for now.
      expect(screen.getByText('Moderate')).toBeInTheDocument();

      // ... existing checks ...
      expect(screen.getByText('Equipment Needed')).toBeInTheDocument();
      expect(screen.getByDisplayValue(activityEventData.equipmentNeeded)).toBeInTheDocument();
      expect(screen.getByText('Notes')).toBeInTheDocument(); // Common field
      expect(screen.getByDisplayValue(activityEventData.notes)).toBeInTheDocument();
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

    it('calls onChange for Equipment Needed field (Activity)', async () => {
      const formUI = eventFormBuilder({ event: activityEventData, onChange: mockOnChange });
      const TestHost = () => <form>{formUI}</form>;
      render(<TestHost />);
      const equipmentNeededInput = screen.getByDisplayValue(activityEventData.equipmentNeeded);
      fireEvent.change(equipmentNeededInput, { target: { value: 'Sunscreen, hat' } });
      expect(mockOnChange).toHaveBeenLastCalledWith({ equipmentNeeded: 'Sunscreen, hat' });
    });
  });

  // Add after other describe blocks for event types
  describe('Meeting Event Type', () => {
    const meetingEventData = {
      id: 'evtMeeting',
      type: 'Meeting',
      name: 'Project Sync',
      description: 'Weekly project status update',
      beginTime: dayjs('14:00', 'HH:mm'),
      endTime: dayjs('15:00', 'HH:mm'),
      notes: 'Bring project updates',
      location: { formatted_address: 'Conference Room 3' }, // Or some mock address string if easier for mock
      attendees: 'Alice, Bob, Charlie',
      agenda: '1. Review last week action items\n2. Discuss blockers\n3. Plan next week',
    };

    it('renders common and Meeting-specific fields', () => {
      // For fields managed by AntD Form when 'name' prop is used on Form.Item,
      // initial values should be provided via Form's initialValues prop.
      const { agenda, ...restOfMeetingData } = meetingEventData;
      const formUI = eventFormBuilder({ event: meetingEventData, onChange: mockOnChange });
      const TestHost = () => (
        <Form initialValues={{ agenda: meetingEventData.agenda }}> {/* Pass agenda here */}
          {formUI}
        </Form>
      );
      render(<TestHost />);

      // Common fields
      expect(screen.getByDisplayValue(meetingEventData.name)).toBeInTheDocument();
      expect(screen.getByDisplayValue(meetingEventData.description)).toBeInTheDocument();
      expect(screen.getByDisplayValue(meetingEventData.beginTime.format('HH:mm'))).toBeInTheDocument();
      expect(screen.getByDisplayValue(meetingEventData.endTime.format('HH:mm'))).toBeInTheDocument();
      expect(screen.getByDisplayValue(meetingEventData.notes)).toBeInTheDocument();

      // Meeting-specific fields
      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Meeting location')).toBeInTheDocument(); // Check placeholder for AddressSearch

      expect(screen.getByText('Attendees')).toBeInTheDocument();
      expect(screen.getByDisplayValue(meetingEventData.attendees)).toBeInTheDocument();

      expect(screen.getByText('Agenda')).toBeInTheDocument();
      // For Textarea with multi-line, check .value directly
      const agendaTextarea = screen.getByLabelText('Agenda');
      expect(agendaTextarea.value).toBe(meetingEventData.agenda);
    });

    it('calls onChange for Location field (Meeting - AddressSearch)', async () => {
      const { agenda, ...restOfMeetingData } = meetingEventData;
      const formUI = eventFormBuilder({ event: meetingEventData, onChange: mockOnChange });
      const TestHost = () => (
        <Form initialValues={{ agenda: meetingEventData.agenda }}>
          {formUI}
        </Form>
      );
      render(<TestHost />);
      const locationInput = screen.getByTestId('address-search-Meeting location'); // Matches mock
      await userEvent.type(locationInput, 'test address'); // Triggers onSelect in mock
      expect(mockOnChange).toHaveBeenLastCalledWith({
        location: { // This is the structure from the mock's onSelect
          formatted_address: 'Test Address, 123 Main St',
          geometry: { location: { lat: expect.any(Function), lng: expect.any(Function) } },
        },
      });
    });

    it('calls onChange for Attendees field (Meeting)', async () => {
      const { agenda, ...restOfMeetingData } = meetingEventData;
      const formUI = eventFormBuilder({ event: meetingEventData, onChange: mockOnChange });
      const TestHost = () => (
        <Form initialValues={{ agenda: meetingEventData.agenda }}>
          {formUI}
        </Form>
      );
      render(<TestHost />);
      const attendeesInput = screen.getByDisplayValue(meetingEventData.attendees);
      fireEvent.change(attendeesInput, { target: { value: 'David, Eve' } });
      expect(mockOnChange).toHaveBeenLastCalledWith({ attendees: 'David, Eve' });
    });

    it('calls onChange for Agenda field (Meeting)', async () => {
      const { agenda, ...restOfMeetingData } = meetingEventData;
      const formUI = eventFormBuilder({ event: meetingEventData, onChange: mockOnChange });
      const TestHost = () => (
        <Form initialValues={{ agenda: meetingEventData.agenda }}> {/* Pass agenda here */}
          {formUI}
        </Form>
      );
      render(<TestHost />);
      // For Textarea with multi-line, get by label and check .value
      const agendaInput = screen.getByLabelText('Agenda'); // This should now find the input with the correct value
      expect(agendaInput.value).toBe(meetingEventData.agenda); // Initial value check
      fireEvent.change(agendaInput, { target: { value: 'New agenda points' } });
      expect(mockOnChange).toHaveBeenLastCalledWith({ agenda: 'New agenda points' });
    });
  });
});
