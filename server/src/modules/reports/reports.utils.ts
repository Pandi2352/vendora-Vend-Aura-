import { DateUtil } from '../../common/utils/date.util';
import { ReportsQueryDto } from './dto/reports-query.dto';

export interface ResolvedDateRange {
  startDate: Date;
  endDate: Date;
}

export function resolveReportDateRange(query: ReportsQueryDto): ResolvedDateRange {
  const now = new Date();

  if (query.startDate && query.endDate) {
    const s = new Date(query.startDate);
    const e = new Date(query.endDate);
    if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
      return {
        startDate: DateUtil.startOfDay(s),
        endDate: DateUtil.endOfDay(e),
      };
    }
  }

  const period = query.period || 'today';

  if (period === 'today') {
    return {
      startDate: DateUtil.startOfDay(now),
      endDate: DateUtil.endOfDay(now),
    };
  }

  if (period === 'week') {
    return {
      startDate: DateUtil.startOfDay(DateUtil.addDays(now, -7)),
      endDate: DateUtil.endOfDay(now),
    };
  }

  if (period === 'month') {
    return {
      startDate: DateUtil.startOfDay(DateUtil.addDays(now, -30)),
      endDate: DateUtil.endOfDay(now),
    };
  }

  if (period === 'fy') {
    const currentMonth = now.getMonth(); // 0 = Jan, 3 = April
    const currentYear = now.getFullYear();
    const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
    return {
      startDate: new Date(fyStartYear, 3, 1, 0, 0, 0, 0),
      endDate: DateUtil.endOfDay(now),
    };
  }

  // 'all'
  return {
    startDate: new Date(2020, 0, 1),
    endDate: DateUtil.endOfDay(now),
  };
}
