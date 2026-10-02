import * as Notifications from 'expo-notifications';
import { createTaskLog } from '../../db/queries';
import { todayString } from '@/constants/dates';
import { TASK_COMPLETED_ACTION, TASK_REMINDER_CATEGORY } from '@/constants/notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    };
  },
});

Notifications.setNotificationCategoryAsync(TASK_REMINDER_CATEGORY, [
  {
    identifier: TASK_COMPLETED_ACTION,
    buttonTitle: 'Mark Completed',
    options: {
      opensAppToForeground: false,
    },
  },
]);

Notifications.addNotificationResponseReceivedListener(async (response) => {
  const data = response.notification.request.content.data;
  const taskId = data?.taskId;
  if (typeof taskId !== 'number') return;

  if (response.actionIdentifier === TASK_COMPLETED_ACTION) {
    await Notifications.dismissNotificationAsync(response.notification.request.identifier);
    try {
      await createTaskLog(taskId, todayString());
    } catch {
      // already marked complete today
    }
  }
});
