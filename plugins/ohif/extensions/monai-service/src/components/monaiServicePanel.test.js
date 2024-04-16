// Importing necessary utilities and components
import React from 'react';
import { MonaiServicePanel } from './MonaiServicePanel';
import { render, waitFor } from '@testing-library/react';

// Mocking external dependencies
jest.mock('../services/MonaiServiceClient', () => {
  return {
    MonaiServiceClient: jest.fn().mockImplementation(() => ({
      getAuthorizationHeader: () => ({ Authorization: 'Bearer fake_token' }),
      list_models: jest.fn().mockResolvedValue({
        status: 200,
        data: [/* Mocked data relevant to your tests */]
      }),
      cache_image: jest.fn().mockResolvedValue({})
    }))
  };
});

// Mock UI Notification Service
const mockNotificationService = {
  show: jest.fn(),
  hide: jest.fn()
};

// Mock Display Set Service
const mockDisplaySetService = {
  activeDisplaySets: [{
    SeriesInstanceUID: '123',
    StudyInstanceUID: '456',
    instances: [{
      FrameOfReferenceUID: '789'
    }],
    displaySetInstanceUID: '101112'
  }]
};

// Test suite for the MonaiServicePanel component
describe('MonaiServicePanel', () => {
  it('handles model and dataset information on successful connection', async () => {
    // Setting up mock props
    const props = {
      servicesManager: {
        services: {
          uiNotificationService: mockNotificationService,
          displaySetService: mockDisplaySetService
        }
      }
    };

    // Render component with the mocked props
    const { container } = render(<MonaiServicePanel {...props} />);

    // Trigger the onInfo function
    const instance = container.querySelector('MonaiServicePanel');
    await instance.onInfo();

    // Assertions to check if the function behaves as expected
    expect(mockNotificationService.show).toHaveBeenCalledWith(expect.objectContaining({
      type: 'info',
      message: 'Connecting to MONAI Service'
    }));
    await waitFor(() => {
      expect(mockNotificationService.show).toHaveBeenCalledWith(expect.objectContaining({
        type: 'success',
        message: 'Connected to MONAI Service Server - Successful'
      }));
    });
    expect(instance.state.info.models.length).toBeGreaterThan(0); // Assuming there's data in the mocked response
  });
});
