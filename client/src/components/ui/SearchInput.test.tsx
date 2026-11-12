import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { SearchInput } from './SearchInput';

function Controlled({ onSearch }: { onSearch: (v: string) => void }) {
  const [value, setValue] = useState('');
  return <SearchInput aria-label="Search products" value={value} onChange={setValue} onSearch={onSearch} debounceMs={300} />;
}

describe('SearchInput', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('calls onSearch once with the last value after the debounce', () => {
    const onSearch = vi.fn();
    render(<Controlled onSearch={onSearch} />);
    const input = screen.getByRole('searchbox', { name: 'Search products' });
    fireEvent.change(input, { target: { value: 'ri' } });
    act(() => vi.advanceTimersByTime(200));
    fireEvent.change(input, { target: { value: 'rice' } });
    act(() => vi.advanceTimersByTime(299));
    expect(onSearch).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('rice');
  });

  it('Escape clears the text (and searches for "") without bubbling', () => {
    const onSearch = vi.fn();
    const onParentKey = vi.fn();
    render(
      // Test harness: a plain ancestor that records bubbled key events.
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div onKeyDown={onParentKey}>
        <Controlled onSearch={onSearch} />
      </div>,
    );
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'dal' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input).toHaveValue('');
    expect(onParentKey).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(300));
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('');
    // A second Escape on an empty box is left for the dialog / page.
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onParentKey).toHaveBeenCalled();
  });

  it('clear button empties the box and returns focus; spinner replaces it while loading', () => {
    const { rerender } = render(<SearchInput aria-label="Search" defaultValue="oil" />);
    const input = screen.getByRole('searchbox');
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
    rerender(<SearchInput aria-label="Search" defaultValue="oil" loading />);
    expect(screen.getByRole('status', { name: 'Searching' })).toBeInTheDocument();
  });
});
