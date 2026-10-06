CREATE TABLE `task_notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`task_id` integer NOT NULL,
	`date` text NOT NULL,
	`note` text NOT NULL,
	CONSTRAINT `fk_task_notes_task_id_tasks_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`),
	CONSTRAINT `task_notes_task_id_date_unique` UNIQUE(`task_id`,`date`)
);
