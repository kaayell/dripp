import {
  ImportedCategory,
  ImportedData,
  ImportedReminder,
  ImportedTask,
  ImportedTaskLog,
} from '../importParser';

const audit = { createdAt: '2026-09-01T10:00:00.000Z', updatedAt: '2026-09-02T10:00:00.000Z' };

function validFile() {
  return {
    categories: [{ name: 'bod', ...audit }],
    tasks: [
      {
        name: 'drip',
        color: '#e18b60',
        category: 'bod' as string | null,
        logs: [{ date: '2026-09-01', ...audit }],
        reminder: null,
        ...audit,
      },
      {
        name: 'mop',
        color: '#64a1ee',
        category: null as string | null,
        logs: [],
        reminder: {
          time: '09:00',
          type: 'weekly',
          interval: 1,
          dayOfWeek: 2,
          dayOfMonth: null,
          ...audit,
        },
        ...audit,
      },
    ],
  };
}

describe('ImportedData', () => {
  it('turns a valid file into app data', () => {
    const file = validFile();

    const imported = ImportedData.fromJson(JSON.stringify(file));

    expect(imported.errors).toEqual([]);
    expect(imported.isValid).toBe(true);
    expect(imported.toAppData()).toEqual(file);
  });

  it.each([
    ['not json', 'File is not valid JSON'],
    ['[]', 'File is not a dripp export'],
    ['"text"', 'File is not a dripp export'],
  ])('rejects %s', (json, error) => {
    expect(ImportedData.fromJson(json).errors).toEqual([error]);
  });

  it('reports every missing list', () => {
    expect(ImportedData.fromJson('{}').errors).toEqual([
      '"categories" must be a list',
      '"tasks" must be a list',
    ]);
  });

  it('collects errors from every row, including nested logs and reminders', () => {
    const file = validFile();
    file.tasks[0].color = 'red';
    file.tasks[0].logs[0].date = 'yesterday';
    file.tasks[1].reminder!.time = 'noon';

    expect(ImportedData.fromJson(JSON.stringify(file)).errors).toEqual([
      'tasks[0].color must be a hex color',
      'tasks[0].logs[0].date must be YYYY-MM-DD',
      'tasks[1].reminder.time must be HH:MM',
    ]);
  });

  it('matches category names regardless of case', () => {
    const file = validFile();
    file.tasks[0].category = 'BOD';

    expect(ImportedData.fromJson(JSON.stringify(file)).isValid).toBe(true);
  });

  it('reports tasks in a category missing from the file', () => {
    const file = validFile();
    file.tasks[1].category = 'home';

    expect(ImportedData.fromJson(JSON.stringify(file)).errors).toEqual([
      'tasks[1] is in category "home", which isn\'t in the file',
    ]);
  });

  it('refuses to produce app data when invalid', () => {
    expect(() => ImportedData.fromJson('{}').toAppData()).toThrow();
  });
});

describe('ImportedCategory', () => {
  it('reports a non-object row once', () => {
    expect(new ImportedCategory('bod', 0).errors).toEqual(['categories[0] must be an object']);
  });

  it('requires a non-empty name', () => {
    expect(new ImportedCategory({ name: '  ', ...audit }, 0).errors).toEqual([
      'categories[0].name must be non-empty text',
    ]);
  });
});

describe('ImportedTask', () => {
  const task = (overrides: object) =>
    new ImportedTask(
      {
        name: 'walk',
        color: '#e18b60',
        category: null,
        logs: [],
        reminder: null,
        ...audit,
        ...overrides,
      },
      0,
    );

  it.each(['#abc', 'ec5b57', '#ec5b5780', 'teal'])('rejects color %s', (color) => {
    expect(task({ color }).errors).toEqual(['tasks[0].color must be a hex color']);
  });

  it('treats a missing category and reminder as none', () => {
    const imported = task({ category: undefined, reminder: undefined });

    expect(imported.isValid).toBe(true);
    expect(imported.category).toBeNull();
    expect(imported.reminder).toBeNull();
  });

  it('requires logs to be a list', () => {
    expect(task({ logs: undefined }).errors).toEqual(['tasks[0].logs must be a list']);
  });

  it('is invalid when a nested log is invalid', () => {
    const imported = task({ logs: [{ date: '2026-02-30', ...audit }] });

    expect(imported.errors).toEqual([]);
    expect(imported.isValid).toBe(false);
    expect(imported.allErrors).toEqual(['tasks[0].logs[0].date must be YYYY-MM-DD']);
  });
});

describe('ImportedTaskLog', () => {
  it.each(['2026-13-01', '2026-02-30', '2026-9-1'])('rejects date %s', (date) => {
    expect(new ImportedTaskLog({ date, ...audit }, 'log').errors).toEqual([
      'log.date must be YYYY-MM-DD',
    ]);
  });

  it('rejects unparseable timestamps', () => {
    const log = new ImportedTaskLog(
      { date: '2026-09-01', createdAt: 'soon', updatedAt: audit.updatedAt },
      'log',
    );

    expect(log.errors).toEqual(['log.createdAt must be an ISO timestamp']);
  });
});

describe('audit timestamps', () => {
  it.each([
    ['missing', {}],
    ['null', { createdAt: null, updatedAt: null }],
  ])('are optional when %s, and left out of the row', (_, timestamps) => {
    const category = new ImportedCategory({ name: 'bod', ...timestamps }, 0);

    expect(category.isValid).toBe(true);
    expect(category.toRow()).toEqual({ name: 'bod' });
    expect(Object.keys(category.toRow())).toEqual(['name']);
  });

  it('keeps the ones supplied', () => {
    const log = new ImportedTaskLog({ date: '2026-09-01', createdAt: audit.createdAt }, 'log');

    expect(log.toRow()).toEqual({ date: '2026-09-01', createdAt: audit.createdAt });
  });

  it('are still checked when supplied', () => {
    expect(new ImportedCategory({ name: 'bod', updatedAt: 'soon' }, 0).errors).toEqual([
      'categories[0].updatedAt must be an ISO timestamp',
    ]);
  });
});

describe('ImportedReminder', () => {
  const reminder = (overrides: object) =>
    new ImportedReminder(
      {
        time: '09:00',
        type: 'daily',
        interval: 1,
        dayOfWeek: null,
        dayOfMonth: null,
        ...audit,
        ...overrides,
      },
      'reminder',
    );

  it('accepts a daily reminder without days', () => {
    expect(reminder({}).isValid).toBe(true);
  });

  it.each([
    [{ time: '25:00' }, 'reminder.time must be HH:MM'],
    [{ time: '9:00' }, 'reminder.time must be HH:MM'],
    [{ type: 'yearly' }, 'reminder.type must be one of daily, weekly, monthly'],
    [{ interval: 0 }, 'reminder.interval must be a whole number from 1 to 365'],
    [{ type: 'weekly' }, 'reminder.dayOfWeek must be a whole number from 0 to 6'],
    [
      { type: 'monthly', dayOfMonth: 32 },
      'reminder.dayOfMonth must be a whole number from 1 to 31',
    ],
  ])('rejects %j', (overrides, error) => {
    expect(reminder(overrides).errors).toEqual([error]);
  });
});
