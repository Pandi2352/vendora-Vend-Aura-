import { useState } from 'react';

/** Open / close state of a Master add-edit dialog and the row being edited (null = adding). */
export function useMasterEditor<T>() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  return {
    open,
    editing,
    openAdd: () => {
      setEditing(null);
      setOpen(true);
    },
    openEdit: (row: T) => {
      setEditing(row);
      setOpen(true);
    },
    close: () => setOpen(false),
  };
}
