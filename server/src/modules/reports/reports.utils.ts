import { DateUtil, DEFAULT_TIMEZONE } from '../../common';
import { ReportsQueryDto } from './dto/reports-query.dto';

export interface ResolvedDateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Resolves a report period to a [start, end] range using calendar days in the
 * business timezone (not the server's), so "today" is correct on UTC servers.
 */
export function resolveReportDateRange(
  query: ReportsQueryDto,
  timeZone: string = DEFAULT_TIMEZONE,
): ResolvedDateRange {
  const now = DateUtil.nowUtc();
  const customStart = query.startDate ? DateUtil.parse(query.startDate) : null;
  const customEnd = query.endDate ? DateUtil.parse(query.endDate) : null;
  if (customStart && customEnd) {
    return {
      startDate: DateUtil.startOfDay(customStart, timeZone),
      endDate: DateUtil.endOfDay(customEnd, timeZone),
    };
  }

  const endDate = DateUtil.endOfDay(now, timeZone);
  switch (query.period || 'today') {
    case 'week':
      return { startDate: DateUtil.startOfDay(DateUtil.addDays(now, -6), timeZone), endDate };
    case 'month':
      return { startDate: DateUtil.startOfDay(DateUtil.addDays(now, -29), timeZone), endDate };
    case 'fy':
      return { startDate: DateUtil.startOfFinancialYear(now, timeZone), endDate };
    case 'all':
      return { startDate: new Date(0), endDate };
    default:
      return { startDate: DateUtil.startOfDay(now, timeZone), endDate };
  }
}
