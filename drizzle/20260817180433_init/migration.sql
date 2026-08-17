CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`category_id` integer,
	CONSTRAINT `fk_tasks_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`)
);
--> statement-breakpoint
CREATE TABLE `tracked_task` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`task_id` integer,
	`date` text NOT NULL,
	CONSTRAINT `fk_tracked_task_task_id_tasks_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`)
);
