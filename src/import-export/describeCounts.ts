import type { AppData } from '../../db/queries.ts';

export function describeCounts(data: AppData): string {
  return [
    `${data.tasks.length} tasks`,
    `${data.categories.length} categories`,
    `${data.tasks.reduce((count, task) => count + task.logs.length, 0)} logs`,
    `${data.tasks.reduce((count, task) => count + (task.notes?.length ?? 0), 0)} notes`,
    `${data.tasks.filter((task) => task.reminder).length} reminders`,
  ].join(', ');
}
