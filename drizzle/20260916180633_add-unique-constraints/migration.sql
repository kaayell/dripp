PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_task_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`task_id` integer NOT NULL,
	`date` text NOT NULL,
	CONSTRAINT `fk_tracked_task_task_id_tasks_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`),
	CONSTRAINT `task_log_task_id_date_unique` UNIQUE(`task_id`,`date`)
);
--> statement-breakpoint
INSERT INTO `__new_task_log`(`id`, `task_id`, `date`) SELECT `id`, `task_id`, `date` FROM `task_log`;--> statement-breakpoint
DROP TABLE `task_log`;--> statement-breakpoint
ALTER TABLE `__new_task_log` RENAME TO `task_log`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `categoriesNameUniqueIndex` ON `categories` (lower("name"));--> statement-breakpoint
CREATE UNIQUE INDEX `tasksNameUniqueIndex` ON `tasks` (lower("name"));