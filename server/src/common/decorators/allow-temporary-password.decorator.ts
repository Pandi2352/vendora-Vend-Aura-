import { SetMetadata } from '@nestjs/common';

export const ALLOW_TEMPORARY_PASSWORD_KEY = 'allowTemporaryPassword';

/**
 * Marks a route as reachable by a user who still has a temporary password.
 * Every other authenticated route rejects such users with PASSWORD_CHANGE_REQUIRED.
 */
export const AllowTemporaryPassword = () => SetMetadata(ALLOW_TEMPORARY_PASSWORD_KEY, true);
