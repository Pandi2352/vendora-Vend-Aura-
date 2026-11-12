import { z } from 'zod';
import { rules, withCrossFieldRules, withPasswordConfirmation } from './common';
import { changePasswordSchema } from './auth';

const issues = (schema: z.ZodType, value: unknown) =>
  (schema.safeParse(value).error?.issues ?? []).map((i) => `${i.path.join('.')}: ${i.message}`);

describe('cross-field rules (Zod 4 `when`)', () => {
  it('shows "Passwords do not match" while another field is still empty', () => {
    const schema = withPasswordConfirmation(
      z.object({ name: rules.text('Name'), newPassword: rules.password(), confirmPassword: z.string() }),
    );
    expect(issues(schema, { name: '', newPassword: 'secret123', confirmPassword: 'secret12' })).toEqual([
      'name: Name is required',
      'confirmPassword: Passwords do not match',
    ]);
  });

  it('skips the rule while its own fields are invalid', () => {
    const schema = withPasswordConfirmation(z.object({ newPassword: rules.password(), confirmPassword: z.string() }));
    expect(issues(schema, { newPassword: 'short', confirmPassword: 'x' })).not.toContain('confirmPassword: Passwords do not match');
  });

  it('change password: both rules report together with an empty current password', () => {
    const result = issues(changePasswordSchema, { currentPassword: '', newPassword: 'Secret123', confirmPassword: 'Secret124' });
    expect(result).toContain('currentPassword: Current password is required');
    expect(result).toContain('confirmPassword: Passwords do not match');
  });

  it('runs several independent rules', () => {
    const schema = withCrossFieldRules(
      z.object({ min: z.number(), max: z.number(), label: rules.text('Label') }),
      [
        {
          fields: ['min', 'max'],
          check: (v, ctx) => {
            if (v.min > v.max) ctx.addIssue({ code: 'custom', path: ['max'], message: 'Max must be at least min' });
          },
        },
      ],
    );
    expect(issues(schema, { min: 5, max: 1, label: '' })).toEqual(['label: Label is required', 'max: Max must be at least min']);
  });
});
