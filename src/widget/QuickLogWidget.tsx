import { FlexWidget, type HexColor, ListWidget, TextWidget } from 'react-native-android-widget';
import { parseISO } from 'date-fns';
import { Colors, dimmed } from '@/constants/theme';
import { formatShortDate } from '@/constants/dates';
import type { Task, TaskWithCategory } from '../../db/queries';

const WidgetFont = {
  sans: {
    '400': 'Geist-Regular',
    '500': 'Geist-Medium',
    '600': 'Geist-SemiBold',
    '700': 'Geist-Bold',
  },
  mono: {
    '400': 'GeistMono-Regular',
    '500': 'GeistMono-Medium',
    '600': 'GeistMono-SemiBold',
    '700': 'GeistMono-Bold',
  },
} as const;

export const QUICK_LOG_WIDGET_NAME = 'QuickLog';
export const TOGGLE_TASK_ACTION = 'TOGGLE_TASK';

export type QuickLogWidgetData = {
  date: string;
  tasks: TaskWithCategory[];
  loggedTaskIds: Set<number>;
};

export function QuickLogWidget({ data }: { data: QuickLogWidgetData }) {
  const { date, tasks, loggedTaskIds } = data;

  const tasksByCategory = tasks.reduce((acc, task) => {
    const key = task.category?.name ?? 'uncategorized';
    const group = acc.get(key);
    if (group) group.push(task);
    else acc.set(key, [task]);
    return acc;
  }, new Map<string, TaskWithCategory[]>());

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
        }}
      >
        <TextWidget
          text="Today"
          style={{
            fontSize: 15,
            fontWeight: '700',
            fontFamily: WidgetFont.sans['700'],
            color: Colors.text,
            letterSpacing: 0.25,
          }}
        />
        <TextWidget
          text={formatShortDate(parseISO(date))}
          style={{
            fontSize: 11,
            fontWeight: '500',
            fontFamily: WidgetFont.mono['500'],
            color: Colors.label,
          }}
        />
      </FlexWidget>

      {tasks.length === 0 ? (
        <TextWidget
          text="No tasks here yet."
          clickAction="OPEN_APP"
          style={{
            fontSize: 14,
            fontFamily: WidgetFont.sans['400'],
            color: Colors.label,
            paddingHorizontal: 6,
          }}
        />
      ) : (
        <ListWidget style={{ height: 'match_parent', width: 'match_parent' }}>
          {[...tasksByCategory].flatMap(([categoryName, tasks]) => [
            <CategoryLabel key={`category-${categoryName}`} name={categoryName} />,
            tasks.map((task) => (
              <TaskChip key={task.id} task={task} checked={loggedTaskIds.has(task.id)} />
            )),
          ])}
        </ListWidget>
      )}
    </FlexWidget>
  );
}

function CategoryLabel({ name }: { name: string }) {
  return (
    <FlexWidget
      style={{ width: 'match_parent', paddingTop: 6, paddingBottom: 4, paddingHorizontal: 4 }}
    >
      <TextWidget
        text={name.toUpperCase()}
        maxLines={1}
        truncate="END"
        style={{
          fontSize: 11,
          fontWeight: '700',
          fontFamily: WidgetFont.mono['700'],
          color: Colors.label,
          letterSpacing: 0.25,
        }}
      />
    </FlexWidget>
  );
}

function WidgetDrop({ color, size }: { color: HexColor; size: number }) {
  return (
    <FlexWidget
      style={{
        width: size,
        height: size,
        borderTopLeftRadius: size / 2,
        borderTopRightRadius: size / 2,
        borderBottomRightRadius: size / 2,
        borderBottomLeftRadius: 0,
        rotation: 135,
        backgroundColor: color,
        marginRight: 8,
      }}
    />
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
          backgroundColor: dimmed(color, checked ? 30 : 5) as HexColor,
          borderColor: dimmed(color, checked ? 40 : 10) as HexColor,
          borderWidth: 1,
          borderRadius: 999,
          paddingVertical: 7,
          paddingHorizontal: 12,
        }}
      >
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <WidgetDrop color={color} size={8} />
          <TextWidget
            text={task.name}
            maxLines={1}
            truncate="END"
            style={{
              fontSize: 14,
              fontWeight: checked ? '700' : '500',
              fontFamily: WidgetFont.sans[checked ? '700' : '500'],
              color: checked ? Colors.text : (dimmed(Colors.text, 50) as HexColor),
            }}
          />
        </FlexWidget>
        {checked && (
          <TextWidget
            text="✓"
            style={{
              fontSize: 13,
              fontWeight: '600',
              fontFamily: WidgetFont.sans['600'],
              color: Colors.text,
            }}
          />
        )}
      </FlexWidget>
    </FlexWidget>
  );
}
