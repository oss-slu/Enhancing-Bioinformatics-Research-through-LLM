// UserProfile.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import UserProfile from '../UserProfile/UserProfile';


describe('UserProfile Component', () => {
  test('renders UserProfile with all required elements', () => {
    render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );

    expect(screen.getByText(/User Profile/i)).toBeInTheDocument();

    expect(screen.getByText(/My Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Settings/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Location/i)).toBeInTheDocument();
  });

  test('handles input changes correctly', () => {
    render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );

    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    expect(nameInput.value).toBe('Jane Doe');

    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'jane.doe@example.com' } });
    expect(emailInput.value).toBe('jane.doe@example.com');
  });

  test('handles image upload correctly', () => {
    render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );

    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
    const imageInput = screen.getByTestId('avatar-upload');
    fireEvent.change(imageInput, { target: { files: [file] } });

    expect(imageInput.files[0]).toStrictEqual(file);
  });

  test('handles section change correctly', () => {
    render(
        <MemoryRouter>
            <UserProfile />
        </MemoryRouter>
    );
    
    const settingsButton = screen.getByText(/Settings/i);
    fireEvent.click(settingsButton);
    expect(screen.getByText(/Settings/i)).toBeInTheDocument();
  });

});
