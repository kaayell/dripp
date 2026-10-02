import { FlexWidget, ListWidget, TextWidget, type HexColor } from 'react-native-android-widget';
import { parseISO } from 'date-fns';
import { Colors } from '@/constants/theme';
import { formatShortDate } from '@/constants/dates';
import type { Category, Task } from '../../db/queries';

export const QUICK_LOG_WIDGET_NAME = 'QuickLog';
export const TOGGLE_TASK_ACTION = 'TOGGLE_TASK';
export const SELECT_CATEGORY_ACTION = 'SELECT_CATEGORY';

export type QuickLogWidgetData = {
  date: string;
  categories: Category[];
  selectedCategoryId: number | null;
  tasks: Task[];
  loggedTaskIds: Set<number>;
};

export function QuickLogWidget({ data }: { data: QuickLogWidgetData }) {
  const { date, categories, selectedCategoryId, tasks, loggedTaskIds } = data;
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: Colors.background,
        padding: 12,
      }}
    >
      <FlexWidget
        clickAction="OPEN_APP"
        style={{
          width: 'match_parent',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 4,
          paddingBottom: 6,
          borderBottomColor: Colors.border,
          borderBottomWidth: 1,
        }}
      >
        <TextWidget text="Today" style={{ fontSize: 16, fontWeight: '700', color: Colors.text }} />
        <TextWidget
          text={formatShortDate(parseISO(date))}
          style={{ fontSize: 13, fontWeight: '500', color: Colors.label }}
        />
      </FlexWidget>

      <FlexWidget
        style={{
          width: 'match_parent',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 8,
        }}
      >
        <FlexWidget style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          {categories.map((category) => (
            <CategoryChip
              key={category.id}
              label={category.name}
              categoryId={category.id}
              selected={selectedCategoryId === category.id}
            />
          ))}
        </FlexWidget>
      </FlexWidget>

      {tasks.length === 0 ? (
        <TextWidget
          text="No tasks here yet."
          clickAction="OPEN_APP"
          style={{ fontSize: 13, color: Colors.label, paddingHorizontal: 6 }}
        />
      ) : (
        <ListWidget style={{ height: 'match_parent', width: 'match_parent' }}>
          {tasks.map((task) => (
            <TaskChip key={task.id} task={task} checked={loggedTaskIds.has(task.id)} />
          ))}
        </ListWidget>
      )}
    </FlexWidget>
  );
}

function CategoryChip({
  label,
  categoryId,
  selected,
}: {
  label: string;
  categoryId: number | null;
  selected: boolean;
}) {
  return (
    <FlexWidget
      clickAction={SELECT_CATEGORY_ACTION}
      clickActionData={{ categoryId: selected ? null : categoryId }}
      accessibilityLabel={`Show ${label} tasks`}
      style={{
        height: 24,
        justifyContent: 'center',
        paddingHorizontal: 10,
        marginRight: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: selected ? Colors.text : Colors.border,
        backgroundColor: selected ? Colors.text : Colors.cellBg,
      }}
    >
      <TextWidget
        text={label}
        maxLines={1}
        style={{
          fontSize: 12,
          fontWeight: selected ? '700' : '500',
          color: selected ? Colors.background : Colors.label,
        }}
      />
    </FlexWidget>
  );
}

function TaskChip({ task, checked }: { task: Task; checked: boolean }) {
  const color = task.color as HexColor;
  return (
    <FlexWidget style={{ width: 'match_parent', paddingBottom: 6 }}>
      <FlexWidget
        clickAction={TOGGLE_TASK_ACTION}
        clickActionData={{ taskId: task.id }}
        accessibilityLabel={`${checked ? 'Unlog' : 'Log'} ${task.name} for today`}
        style={{
          width: 'match_parent',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: checked ? Colors.border : Colors.background,
          borderColor: Colors.border,
          borderWidth: 1,
          borderRadius: 16,
          paddingVertical: 6,
          paddingHorizontal: 8,
        }}
      >
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <FlexWidget
            style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, marginRight: 8 }}
          />
          <TextWidget
            text={task.name}
            maxLines={1}
            truncate="END"
            style={{
              fontSize: 13,
              fontWeight: checked ? '700' : '500',
              color: checked ? Colors.text : Colors.label,
            }}
          />
        </FlexWidget>
        {checked && <TextWidget text="✓" style={{ fontSize: 13, fontWeight: '700', color }} />}
      </FlexWidget>
    </FlexWidget>
  );
}
