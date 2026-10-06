import { isMatch } from 'date-fns';
import type {
  AppData,
  ExportedCategory,
  ExportedReminder,
  ExportedTask,
  ExportedTaskLog,
  ExportedTaskNote,
  Reminder,
} from '../../db/queries.ts';
import { DateFrequency } from '@/constants/dates.ts';

type RawRow = Record<string, unknown>;

const REMINDER_TYPES: readonly string[] = Object.values(DateFrequency);
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;

function isObject(value: unknown): value is RawRow {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

abstract class ImportedRow<T> {
  readonly errors: string[] = [];
  private readonly raw: RawRow;
  private readonly isObjectRow: boolean;
  readonly createdAt: string | undefined;
  readonly updatedAt: string | undefined;

  protected constructor(
    value: unknown,
    readonly label: string,
  ) {
    this.isObjectRow = isObject(value);
    this.raw = isObject(value) ? value : {};
    if (!this.isObjectRow) this.errors.push(`${label} must be an object`);
    this.createdAt = this.readOptionalTimestamp('createdAt');
    this.updatedAt = this.readOptionalTimestamp('updatedAt');
  }

  /** The audit timestamps the file supplied, leaving out missing ones so defaults apply. */
  protected get audit(): { createdAt?: string; updatedAt?: string } {
    return {
      ...(this.createdAt != null && { createdAt: this.createdAt }),
      ...(this.updatedAt != null && { updatedAt: this.updatedAt }),
    };
  }

  get allErrors(): string[] {
    return this.errors;
  }

  get isValid(): boolean {
    return this.allErrors.length === 0;
  }

  abstract toRow(): T;

  private invalid(field: string, expected: string) {
    if (!this.isObjectRow) return;
    this.errors.push(`${this.label}.${field} must be ${expected}`);
  }

  protected readOptionalText(field: string): string | null {
    return this.raw[field] == null ? null : this.readText(field);
  }

  protected readList(field: string): unknown[] {
    const value = this.raw[field];
    if (Array.isArray(value)) return value;
    this.invalid(field, 'a list');
    return [];
  }

  protected readOptionalList(field: string): unknown[] {
    return this.raw[field] == null ? [] : this.readList(field);
  }

  protected readOptional(field: string): unknown {
    return this.raw[field] ?? null;
  }

  protected readInteger(field: string, min: number, max: number): number {
    const value = this.raw[field];
    if (Number.isInteger(value) && (value as number) >= min && (value as number) <= max) {
      return value as number;
    }
    this.invalid(field, `a whole number from ${min} to ${max}`);
    return min;
  }

  protected readOptionalInteger(field: string, min: number, max: number): number | null {
    return this.raw[field] == null ? null : this.readInteger(field, min, max);
  }

  protected readText(field: string): string {
    const value = this.raw[field];
    if (typeof value === 'string' && value.trim() !== '') return value;
    this.invalid(field, 'non-empty text');
    return '';
  }

  protected readMatching(
    field: string,
    valid: (value: string) => boolean,
    expected: string,
  ): string {
    const value = this.raw[field];
    if (typeof value === 'string' && valid(value)) return value;
    this.invalid(field, expected);
    return '';
  }

  protected readDate(field: string): string {
    return this.readMatching(
      field,
      (v) => DATE_PATTERN.test(v) && isMatch(v, 'yyyy-MM-dd'),
      'YYYY-MM-DD',
    );
  }

  protected readOptionalTimestamp(field: string): string | undefined {
    return this.raw[field] == null ? undefined : this.readTimestamp(field);
  }

  protected readTimestamp(field: string): string {
    return this.readMatching(field, (v) => !Number.isNaN(Date.parse(v)), 'an ISO timestamp');
  }
}

export class ImportedCategory extends ImportedRow<ExportedCategory> {
  readonly name: string;

  constructor(value: unknown, index: number) {
    super(value, `categories[${index}]`);
    this.name = this.readText('name');
  }

  toRow(): ExportedCategory {
    return { name: this.name, ...this.audit };
  }
}

export class ImportedTaskLog extends ImportedRow<ExportedTaskLog> {
  readonly date: string;

  constructor(value: unknown, label: string) {
    super(value, label);
    this.date = this.readDate('date');
  }

  toRow(): ExportedTaskLog {
    return { date: this.date, ...this.audit };
  }
}

export class ImportedTaskNote extends ImportedRow<ExportedTaskNote> {
  readonly date: string;
  readonly note: string;

  constructor(value: unknown, label: string) {
    super(value, label);
    this.date = this.readDate('date');
    this.note = this.readText('note');
  }

  toRow(): ExportedTaskNote {
    return { date: this.date, note: this.note, ...this.audit };
  }
}

export class ImportedReminder extends ImportedRow<ExportedReminder> {
  readonly time: string;
  readonly type: Reminder['type'];
  readonly interval: number;
  readonly dayOfWeek: number | null;
  readonly dayOfMonth: number | null;

  constructor(value: unknown, label: string) {
    super(value, label);
    this.time = this.readMatching(
      'time',
      (v) => TIME_PATTERN.test(v) && isMatch(v, 'HH:mm'),
      'HH:MM',
    );
    this.type = this.readMatching(
      'type',
      (v) => REMINDER_TYPES.includes(v),
      `one of ${REMINDER_TYPES.join(', ')}`,
    ) as Reminder['type'];
    this.interval = this.readInteger('interval', 1, 365);
    this.dayOfWeek =
      this.type === 'weekly'
        ? this.readInteger('dayOfWeek', 0, 6)
        : this.readOptionalInteger('dayOfWeek', 0, 6);
    this.dayOfMonth =
      this.type === 'monthly'
        ? this.readInteger('dayOfMonth', 1, 31)
        : this.readOptionalInteger('dayOfMonth', 1, 31);
  }

  toRow(): ExportedReminder {
    const { time, type, interval, dayOfWeek, dayOfMonth } = this;
    return { time, type, interval, dayOfWeek, dayOfMonth, ...this.audit };
  }
}

export class ImportedTask extends ImportedRow<ExportedTask> {
  readonly name: string;
  readonly color: string;
  readonly category: string | null;
  readonly logs: ImportedTaskLog[];
  readonly notes: ImportedTaskNote[];
  readonly reminder: ImportedReminder | null;

  constructor(value: unknown, index: number) {
    super(value, `tasks[${index}]`);
    this.name = this.readText('name');
    this.color = this.readMatching('color', (v) => HEX_COLOR_PATTERN.test(v), 'a hex color');
    this.category = this.readOptionalText('category');
    this.logs = this.readList('logs').map(
      (log, i) => new ImportedTaskLog(log, `${this.label}.logs[${i}]`),
    );
    this.notes = this.readOptionalList('notes').map(
      (note, i) => new ImportedTaskNote(note, `${this.label}.notes[${i}]`),
    );
    const reminder = this.readOptional('reminder');
    this.reminder =
      reminder == null ? null : new ImportedReminder(reminder, `${this.label}.reminder`);
  }

  get allErrors(): string[] {
    return [
      ...this.errors,
      ...this.logs.flatMap((log) => log.allErrors),
      ...this.notes.flatMap((note) => note.allErrors),
      ...(this.reminder?.allErrors ?? []),
    ];
  }

  toRow(): ExportedTask {
    const { name, color, category } = this;
    return {
      name,
      color,
      category,
      ...this.audit,
      logs: this.logs.map((log) => log.toRow()),
      notes: this.notes.map((note) => note.toRow()),
      reminder: this.reminder?.toRow() ?? null,
    };
  }
}

export class ImportedData {
  readonly fileErrors: string[] = [];
  readonly categories: ImportedCategory[] = [];
  readonly tasks: ImportedTask[] = [];

  static fromJson(json: string): ImportedData {
    let value: unknown;
    try {
      value = JSON.parse(json);
    } catch {
      return new ImportedData(undefined, 'File is not valid JSON');
    }
    return new ImportedData(value);
  }

  private constructor(value: unknown, parseError?: string) {
    if (parseError) {
      this.fileErrors.push(parseError);
      return;
    }
    if (!isObject(value)) {
      this.fileErrors.push('File is not a dripp export');
      return;
    }

    this.categories = this.readList(value, 'categories', (v, i) => new ImportedCategory(v, i));
    this.tasks = this.readList(value, 'tasks', (v, i) => new ImportedTask(v, i));

    this.checkCategoryNames();
  }

  private readList<T>(file: RawRow, field: string, create: (v: unknown, i: number) => T): T[] {
    const value = file[field];
    if (Array.isArray(value)) return value.map(create);
    this.fileErrors.push(`"${field}" must be a list`);
    return [];
  }

  private checkCategoryNames() {
    const names = new Set(this.categories.map((c) => c.name.toLowerCase()));
    for (const task of this.tasks) {
      if (
        task.category != null &&
        task.category !== '' &&
        !names.has(task.category.toLowerCase())
      ) {
        this.fileErrors.push(
          `${task.label} is in category "${task.category}", which isn't in the file`,
        );
      }
    }
  }

  get errors(): string[] {
    return [
      ...this.fileErrors,
      ...[...this.categories, ...this.tasks].flatMap((row) => row.allErrors),
    ];
  }

  get isValid(): boolean {
    return this.errors.length === 0;
  }

  toAppData(): AppData {
    if (!this.isValid) throw new Error('Import file has errors and cannot be imported');
    return {
      categories: this.categories.map((c) => c.toRow()),
      tasks: this.tasks.map((t) => t.toRow()),
    };
  }
}
