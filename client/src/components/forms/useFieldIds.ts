import { useId } from 'react';

export interface FieldIds {
  id: string;
  messageId: string;
  descriptionId: string;
  /** For aria-describedby on the control. */
  describedBy: string | undefined;
}

/** Stable ids for a field's control, description and message line. */
export function useFieldIds(name: string, id?: string, hasDescription = false): FieldIds {
  const auto = useId();
  const controlId = id ?? `f-${name.replace(/\W/g, '-')}-${auto}`;
  const messageId = `${controlId}-msg`;
  const descriptionId = `${controlId}-desc`;
  return {
    id: controlId,
    messageId,
    descriptionId,
    describedBy: [hasDescription ? descriptionId : null, messageId].filter(Boolean).join(' '),
  };
}
