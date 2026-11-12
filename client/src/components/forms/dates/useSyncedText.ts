import { useEffect, useRef, useState } from 'react';

/**
 * Display text for a masked input that is kept apart from the form value
 * (so partial input like "12/0" can be typed). Values set from outside
 * (reset, setValue) re-format the text; values this input emitted do not.
 */
export function useSyncedText(
  value: unknown,
  onChange: (value: unknown) => void,
  format: (value: unknown) => string,
  onExternalChange?: () => void,
) {
  const [text, setText] = useState(() => format(value));
  const emitted = useRef<unknown>(value);

  useEffect(() => {
    if (value === emitted.current) return;
    emitted.current = value;
    setText(format(value));
    onExternalChange?.();
    // Only react to the value; format / callback are recreated every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const emit = (next: unknown) => {
    emitted.current = next;
    onChange(next);
  };

  return { text, setText, emit };
}
