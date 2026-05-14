CREATE TABLE `metric_buckets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`guild_id` text NOT NULL,
	`metric_name` text NOT NULL,
	`bucket_start` text NOT NULL,
	`bucket_granularity` text DEFAULT 'hour' NOT NULL,
	`value` integer DEFAULT 0 NOT NULL,
	`channel_id` text,
	`user_id` text,
	`emoji_id` text,
	`emoji_name` text
);
