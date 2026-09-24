ALTER TABLE `categories` ADD `created_at` text NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE `categories` ADD `updated_at` text NOT NULL DEFAULT '';--> statement-breakpoint
UPDATE `categories` SET `created_at` = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), `updated_at` = strftime('%Y-%m-%dT%H:%M:%fZ', 'now');--> statement-breakpoint
ALTER TABLE `reminders` ADD `created_at` text NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE `reminders` ADD `updated_at` text NOT NULL DEFAULT '';--> statement-breakpoint
UPDATE `reminders` SET `created_at` = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), `updated_at` = strftime('%Y-%m-%dT%H:%M:%fZ', 'now');--> statement-breakpoint
ALTER TABLE `task_log` ADD `created_at` text NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE `task_log` ADD `updated_at` text NOT NULL DEFAULT '';--> statement-breakpoint
UPDATE `task_log` SET `created_at` = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), `updated_at` = strftime('%Y-%m-%dT%H:%M:%fZ', 'now');--> statement-breakpoint
ALTER TABLE `tasks` ADD `created_at` text NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE `tasks` ADD `updated_at` text NOT NULL DEFAULT '';--> statement-breakpoint
UPDATE `tasks` SET `created_at` = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), `updated_at` = strftime('%Y-%m-%dT%H:%M:%fZ', 'now');