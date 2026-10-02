import {
  requestWidgetUpdate,
  type WidgetInfo,
  type WidgetTaskHandlerProps,
} from 'react-native-android-widget';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { runMigrations } from '../../db/client';
import { loadCategories, loadTaskLogsForDay, loadTasks, toggleTaskLog } from '../../db/queries';
import {
  QUICK_LOG_WIDGET_NAME,
  QuickLogWidget,
  type QuickLogWidgetData,
  SELECT_CATEGORY_ACTION,
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
  const { widgetId } = widgetInfo;

  switch (widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
      renderWidget(<QuickLogWidget data={await loadData(widgetInfo)} />);
      break;

    case 'WIDGET_CLICK':
      try {
        await handleClick(widgetId, clickAction, clickActionData);
      } catch (e) {
        console.error('[QuickLogWidget] click failed', e);
      }
      renderWidget(<QuickLogWidget data={await loadData(widgetInfo)} />);
      break;

    case 'WIDGET_DELETED':
      await deleteWidgetState(widgetId);
      break;
  }
}

async function handleClick(
  widgetId: number,
  clickAction: string | undefined,
  data: Record<string, unknown> | undefined,
) {
  switch (clickAction) {
    case TOGGLE_TASK_ACTION:
      if (typeof data?.taskId === 'number') {
        await toggleTaskLog(data.taskId, today());
      }
      break;

    case SELECT_CATEGORY_ACTION: {
      const categoryId = typeof data?.categoryId === 'number' ? data.categoryId : null;
      await saveWidgetState(widgetId, { categoryId });
      break;
    }
  }
}

function today(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

async function loadData(widgetInfo: WidgetInfo): Promise<QuickLogWidgetData> {
  await runMigrations();
  const date = today();
  const [categories, tasks, logs] = await Promise.all([
    loadCategories(),
    loadTasks(),
    loadTaskLogsForDay(date),
  ]);

  const state = await loadWidgetState(widgetInfo.widgetId);
  const categoryId = categories.some((c) => c.id === state.categoryId) ? state.categoryId : null;

  return {
    date,
    categories,
    selectedCategoryId: categoryId,
    tasks: categoryId === null ? tasks : tasks.filter((task) => task.categoryId === categoryId),
    loggedTaskIds: new Set(logs.map((log) => log.task_id)),
  };
}

export function refreshQuickLogWidget() {
  return requestWidgetUpdate({
    widgetName: QUICK_LOG_WIDGET_NAME,
    renderWidget: async (widgetInfo) => <QuickLogWidget data={await loadData(widgetInfo)} />,
  });
}

type QuickLogWidgetState = {
  categoryId: number | null;
};

const DEFAULT_STATE: QuickLogWidgetState = { categoryId: null };

function stateKey(widgetId: number): string {
  return `quick-log-widget-${widgetId}`;
}

async function loadWidgetState(widgetId: number): Promise<QuickLogWidgetState> {
  try {
    const stored = await AsyncStorage.getItem(stateKey(widgetId));
    return stored ? { ...DEFAULT_STATE, ...JSON.parse(stored) } : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

async function saveWidgetState(widgetId: number, state: QuickLogWidgetState) {
  await AsyncStorage.setItem(stateKey(widgetId), JSON.stringify(state));
}

async function deleteWidgetState(widgetId: number) {
  await AsyncStorage.removeItem(stateKey(widgetId));
}
