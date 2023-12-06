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
  `status` VARCHAR(255) NOT NULL,
  FOREIGN KEY (`startup_id`) REFERENCES `startups` (`id`)
);


-- For Business updates tabs in startup end

CREATE TABLE `time_periods` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`quarter` VARCHAR(255) NOT NULL,
	`fyear` INT NOT NULL,
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
INSERT INTO time_periods (quarter, fyear, months)
		VALUES('Q1 (Jan - Mar)', 2023, '[1, 2, 3]');
INSERT INTO time_periods (quarter, fyear, months)
		VALUES('Q2 (Apr - June)', 2023, '[4, 5, 6]');
INSERT INTO time_periods (quarter, fyear, months)
		VALUES('Q3 (July - Sept)', 2023, '[7, 8, 9]');
INSERT INTO time_periods (quarter, fyear, months)
		VALUES('Q4 (Oct - Dec)', 2023, '[10, 11, 12]');

-- For 2022
INSERT INTO `time_periods` (`quarter`, `fyear`, `months`)
VALUES
  ('Q4 (Jan - Mar)', 2022, '[1, 2, 3]'),
  ('Q1 (Apr - June)', 2022, '[4, 5, 6]'),
  ('Q2 (July - Sept)', 2022, '[7, 8, 9]'),
  ('Q3 (Oct - Dec)', 2022, '[10, 11, 12]');

-- For 2021
INSERT INTO `time_periods` (`quarter`, `fyear`, `months`)
VALUES
  ('Q4 (Jan - Mar)', 2021, '[1, 2, 3]'),
  ('Q1 (Apr - June)', 2021, '[4, 5, 6]'),
  ('Q2 (July - Sept)', 2021, '[7, 8, 9]'),
  ('Q3 (Oct - Dec)', 2021, '[10, 11, 12]');


-- This is for the Logs TABLE
CREATE TABLE `metric_value_changes` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`metric_value_id` INT UNSIGNED NOT NULL,
	`old_value` TEXT NOT NULL,
	`new_value` TEXT NOT NULL,
	`change_date` DATETIME NOT NULL,
	`changed_by` VARCHAR(255) NOT NULL,
	FOREIGN KEY (`metric_value_id`) REFERENCES `metric_values` (`id`)
);



-- Metric Values for Time Period 1 (Q4 2023)
-- Metric values for startup 14, time_period 1 (Q4 2023), month_id 1 (January)
INSERT INTO metric_values (startup_id, time_period, month_id, value, metric_uid)
VALUES (14, 1, 1, 0.2, 'metric1'),
       (14, 1, 1, 800, 'metric2'),
       (14, 1, 1, 4.3, 'metric3'),
       (14, 1, 1, 16000, 'metric4');

-- Metric values for startup 14, time_period 1 (Q4 2023), month_id 2 (February)
INSERT INTO metric_values (startup_id, time_period, month_id, value, metric_uid)
VALUES (14, 1, 2, 0.18, 'metric1'),
       (14, 1, 2, 900, 'metric2'),
       (14, 1, 2, 4.7, 'metric3'),
       (14, 1, 2, 15500, 'metric4');

-- Metric values for startup 14, time_period 1 (Q4 2023), month_id 3 (March)
INSERT INTO metric_values (startup_id, time_period, month_id, value, metric_uid)
VALUES (14, 1, 3, 0.15, 'metric1'),
       (14, 1, 3, 950, 'metric2'),
       (14, 1, 3, 4.9, 'metric3'),
       (14, 1, 3, 16000, 'metric4');

-- Repeat the above inserts for other time_period IDs (2, 3, 4, 5, 6, 7, 8, 12) with appropriate values.
-- Remember to change the time_period value in the INSERT statements accordingly.


-- Metric Values for Time Period 2 (Q1 2023)
-- Metric values for startup 14, time_period 2 (Q1 2023), month_id 4 (April)
INSERT INTO metric_values (startup_id, time_period, month_id, value, metric_uid)
VALUES (14, 2, 4, 0.22, 'metric1'),
       (14, 2, 4, 850, 'metric2'),
       (14, 2, 4, 4.5, 'metric3'),
       (14, 2, 4, 16500, 'metric4');

-- Metric values for startup 14, time_period 2 (Q1 2023), month_id 5 (May)
INSERT INTO metric_values (startup_id, time_period, month_id, value, metric_uid)
VALUES (14, 2, 5, 0.25, 'metric1'),
       (14, 2, 5, 900, 'metric2'),
       (14, 2, 5, 4.8, 'metric3'),
       (14, 2, 5, 17000, 'metric4');

-- Metric values for startup 14, time_period 2 (Q1 2023), month_id 6 (June)
INSERT INTO metric_values (startup_id, time_period, month_id, value, metric_uid)
VALUES (14, 2, 6, 0.28, 'metric1'),
       (14, 2, 6, 950, 'metric2'),
       (14, 2, 6, 5.0, 'metric3'),
       (14, 2, 6, 17500, 'metric4');

-- Metric Values for Time Period 3 (Q2 2023)
-- Metric values for startup 14, time_period 3 (Q2 2023), month_id 7 (July)
INSERT INTO metric_values (startup_id, time_period, month_id, value, metric_uid)
VALUES (14, 3, 7, 0.18, 'metric1'),
       (14, 3, 7, 880, 'metric2'),
       (14, 3, 7, 4.2, 'metric3'),
       (14, 3, 7, 16000, 'metric4');

-- Metric values for startup 14, time_period 3 (Q2 2023), month_id 8 (August)
INSERT INTO metric_values (startup_id, time_period, month_id, value, metric_uid)
VALUES (14, 3, 8, 0.20, 'metric1'),
       (14, 3, 8, 910, 'metric2'),
       (14, 3, 8, 4.4, 'metric3'),
       (14, 3, 8, 16500, 'metric4');

-- Metric values for startup 14, time_period 3 (Q2 2023), month_id 9 (September)
INSERT INTO metric_values (startup_id, time_period, month_id, value, metric_uid)
VALUES (14, 3, 9, 0.23, 'metric1'),
       (14, 3, 9, 930, 'metric2'),
       (14, 3, 9, 4.6, 'metric3'),
       (14, 3, 9, 17000, 'metric4');

-- Metric Values for Time Period 4 (Q3 2023)
-- Metric values for startup 14, time_period 4 (Q3 2023), month_id 10 (October)
INSERT INTO metric_values (startup_id, time_period, month_id, value, metric_uid)
VALUES (14, 4, 10, 0.27, 'metric1'),
       (14, 4, 10, 960, 'metric2'),
       (14, 4, 10, 5.2, 'metric3'),
       (14, 4, 10, 17500, 'metric4');

-- Metric values for startup 14, time_period 4 (Q3 2023), month_id 11 (November)
INSERT INTO metric_values (startup_id, time_period, month_id, value, metric_uid)
VALUES (14, 4, 11, 0.29, 'metric1'),
       (14, 4, 11, 990, 'metric2'),
       (14, 4, 11, 5.4, 'metric3'),
       (14, 4, 11, 18000, 'metric4');

-- Metric values for startup 14, time_period 4 (Q3 2023), month_id 12 (December)
INSERT INTO metric_values (startup_id, time_period, month_id, value, metric_uid)
VALUES (14, 4, 12, 0.32, 'metric1'),
       (14, 4, 12, 1020, 'metric2'),
       (14, 4, 12, 5.6, 'metric3'),
       (14, 4, 12, 18500, 'metric4');

-- Repeat the above inserts for other time_period IDs (5, 6, 7, 8, 12) with appropriate values.
-- Remember to change the time_period value in the INSERT statements accordingly.


-- Metric Values for Time Period 5 (Q4 2022)
-- Metric values for startup 14, time_period 5 (Q4 2022), month_id 1 (January)
INSERT INTO metric_values (startup_id, time_period, month_id, value, metric_uid)
VALUES (14, 5, 1, 0.29, 'metric1'),
       (14, 5, 1, 1000, 'metric2'),
       (14, 5, 1, 5.7, 'metric3'),
       (14, 5, 1, 19000, 'metric4');

-- Metric values for startup 14, time_period 5 (Q4 2022), month_id 2 (February)
INSERT INTO metric_values (startup_id, time_period, month_id, value, metric_uid)
VALUES (14, 5, 2, 0.31, 'metric1'),
       (14, 5, 2, 1030, 'metric2'),
       (14, 5, 2, 5.9, 'metric3'),
       (14, 5, 2, 19500, 'metric4');

-- Metric values for startup 14, time_period 5 (Q4 2022), month_id 3 (March)
INSERT INTO metric_values (startup_id, time_period, month_id, value, metric_uid)
VALUES (14, 5, 3, 0.34, 'metric1'),
       (14, 5, 3, 1060, 'metric2'),
       (14, 5, 3, 6.1, 'metric3'),
       (14, 5, 3, 20000, 'metric4');


-- Metric Values for Time Period 6 (Q1 2022)
-- Metric values for startup 14, time_period 6 (Q1 2022), month_id 4 (April)
INSERT INTO metric_values (startup_id, time_period, month_id, value, metric_uid)
VALUES (14, 6, 4, 0.27, 'metric1'),
       (14, 6, 4, 980, 'metric2'),
       (14, 6, 4, 5.3, 'metric3'),
       (14, 6, 4, 18000, 'metric4');

-- Metric values for startup 14, time_period 6 (Q1 2022), month_id 5 (May)
INSERT INTO metric_values (startup_id, time_period, month_id, value, metric_uid)
VALUES (14, 6, 5, 0.29, 'metric1'),
       (14, 6, 5, 1000, 'metric2'),
       (14, 6, 5, 5.5, 'metric3'),
       (14, 6, 5, 18500, 'metric4');

-- Metric values for startup 14, time_period 6 (Q1 2022), month_id 6 (June)
INSERT INTO metric_values (startup_id, time_period, month_id, value, metric_uid)
VALUES (14, 6, 6, 0.32, 'metric1'),
       (14, 6, 6, 1030, 'metric2'),
       (14, 6, 6, 5.7, 'metric3'),
       (14, 6, 6, 19000, 'metric4');


-- Metric Values for Time Period 7 (Q2 2022)
-- Metric values for startup 14, time_period 7 (Q2 2022), month_id 7 (July)
INSERT INTO metric_values (startup_id, time_period, month_id, value, metric_uid)
VALUES (14, 7, 7, 0.26, 'metric1'),
       (14, 7, 7, 970, 'metric2'),
       (14, 7, 7, 5.2, 'metric3'),
       (14, 7, 7, 17500, 'metric4');

-- Metric values for startup 14, time_period 7 (Q2 2022), month_id 8 (August)
INSERT INTO metric_values (startup_id, time_period, month_id, value, metric_uid)
VALUES (14, 7, 8, 0.28, 'metric1'),
       (14, 7, 8, 1000, 'metric2'),
       (14, 7, 8, 5.4, 'metric3'),
       (14, 7, 8, 18000, 'metric4');

-- Metric values for startup 14, time_period 7 (Q2 2022), month_id 9 (September)
INSERT INTO metric_values (startup_id, time_period, month_id, value, metric_uid)
VALUES (14, 7, 9, 0.30, 'metric1'),
       (14, 7, 9, 1030, 'metric2'),
       (14, 7, 9, 5.6, 'metric3'),
       (14, 7, 9, 18500, 'metric4');

-- Metric Values for Time Period 8 (Q3 2022)
-- Metric values for startup 14, time_period 8 (Q3 2022), month_id 10 (October)
INSERT INTO metric_values (startup_id, time_period, month_id, value, metric_uid)
VALUES (14, 8, 10, 0.24, 'metric1'),
       (14, 8, 10, 950, 'metric2'),
       (14, 8, 10, 5.0, 'metric3'),
       (14, 8, 10, 17000, 'metric4');

-- Metric values for startup 14, time_period 8 (Q3 2022), month_id 11 (November)
INSERT INTO metric_values (startup_id, time_period, month_id, value, metric_uid)
VALUES (14, 8, 11, 0.22, 'metric1'),
       (14, 8, 11, 920, 'metric2'),
       (14, 8, 11, 4.8, 'metric3'),
       (14, 8, 11, 16500, 'metric4');

-- Metric values for startup 14, time_period 8 (Q3 2022), month_id 12 (December)
INSERT INTO metric_values (startup_id, time_period, month_id, value, metric_uid)
VALUES (14, 8, 12, 0.20, 'metric1'),
       (14, 8, 12, 890, 'metric2'),
       (14, 8, 12, 4.6, 'metric3'),
       (14, 8, 12, 16000, 'metric4');


-- Metric Values for Time Period 12 (Q3 2021)
-- Metric values for startup 14, time_period 12 (Q3 2021), month_id 10 (October)
INSERT INTO metric_values (startup_id, time_period, month_id, value, metric_uid)
VALUES (14, 12, 10, 0.40, 'metric1'),
       (14, 12, 10, 1100, 'metric2'),
       (14, 12, 10, 6.0, 'metric3'),
       (14, 12, 10, 20000, 'metric4');

-- Metric values for startup 14, time_period 12 (Q3 2021), month_id 11 (November)
INSERT INTO metric_values (startup_id, time_period, month_id, value, metric_uid)
VALUES (14, 12, 11, 0.38, 'metric1'),
       (14, 12, 11, 1050, 'metric2'),
       (14, 12, 11, 5.8, 'metric3'),
       (14, 12, 11, 19500, 'metric4');

-- Metric values for startup 14, time_period 12 (Q3 2021), month_id 12 (December)
INSERT INTO metric_values (startup_id, time_period, month_id, value, metric_uid)
VALUES (14, 12, 12, 0.36, 'metric1'),
       (14, 12, 12, 1000, 'metric2'),
       (14, 12, 12, 5.6, 'metric3'),
       (14, 12, 12, 19000, 'metric4');


-- Metric Value Changes Data
-- Generate 40 rows of random data for metric_value_changes table

INSERT INTO metric_value_changes (metric_value_id, old_value, new_value, change_date, changed_by)
VALUES
  -- Rows 1-10
  (1, 0.18, 0.2, '2022-01-15 08:32:10', 'lavanyasf@yopmail.com'),
  (2, 820, 800, '2022-02-20 14:45:22', 'lavanyasf@yopmail.com'),
  (3, 4.1, 4.3, '2022-03-25 09:21:35', 'lavanyasf@yopmail.com'),
  (4, 15950, 16000, '2022-04-05 12:58:40', 'lavanyasf@yopmail.com'),
  (5, 0.16, 0.18, '2022-05-10 16:37:15', 'lavanyasf@yopmail.com'),
  (6, 890, 900, '2022-06-15 11:29:50', 'lavanyasf@yopmail.com'),
  (7, 4.5, 4.7, '2022-07-20 08:47:29', 'lavanyasf@yopmail.com'),
  (8, 15450, 15500, '2022-08-25 15:12:57', 'lavanyasf@yopmail.com'),
  (9, 0.14, 0.15, '2022-09-30 09:03:40', 'lavanyasf@yopmail.com'),
  (10, 940, 950, '2022-10-05 10:56:23', 'lavanyasf@yopmail.com'),
  
  -- Rows 11-20
  (11, 4.8, 4.9, '2022-11-10 13:47:18', 'lavanyasf@yopmail.com'),
  (12, 15500, 16000, '2022-12-15 17:22:45', 'lavanyasf@yopmail.com'),
  (13, 0.21, 0.22, '2023-01-20 12:38:09', 'lavanyasf@yopmail.com'),
  (14, 840, 850, '2023-02-25 09:55:32', 'lavanyasf@yopmail.com'),
  (15, 4.4, 4.5, '2023-03-30 14:41:57', 'lavanyasf@yopmail.com'),
  (16, 16450, 16500, '2023-04-05 11:27:14', 'lavanyasf@yopmail.com'),
  (17, 0.24, 0.25, '2023-05-10 08:19:28', 'lavanyasf@yopmail.com'),
  (18, 890, 900, '2023-06-15 14:52:10', 'lavanyasf@yopmail.com'),
  (19, 4.7, 4.8, '2023-07-20 10:11:43', 'lavanyasf@yopmail.com'),
  (20, 16900, 17000, '2023-08-25 15:36:22', 'lavanyasf@yopmail.com'),
  
  -- Rows 21-30
  (21, 0.27, 0.28, '2021-10-15 08:32:10', 'lavanyasf@yopmail.com'),
  (22, 940, 950, '2021-11-20 14:45:22', 'lavanyasf@yopmail.com'),
  (23, 4.9, 5.0, '2021-12-25 09:21:35', 'lavanyasf@yopmail.com'),
  (24, 17450, 17500, '2022-01-05 12:58:40', 'lavanyasf@yopmail.com'),
  (25, 0.26, 0.27, '2022-02-10 16:37:15', 'lavanyasf@yopmail.com'),
  (26, 970, 980, '2022-03-15 11:29:50', 'lavanyasf@yopmail.com'),
  (27, 5.1, 5.2, '2022-04-20 08:47:29', 'lavanyasf@yopmail.com'),
  (28, 17350, 17400, '2022-05-25 15:12:57', 'lavanyasf@yopmail.com'),
  (29, 0.25, 0.26, '2022-06-30 09:03:40', 'lavanyasf@yopmail.com'),
  (30, 960, 970, '2022-07-05 10:56:23', 'lavanyasf@yopmail.com'),

  -- Rows 31-40
  (31, 5.0, 5.1, '2022-08-10 13:47:18', 'lavanyasf@yopmail.com'),
  (32, 17250, 17300, '2022-09-15 17:22:45', 'lavanyasf@yopmail.com'),
  (33, 0.29, 0.30, '2022-10-20 12:38:09', 'lavanyasf@yopmail.com'),
  (34, 980, 990, '2022-11-25 09:55:32', 'lavanyasf@yopmail.com'),
  (35, 5.3, 5.4, '2022-12-30 14:41:57', 'lavanyasf@yopmail.com'),
  (36, 17550, 17600, '2023-01-05 11:27:14', 'lavanyasf@yopmail.com'),
  (37, 0.31, 0.32, '2023-02-10 08:19:28', 'lavanyasf@yopmail.com'),
  (38, 1010, 1020, '2023-03-15 14:52:10', 'lavanyasf@yopmail.com'),
  (39, 5.5, 5.6, '2023-04-20 10:11:43', 'lavanyasf@yopmail.com'),
  (40, 17800, 17850, '2023-05-25 15:36:22', 'lavanyasf@yopmail.com');





-- 	{
--     "email" : "lavanya@yopmail.com",
--     "name" : "Lavanya",
--     "password" : "Apple@123",
--     "phone_number" :"9121910427",
--     "incubator_name" :"Saas Test",
--     "incubator_logo":"https://png.pngtree.com/png-clipart/20200701/original/pngtree-charminar-illustration-of-historical-monument-hyderabad-vector-png-image_5355377.jpg"
-- }


CREATE TABLE `chats` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`incubator_id` INT UNSIGNED NOT NULL,
    `startup_id` INT UNSIGNED NOT NULL,
	`sender` VARCHAR(255) NOT NULL,
	`message` VARCHAR(255) NOT NULL,
	`time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	 FOREIGN KEY (`incubator_id`) REFERENCES `incubators`(`id`),
     FOREIGN KEY (`startup_id`) REFERENCES `startups`(`id`)
);


CREATE TABLE `all_timestamps` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`incubator_id` INT UNSIGNED NOT NULL,
    `startup_id` INT UNSIGNED NOT NULL,
	`email` VARCHAR(255) NOT NULL,
	`time` TIMESTAMP,
	`type` VARCHAR(255) NOT NULL,
	 FOREIGN KEY (`incubator_id`) REFERENCES `incubators`(`id`),
     FOREIGN KEY (`startup_id`) REFERENCES `startups`(`id`)
);


CREATE TABLE `notifications` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`incubator_id` INT UNSIGNED NOT NULL,
    `startup_id` INT UNSIGNED NOT NULL,
	`sender` VARCHAR(255) NOT NULL,
	`time` TIMESTAMP,
	`text` VARCHAR(255) NOT NULL,
  `redirect_type` VARCHAR(255) NOT NULL,
	 FOREIGN KEY (`incubator_id`) REFERENCES `incubators`(`id`),
     FOREIGN KEY (`startup_id`) REFERENCES `startups`(`id`)
);

CREATE TABLE `notif_timestamps` (
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`email` VARCHAR(255) NOT NULL,
	`time` TIMESTAMP
);