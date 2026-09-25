import { format } from 'date-fns';
import { computeNextReminder, computeReminderSchedule } from '../reminderDates';

const fmt = (date: Date) => format(date, 'yyyy-MM-dd HH:mm');

describe('computeNextReminder', () => {
  describe('daily', () => {
    it('computes the next reminder date', () => {
      const reminderTime = new Date('2026-09-14T09:00:00');
      expect(
        fmt(
          computeNextReminder(reminderTime, {
            type: 'daily',
            interval: 1,
            dayOfWeek: null,
            dayOfMonth: null,
          }),
        ),
      ).toBe('2026-09-15 09:00');
    });

    it('computes the next reminder date with interval', () => {
      const reminderTime = new Date('2026-09-14T09:00:00');
      expect(
        fmt(
          computeNextReminder(reminderTime, {
            type: 'daily',
            interval: 3,
            dayOfWeek: null,
            dayOfMonth: null,
          }),
        ),
      ).toBe('2026-09-17 09:00');
    });
  });

  describe('weekly', () => {
    it('computes the next reminder date', () => {
      const reminderTime = new Date('2026-09-24T09:00:00');
      expect(
        fmt(
          computeNextReminder(reminderTime, {
            type: 'weekly',
            interval: 1,
            dayOfWeek: 5,
            dayOfMonth: null,
          }),
        ),
      ).toBe('2026-10-02 09:00');
    });

    it('computes the next reminder date with interval', () => {
      const reminderTime = new Date('2026-09-24T09:00:00');
      expect(
        fmt(
          computeNextReminder(reminderTime, {
            type: 'weekly',
            interval: 2,
            dayOfWeek: 2,
            dayOfMonth: null,
          }),
        ),
      ).toBe('2026-10-06 09:00');
    });
  });

  describe('monthly', () => {
    it('computes the next reminder date for dayOfMonth in future', () => {
      const reminderTime = new Date('2026-09-24T09:00:00');
      expect(
        fmt(
          computeNextReminder(reminderTime, {
            type: 'monthly',
            interval: 1,
            dayOfWeek: null,
            dayOfMonth: 31,
          }),
        ),
      ).toBe('2026-09-30 09:00');
    });

    it('computes the next reminder date for dayOfMonth in past', () => {
      const reminderTime = new Date('2026-09-24T09:00:00');
      expect(
        fmt(
          computeNextReminder(reminderTime, {
            type: 'monthly',
            interval: 1,
            dayOfWeek: null,
            dayOfMonth: 15,
          }),
        ),
      ).toBe('2026-10-15 09:00');
    });

    it('computes the next reminder date with interval', () => {
      const reminderTime = new Date('2026-09-24T09:00:00');
      expect(
        fmt(
          computeNextReminder(reminderTime, {
            type: 'monthly',
            interval: 2,
            dayOfWeek: null,
            dayOfMonth: 31,
          }),
        ),
      ).toBe('2026-11-30 09:00');
    });
  });
});

describe('computeReminderSchedule', () => {
  describe('daily', () => {
    it('computes the next N reminder dates', () => {
      const reminderTime = new Date('2026-09-14T09:00:00');
      const result = computeReminderSchedule(
        reminderTime,
        { type: 'daily', interval: 3, dayOfWeek: null, dayOfMonth: null },
        3,
      );
      expect(result.map(fmt)).toEqual(['2026-09-17 09:00', '2026-09-20 09:00', '2026-09-23 09:00']);
    });
  });

  describe('weekly', () => {
    it('computes the next N reminder dates', () => {
      const reminderTime = new Date('2026-09-24T09:00:00');
      const result = computeReminderSchedule(
        reminderTime,
        { type: 'weekly', interval: 2, dayOfWeek: 5, dayOfMonth: null },
        3,
      );
      expect(result.map(fmt)).toEqual(['2026-10-09 09:00', '2026-10-23 09:00', '2026-11-06 09:00']);
    });
  });

  describe('monthly', () => {
    it('computes the next N reminder dates', () => {
      const reminderTime = new Date('2026-09-24T09:00:00');
      const result = computeReminderSchedule(
        reminderTime,
        { type: 'monthly', interval: 2, dayOfWeek: null, dayOfMonth: 31 },
        3,
      );
      expect(result.map(fmt)).toEqual(['2026-11-30 09:00', '2027-01-31 09:00', '2027-03-31 09:00']);
    });
  });
});
