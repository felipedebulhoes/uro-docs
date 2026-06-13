CREATE TABLE `atlas_figure_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`atlasId` varchar(128) NOT NULL,
	`figureIndex` int NOT NULL,
	`storageKey` text NOT NULL,
	`url` text NOT NULL,
	`credit` text NOT NULL,
	`sourceUrl` text,
	`mimeType` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `atlas_figure_images_id` PRIMARY KEY(`id`)
);
