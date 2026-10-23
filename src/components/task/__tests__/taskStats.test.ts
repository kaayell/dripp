import { computeTaskStats } from '../taskStats';

describe('computeTaskStats', () => {
  const today = '2026-10-23';

  it('handles no logs', () => {
    expect(computeTaskStats([], today)).toEqual({
      total: 0,
      last30Days: 0,
      lastYear: 0,
      averageGapDays: null,
      gaps: [],
    });
  });

  it('ignores duplicate dates', () => {
    expect(computeTaskStats(['2026-10-23', '2026-10-23'], today).total).toBe(1);
  });

  it('counts logs in the last 30 days', () => {
    const stats = computeTaskStats(['2026-10-23', '2026-09-24', '2026-09-23'], today);
    expect(stats.last30Days).toBe(2);
  });

  it('counts logs in the last year', () => {
    const stats = computeTaskStats(['2026-10-23', '2025-10-24', '2025-10-23'], today);
    expect(stats.lastYear).toBe(2);
  });

  it('averages the days between logs', () => {
    expect(computeTaskStats(['2026-10-01', '2026-10-05', '2026-10-13'], today).averageGapDays).toBe(
      6,
    );
  });

  it('lists gaps between entries, newest first', () => {
    expect(computeTaskStats(['2026-10-05', '2026-10-01', '2026-10-13'], today).logs).toEqual([
      { date: '2026-10-13', previousDate: '2026-10-05', days: 8 },
      { date: '2026-10-05', previousDate: '2026-10-01', days: 4 },
    ]);
  });
});
