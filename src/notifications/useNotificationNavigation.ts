import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { router } from 'expo-router';

export function useNotificationNavigation(ready: boolean) {
  const response = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (!ready || !response) return;
    if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;

    const taskId = response.notification.request.content.data?.taskId;
    if (typeof taskId !== 'number') return;

    router.push({ pathname: '/task-detail', params: { taskId: String(taskId) } });
    Notifications.clearLastNotificationResponse();
  }, [ready, response]);
}
