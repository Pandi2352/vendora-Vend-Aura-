import { SearchQueryDto } from '../../../common';

/** GET /customers: page, limit (max 100), search by name / phone / GSTIN. */
export class CustomerQueryDto extends SearchQueryDto {}
