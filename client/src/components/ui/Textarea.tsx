import type { Ref, TextareaHTMLAttributes } from 'react';
import { cn } from './cn';
import { controlBase, controlStates } from './field-styles';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
  ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({ invalid, className, rows = 3, ref, ...rest }: TextareaProps) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(controlBase, 'px-3 py-2 resize-y min-h-20', invalid ? controlStates.invalid : controlStates.normal, className)}
      {...rest}
    />
  );
}
