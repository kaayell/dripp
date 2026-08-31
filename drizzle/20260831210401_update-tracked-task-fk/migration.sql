PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_tracked_task` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`task_id` integer NOT NULL,
	`date` text NOT NULL,
	CONSTRAINT `fk_tracked_task_task_id_tasks_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_tracked_task`(`id`, `task_id`, `date`) SELECT `id`, `task_id`, `date` FROM `tracked_task`;--> statement-breakpoint
DROP TABLE `tracked_task`;--> statement-breakpoint
ALTER TABLE `__new_tracked_task` RENAME TO `tracked_task`;--> statement-breakpoint
PRAGMA foreign_keys=ON;