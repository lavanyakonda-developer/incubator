CREATE SCHEMA `incubator_saas` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `startups` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`name` VARCHAR(255) NOT NULL,
	`dpiit_number` VARCHAR(255) NOT NULL,
	`industry` VARCHAR(255) NOT NULL,
	`referral_code` VARCHAR(255) NOT NULL,
    `status` VARCHAR(255) NOT NULL DEFAULT 'PENDING',
	`reject_message` VARCHAR(255) NOT NULL DEFAULT ''
);

CREATE TABLE `incubators` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`name` VARCHAR(255) NOT NULL,
	`logo` VARCHAR(255) NOT NULL
);

CREATE TABLE `incubator_founders` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`email` VARCHAR(255) NOT NULL,
	`password` VARCHAR(255) NOT NULL,
	`phone_number` VARCHAR(255) NOT NULL,
	`role` VARCHAR(255) NOT NULL,
	`incubator_id` INT UNSIGNED NOT NULL,
	`name` VARCHAR(255) NOT NULL,
	FOREIGN KEY (`incubator_id`) REFERENCES `incubators` (`id`)
);

CREATE TABLE `startup_founders` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`email` VARCHAR(255) NOT NULL,
	`password` VARCHAR(255) NOT NULL,
	`phone_number` VARCHAR(255) NOT NULL,
	`role` VARCHAR(255) NOT NULL,
	`designation` VARCHAR(255) NOT NULL,
	`startup_id` INT UNSIGNED NOT NULL,
	`name` VARCHAR(255) NOT NULL,
	FOREIGN KEY (`startup_id`) REFERENCES `startups` (`id`)
);

CREATE TABLE `incubator_startup` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `incubator_id` INT UNSIGNED NOT NULL,
    `startup_id` INT UNSIGNED NOT NULL,
    `is_draft` BOOLEAN NOT NULL,
    FOREIGN KEY (`incubator_id`) REFERENCES `incubators`(`id`),
    FOREIGN KEY (`startup_id`) REFERENCES `startups`(`id`)
);

CREATE TABLE `questionnaire` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`startup_id` INT UNSIGNED NOT NULL,
	`question` VARCHAR(255) NOT NULL,
	`answer` VARCHAR(255) NOT NULL,
	`question_uid` VARCHAR(255) NOT NULL,
	`meta_data` VARCHAR(255) NOT NULL,
	`answer_type` VARCHAR(255) NOT NULL
);

CREATE TABLE `startup_documents` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `startup_id` INT UNSIGNED NOT NULL,
  `document_name` VARCHAR(255) NOT NULL,
  `document_size` VARCHAR(255) NOT NULL DEFAULT '',
  `document_format` VARCHAR(255) NOT NULL,
  `is_signature_required` BOOLEAN NOT NULL,
  `is_requested` BOOLEAN NOT NULL,
  `document_url` VARCHAR(255) NOT NULL,
  `is_deleted` BOOLEAN NOT NULL,
  `is_approved` BOOLEAN NOT NULL,
  FOREIGN KEY (`startup_id`) REFERENCES `startups` (`id`)
);