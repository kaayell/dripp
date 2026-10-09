import { requestWidgetUpdate, type WidgetTaskHandlerProps } from 'react-native-android-widget';
import { todayString } from '@/constants/dates';
import { runMigrations } from '../../db/client';
import { loadTaskLogsForDay, loadTasksWithCategory, toggleTaskLog } from '../../db/queries';
import {
  QUICK_LOG_WIDGET_NAME,
  QuickLogWidget,
  type QuickLogWidgetData,
  TOGGLE_TASK_ACTION,
} from './QuickLogWidget';

export async function widgetTaskHandler({
  widgetInfo,
  widgetAction,
  clickAction,
  clickActionData,
  renderWidget,
}: WidgetTaskHandlerProps) {
  if (widgetInfo.widgetName !== QUICK_LOG_WIDGET_NAME) return;

  switch (widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
      renderWidget(<QuickLogWidget data={await loadData()} />);
      break;

    case 'WIDGET_CLICK':
      try {
        await handleClick(clickAction, clickActionData);
      } catch (e) {
        console.error('[QuickLogWidget] click failed', e);
      }
      renderWidget(<QuickLogWidget data={await loadData()} />);
      break;
  }
}

async function handleClick(
  clickAction: string | undefined,
  data: Record<string, unknown> | undefined,
) {
  switch (clickAction) {
    case TOGGLE_TASK_ACTION:
      if (typeof data?.taskId === 'number') {
        await toggleTaskLog(data.taskId, todayString());
      }
      break;
  }
}

async function loadData(): Promise<QuickLogWidgetData> {
  await runMigrations();
  const date = todayString();
  const [tasks, logs] = await Promise.all([loadTasksWithCategory(), loadTaskLogsForDay(date)]);

  return {
    date,
    tasks,
    loggedTaskIds: new Set(logs.map((log) => log.task_id)),
  };
}

export function refreshQuickLogWidget() {
  return requestWidgetUpdate({
    widgetName: QUICK_LOG_WIDGET_NAME,
    renderWidget: async () => <QuickLogWidget data={await loadData()} />,
  });
}
