ALTER TABLE `dj_timers` ADD `followUpStatus` varchar(32) DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `dj_timers` ADD `contactedAt` varchar(40);--> statement-breakpoint
ALTER TABLE `dj_timers` ADD `removalConfirmedAt` varchar(40);