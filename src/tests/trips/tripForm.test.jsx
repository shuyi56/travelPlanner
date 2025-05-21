import {render, screen} from '@testing-library/react';
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
      screen.getByRole('button', { name: /Create Trip|Update Trip/i })
    ).toBeInTheDocument();
  });
});