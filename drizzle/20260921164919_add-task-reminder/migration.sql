CREATE TABLE `reminders` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`task_id` integer NOT NULL,
	`time` text NOT NULL,
	`type` text NOT NULL,
	`interval` integer NOT NULL,
	`dayOfWeek` integer,
	`dayOfMonth` integer,
	CONSTRAINT `fk_reminders_task_id_tasks_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `remindersTaskIdUniqueIndex` ON `reminders` (`task_id`);