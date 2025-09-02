CREATE TABLE `active_listening_flow` (
	`id` text PRIMARY KEY NOT NULL,
	`query_id` text NOT NULL,
	`turn_number` integer NOT NULL,
	`speaker` text NOT NULL,
	`message_type` text NOT NULL,
	`content` text NOT NULL,
	`emotional_tone` text,
	`cultural_cues` text,
	`follow_up_reason` text,
	`user_reaction` text,
	`processing_time_ms` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`query_id`) REFERENCES `user_queries`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `ai_analysis_results` (
	`id` text PRIMARY KEY NOT NULL,
	`query_id` text NOT NULL,
	`ai_model` text DEFAULT '@cf/meta/llama-3.1-8b-instruct' NOT NULL,
	`analysis_data` text NOT NULL,
	`active_listening_insights` text,
	`emotional_intelligence_score` real,
	`cultural_sensitivity_score` real,
	`conversation_quality_score` real,
	`confidence_score` real,
	`processing_time_ms` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`query_id`) REFERENCES `user_queries`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `conversation_metrics` (
	`id` text PRIMARY KEY NOT NULL,
	`query_id` text NOT NULL,
	`total_turns` integer DEFAULT 0 NOT NULL,
	`user_engagement_score` real,
	`cultural_elements_discovered` integer DEFAULT 0,
	`emotional_depth_achieved` real,
	`completion_status` text,
	`user_satisfaction_score` real,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`query_id`) REFERENCES `user_queries`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_queries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`query_text` text NOT NULL,
	`query_type` text DEFAULT 'memory_analysis' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`conversation_stage` integer DEFAULT 0,
	`emotional_context` text,
	`cultural_insights` text,
	`personal_details` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
