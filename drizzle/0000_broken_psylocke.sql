CREATE TABLE `dj_timers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`localId` varchar(64) NOT NULL,
	`patientName` text,
	`insertionDate` varchar(32),
	`removalDate` varchar(32),
	`lateralidade` varchar(32),
	`procedureId` varchar(128),
	`completed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dj_timers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hospital_presets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`localId` varchar(64) NOT NULL,
	`name` text NOT NULL,
	`defaults` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hospital_presets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `surgery_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`localId` varchar(64) NOT NULL,
	`procedureId` varchar(128) NOT NULL,
	`procedureName` text,
	`patientName` text,
	`surgeryDate` varchar(32),
	`config` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `surgery_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`procedureId` varchar(128) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_favorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
