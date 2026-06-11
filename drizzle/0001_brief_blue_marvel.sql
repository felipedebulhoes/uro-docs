CREATE TABLE `prescription_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`localId` varchar(64) NOT NULL,
	`procedureId` varchar(128) NOT NULL,
	`name` text NOT NULL,
	`content` text NOT NULL,
	`favorite` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `prescription_templates_id` PRIMARY KEY(`id`)
);
