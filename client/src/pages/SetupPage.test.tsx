import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { SetupPage } from './SetupPage';
import * as apiModule from '../lib/api';

vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
  },
  unwrap: vi.fn((res) => res?.data?.data ?? res?.data),
}));

describe('SetupPage', () => {
  const mockChecklistData = {
    storeName: 'Sri Murugan Stores',
    ownerName: 'Administrator',
    completedCount: 6,
    totalSteps: 8,
    percentage: 75,
    isReadyToBill: true,
    steps: {
      shopDetails: {
        stepNumber: 1,
        title: "Your shop's details",
        description: 'Name and address (GSTIN optional)',
        count: 1,
        completed: true,
      },
      outlet: {
        stepNumber: 2,
        title: 'Your first outlet',
        description: 'Bill numbers are counted per outlet',
        count: 1,
        completed: true,
      },
      itemMasters: {
        stepNumber: 3,
        title: 'Basic item masters',
        description: 'An item cannot be created until these exist',
        count: 5,
        completed: true,
        subMasters: [
          { label: 'Department', count: 1, ready: true },
          { label: 'Category', count: 14, ready: true },
        ],
      },
      supplier: {
        stepNumber: 4,
        title: 'Your first supplier',
        description: 'Every item records who it is bought from',
        count: 5,
        completed: true,
      },
      item: {
        stepNumber: 5,
        title: 'Your first item',
        description: 'Name it, price it, and give it a GST rate',
        count: 50,
        completed: true,
      },
      openingStock: {
        stepNumber: 6,
        title: 'Opening stock',
        description: 'How many you have on the shelf right now',
        count: 50,
        completed: true,
      },
      staff: {
        stepNumber: 7,
        title: 'Your staff',
        description: 'Add your cashiers and managers',
        completed: false,
        isOptional: true,
      },
      testBill: {
        stepNumber: 8,
        title: 'Ring a test bill',
        description: 'The only step that proves the other six actually worked',
        completed: false,
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (apiModule.api.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { data: mockChecklistData },
    });
  });

  it('renders getting started header and setup steps correctly', async () => {
    render(
      <MemoryRouter>
        <SetupPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Let's get you billing, Administrator/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Your shop's details/i)).toBeInTheDocument();
    expect(screen.getByText(/Your first outlet/i)).toBeInTheDocument();
    expect(screen.getByText(/Basic item masters/i)).toBeInTheDocument();
    expect(screen.getByText(/Ring a test bill/i)).toBeInTheDocument();
    expect(screen.getByText(/Open POS >/i)).toBeInTheDocument();
  });
});

