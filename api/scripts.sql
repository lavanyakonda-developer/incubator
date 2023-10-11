CREATE SCHEMA `incubator_saas` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `startups` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`name` VARCHAR(255) NOT NULL,
	`dpiit_number` VARCHAR(255) NOT NULL,
	`industry` VARCHAR(255) NOT NULL,
	`referral_code` VARCHAR(255) NOT NULL,
    `status` VARCHAR(255) NOT NULL DEFAULT 'PENDING',
	`reject_message` VARCHAR(255) NOT NULL DEFAULT '',
	`logo` VARCHAR(255),
	`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
	`answer` TEXT,
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
  `is_onboarding` BOOLEAN NOT NULL,
  FOREIGN KEY (`startup_id`) REFERENCES `startups` (`id`)
);


-- For Business updates tabs in startup end

CREATE TABLE `time_periods` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`quarter` VARCHAR(255) NOT NULL,
	`year` INT NOT NULL,
	`months` TEXT NOT NULL)


		
CREATE TABLE `business_updates_answers` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`startup_id` INT UNSIGNED NOT NULL,
	`time_period` INT UNSIGNED NOT NULL,
	`uid` TEXT NOT NULL,
	`answer` TEXT NOT NULL,
	FOREIGN KEY (`startup_id`) REFERENCES `startups` (`id`), 
	FOREIGN KEY (`time_period`) REFERENCES `time_periods` (`id`))


CREATE TABLE `months` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`month` TEXT NOT NULL
)

CREATE TABLE `metric_values` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`startup_id` INT UNSIGNED NOT NULL,
	`time_period` INT UNSIGNED NOT NULL,
	`month_id` INT UNSIGNED NOT NULL,
	`value` TEXT NOT NULL,
	`metric_uid` VARCHAR(255) NOT NULL,
	FOREIGN KEY (`startup_id`) REFERENCES `startups` (`id`), 
	FOREIGN KEY (`time_period`) REFERENCES `time_periods` (`id`)
	FOREIGN KEY (`month_id`) REFERENCES `months` (`id`))


CREATE TABLE `mandatory_info_exchange` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`startup_id` INT UNSIGNED NOT NULL,
	`mie` TEXT NOT NULL,
	FOREIGN KEY (`startup_id`) REFERENCES `startups` (`id`))



---Months
INSERT INTO months (month)
		VALUES('January');
INSERT INTO months (month)
		VALUES('February');
INSERT INTO months (month)
		VALUES('March');
INSERT INTO months (month)
		VALUES('April');
INSERT INTO months (month)
		VALUES('May');
INSERT INTO months (month)
		VALUES('June');
INSERT INTO months (month)
		VALUES('July');
INSERT INTO months (month)
		VALUES('August');
INSERT INTO months (month)
		VALUES('September');
INSERT INTO months (month)
		VALUES('October');
INSERT INTO months (month)
		VALUES('November');
INSERT INTO months (month)
		VALUES('December');


-- Time periods dummy ones
INSERT INTO time_periods (quarter, year, months)
		VALUES('Q1 (Jan - Mar)', 2023, '[1, 2, 3]');
INSERT INTO time_periods (quarter, year, months)
		VALUES('Q2 (Apr - June)', 2023, '[4, 5, 6]');
INSERT INTO time_periods (quarter, year, months)
		VALUES('Q3 (July - Sept)', 2023, '[7, 8, 9]');
INSERT INTO time_periods (quarter, year, months)
		VALUES('Q4 (Oct - Dec)', 2023, '[10, 11, 12]');

-- For 2022
INSERT INTO `time_periods` (`quarter`, `year`, `months`)
VALUES
  ('Q4 (Jan - Mar)', 2022, '[1, 2, 3]'),
  ('Q1 (Apr - June)', 2022, '[4, 5, 6]'),
  ('Q2 (July - Sept)', 2022, '[7, 8, 9]'),
  ('Q3 (Oct - Dec)', 2022, '[10, 11, 12]');

-- For 2021
INSERT INTO `time_periods` (`quarter`, `year`, `months`)
VALUES
  ('Q4 (Jan - Mar)', 2021, '[1, 2, 3]'),
  ('Q1 (Apr - June)', 2021, '[4, 5, 6]'),
  ('Q2 (July - Sept)', 2021, '[7, 8, 9]'),
  ('Q3 (Oct - Dec)', 2021, '[10, 11, 12]');



-- 	{
--     "email" : "lavanya@yopmail.com",
--     "name" : "Lavanya",
--     "password" : "Apple@123",
--     "phone_number" :"9121910427",
--     "incubator_name" :"Saas Test",
--     "incubator_logo":"https://png.pngtree.com/png-clipart/20200701/original/pngtree-charminar-illustration-of-historical-monument-hyderabad-vector-png-image_5355377.jpg"
-- }