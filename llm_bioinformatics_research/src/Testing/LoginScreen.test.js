import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginScreen from '../LoginScreen/LoginScreen';
import { enableFetchMocks } from 'jest-fetch-mock';

enableFetchMocks();

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('LoginScreen', () => {
  const setup = () => render(
    <MemoryRouter>
      <LoginScreen />
    </MemoryRouter>
  );

  beforeEach(() => {
    jest.resetAllMocks();
    fetchMock.resetMocks();
    Storage.prototype.setItem = jest.fn();
  });

  test('renders login form inputs and buttons', () => {
    setup();
    expect(screen.getByTestId('login-heading')).toHaveTextContent('Login');
    expect(screen.getByTestId('identifier-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
  });

  test('allows entering email/username and password', () => {
    setup();
    userEvent.type(screen.getByTestId('identifier-input'), 'user@example.com');
    expect(screen.getByTestId('identifier-input')).toHaveValue('user@example.com');
    userEvent.type(screen.getByTestId('password-input'), 'password123');
    expect(screen.getByTestId('password-input')).toHaveValue('password123');
  });

  test('toggles password visibility', () => {
    setup();
    const passwordInput = screen.getByTestId('password-input');
    const toggleButton = screen.getByRole('button', { name: 'toggle password visibility' });
    expect(passwordInput).toHaveAttribute('type', 'password');
    userEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    userEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('prevents submission with empty fields and shows an error message', async () => {
    setup();
    userEvent.click(screen.getByTestId('login-button'));
    await waitFor(() => {
      expect(screen.queryByTestId('login-error')).toBeInTheDocument();
      expect(screen.getByTestId('login-error')).toHaveTextContent('Both email/username and password are required.');
    });
  });

  test('shows an error message on failed login', async () => {
    setup();
    fetchMock.mockRejectOnce(new Error('Failed to fetch'));
    userEvent.type(screen.getByTestId('identifier-input'), 'user@example.com');
    userEvent.type(screen.getByTestId('password-input'), 'wrongpassword');
    userEvent.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.getByTestId('login-error')).toHaveTextContent('An error occurred while trying to log in. Please try again.');
    });
  });

  test('successful login redirects to home page', async () => {
    setup();
    fetchMock.mockResponseOnce(JSON.stringify({ token: '12345' }), { status: 200 });

    userEvent.type(screen.getByTestId('identifier-input'), 'test_user');
    userEvent.type(screen.getByTestId('password-input'), 'Test_123#');
    userEvent.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(Storage.prototype.setItem).toHaveBeenCalledWith('authToken', '12345');
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });
});
