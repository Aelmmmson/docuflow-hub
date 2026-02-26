-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Feb 26, 2026 at 07:28 PM
-- Server version: 8.0.31
-- PHP Version: 8.0.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dms_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `account_setups`
--

DROP TABLE IF EXISTS `account_setups`;
CREATE TABLE IF NOT EXISTS `account_setups` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `account_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` char(1) COLLATE utf8mb4_unicode_ci NOT NULL,
  `posted_by` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `account_setups`
--

INSERT INTO `account_setups` (`id`, `account_name`, `account_number`, `account_type`, `status`, `posted_by`, `created_at`, `updated_at`) VALUES
(1, 'NEWSPAPER EXPENSE', '142510000001', '1', '1', 1, NULL, NULL),
(2, 'ELECTRICITY EXPENSE', '144200000007', '1', '1', 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `approval_activities`
--

DROP TABLE IF EXISTS `approval_activities`;
CREATE TABLE IF NOT EXISTS `approval_activities` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `approved_by` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comment` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recommended_amount` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `doc_id` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `approval_stage` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `approval_activities`
--

INSERT INTO `approval_activities` (`id`, `approved_by`, `comment`, `recommended_amount`, `doc_id`, `created_at`, `updated_at`, `approval_stage`) VALUES
(1, '2', 'All good', NULL, 1, '2025-05-06 12:21:25', '2025-05-06 12:21:25', 1),
(2, '6', 'Very good ', NULL, 1, '2025-05-06 12:22:12', '2025-05-06 12:22:12', 1),
(3, '6', '', NULL, 1, '2025-05-06 12:22:27', '2025-05-06 12:22:27', 2),
(4, '5', NULL, NULL, 1, '2025-05-06 12:22:54', '2025-05-06 12:22:54', 2),
(5, '3', NULL, NULL, 1, '2025-05-06 12:23:15', '2025-05-06 12:23:15', 2),
(6, '5', 'The account involved is wrong', NULL, 3, '2025-05-07 15:42:35', '2025-05-07 15:42:35', 1),
(7, '2', 'ok good', NULL, 2, '2025-05-11 18:12:56', '2025-05-11 18:12:56', 1),
(8, '3', NULL, NULL, 2, '2025-05-11 18:14:23', '2025-05-11 18:14:23', 1),
(9, '3', '', NULL, 2, '2025-05-11 18:14:35', '2025-05-11 18:14:35', 2),
(10, '5', NULL, NULL, 2, '2025-05-11 18:15:04', '2025-05-11 18:15:04', 2),
(11, '2', NULL, NULL, 2, '2025-05-11 18:15:34', '2025-05-11 18:15:34', 2),
(12, '4', 'this is not right', NULL, 2, '2025-05-11 18:35:31', '2025-05-11 18:35:31', 3),
(13, '2', 'looks good, but must be paid', NULL, 4, '2025-05-11 19:26:19', '2025-05-11 19:26:19', 1),
(14, '5', 'great', NULL, 4, '2025-05-11 19:26:54', '2025-05-11 19:26:54', 1),
(15, '3', NULL, NULL, 4, '2025-05-11 19:27:21', '2025-05-11 19:27:21', 1),
(16, '6', NULL, NULL, 4, '2025-05-11 19:27:45', '2025-05-11 19:27:45', 1),
(17, '2', 'this looks good', NULL, 5, '2025-05-12 14:01:05', '2025-05-12 14:01:05', 1),
(18, '6', 'Very good', NULL, 5, '2025-05-12 14:02:26', '2025-05-12 14:02:26', 1),
(19, '6', 'This is good', NULL, 5, '2025-05-12 14:03:04', '2025-05-12 14:03:04', 2),
(20, '5', 'well done guys, this looks okay', NULL, 5, '2025-05-12 14:04:21', '2025-05-12 14:04:21', 2),
(21, '3', NULL, NULL, 5, '2025-05-12 14:04:57', '2025-05-12 14:04:57', 2),
(22, '2', NULL, NULL, 6, '2025-06-03 17:09:14', '2025-06-03 17:09:14', 1),
(23, '6', NULL, NULL, 6, '2025-06-03 17:10:24', '2025-06-03 17:10:24', 1),
(24, '3', NULL, NULL, 6, '2025-06-03 17:10:49', '2025-06-03 17:10:49', 1),
(25, '5', NULL, NULL, 6, '2025-06-03 17:11:30', '2025-06-03 17:11:30', 1),
(26, '2', 'All bad', NULL, 10, '2026-01-12 15:48:27', '2026-01-12 15:48:27', 1),
(27, '2', NULL, NULL, 7, '2026-01-14 14:16:03', '2026-01-14 14:16:03', 1);

-- --------------------------------------------------------

--
-- Table structure for table `approvers`
--

DROP TABLE IF EXISTS `approvers`;
CREATE TABLE IF NOT EXISTS `approvers` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `branch` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doctype_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `approver_setups`
--

DROP TABLE IF EXISTS `approver_setups`;
CREATE TABLE IF NOT EXISTS `approver_setups` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `branch_id` bigint NOT NULL,
  `doctype_id` bigint NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `posted_by` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audits`
--

DROP TABLE IF EXISTS `audits`;
CREATE TABLE IF NOT EXISTS `audits` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `activity` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `done_by` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `beneficiary_setups`
--

DROP TABLE IF EXISTS `beneficiary_setups`;
CREATE TABLE IF NOT EXISTS `beneficiary_setups` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `beneficiary_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `account_number` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` char(1) COLLATE utf8mb4_general_ci NOT NULL,
  `posted_by` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `beneficiary_setups`
--

INSERT INTO `beneficiary_setups` (`id`, `beneficiary_name`, `account_number`, `description`, `status`, `posted_by`, `created_at`, `updated_at`) VALUES
(1, 'Mr Solomon', '092827778827', 'This is a test case', '1', 1, NULL, NULL),
(2, 'Kofi Akoto', '0009992938883', 'Head of Pride race plc', '1', 1, NULL, NULL),
(3, 'Test Bene', '1441002254568', 'Testing desc', '1', 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
CREATE TABLE IF NOT EXISTS `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
CREATE TABLE IF NOT EXISTS `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `code_creations`
--

DROP TABLE IF EXISTS `code_creations`;
CREATE TABLE IF NOT EXISTS `code_creations` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `posted_by` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `code_creations`
--

INSERT INTO `code_creations` (`id`, `code`, `description`, `posted_by`, `created_at`, `updated_at`) VALUES
(1, 'BRA', 'Branch', '1', '2025-01-15 14:41:55', '2025-01-15 14:41:55'),
(2, 'DOCS', 'Document type', '1', '2025-01-15 14:42:16', '2025-01-15 14:42:16');

-- --------------------------------------------------------

--
-- Table structure for table `code_creation_details`
--

DROP TABLE IF EXISTS `code_creation_details`;
CREATE TABLE IF NOT EXISTS `code_creation_details` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `code_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `posted_by` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `trans_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expense_code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_desc` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_number` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color_code` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `code_creation_details`
--

INSERT INTO `code_creation_details` (`id`, `code_id`, `description`, `posted_by`, `created_at`, `updated_at`, `status`, `trans_type`, `expense_code`, `account_desc`, `account_number`, `color_code`) VALUES
(1, '2', 'NEWSPAPER EXPENSE', '1', NULL, NULL, '1', '0', '', NULL, NULL, '#9c9175'),
(2, '2', 'ELECTRIC EXPENSES', '1', NULL, NULL, '1', '1', '', 'Travel & Accommodation', '6-1100', '#3a7ef2'),
(3, '2', 'Test one', '1', NULL, NULL, '1', '1', NULL, 'OFFICE RENT - LD-144200000001', '144200000001', '#a8a970'),
(4, '2', 'Test two', '1', NULL, NULL, '1', '1', NULL, 'ASSETS RISK INSURANCE EXPENSE LRD-144000000007', '144000000007', '#b535ef'),
(5, '2', 'Test add Parameter', '1', NULL, NULL, '1', '1', '', 'Travel & Accommodation', '610000000002', '#5481ba');

-- --------------------------------------------------------

--
-- Table structure for table `document_types`
--

DROP TABLE IF EXISTS `document_types`;
CREATE TABLE IF NOT EXISTS `document_types` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `doc_approval_setups`
--

DROP TABLE IF EXISTS `doc_approval_setups`;
CREATE TABLE IF NOT EXISTS `doc_approval_setups` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `doctype_id` bigint NOT NULL,
  `stage_desc` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `approval_stage` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `number_of_approvers` bigint NOT NULL,
  `number_of_mandatory_approvers` bigint NOT NULL,
  `quorum` varchar(11) COLLATE utf8mb4_unicode_ci NOT NULL,
  `approvers` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `details` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `posted_by` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `doc_approval_setups`
--

INSERT INTO `doc_approval_setups` (`id`, `doctype_id`, `stage_desc`, `approval_stage`, `number_of_approvers`, `number_of_mandatory_approvers`, `quorum`, `approvers`, `details`, `posted_by`, `created_at`, `updated_at`) VALUES
(1, 1, 'VERIFICATION', '1', 3, 2, '2', '[{\"userId\":2,\"name\":\"ALFRED JUXON-SMITH\",\"isMandatory\":true},{\"userId\":5,\"name\":\"MOHAMED KAMARA\",\"isMandatory\":false},{\"userId\":6,\"name\":\"LOUISE JOHNSON\",\"isMandatory\":true}]', '[{\"name\":\"VERIFICATION\",\"approvers\":[{\"userId\":2,\"name\":\"ALFRED JUXON-SMITH\",\"isMandatory\":true},{\"userId\":5,\"name\":\"MOHAMED KAMARA\",\"isMandatory\":false},{\"userId\":6,\"name\":\"LOUISE JOHNSON\",\"isMandatory\":true}],\"quorum\":\"2\"},{\"name\":\"FINAL APPROVAL\",\"approvers\":[{\"userId\":2,\"name\":\"ALFRED JUXON-SMITH\",\"isMandatory\":false},{\"userId\":3,\"name\":\"MILLICENT COLE\",\"isMandatory\":true},{\"userId\":5,\"name\":\"MOHAMED KAMARA\",\"isMandatory\":true},{\"userId\":6,\"name\":\"LOUISE JOHNSON\",\"isMandatory\":false}],\"quorum\":\"3\"}]', '1', NULL, NULL),
(2, 1, 'FINAL APPROVAL', '2', 4, 2, '3', '[{\"userId\":2,\"name\":\"ALFRED JUXON-SMITH\",\"isMandatory\":false},{\"userId\":3,\"name\":\"MILLICENT COLE\",\"isMandatory\":true},{\"userId\":5,\"name\":\"MOHAMED KAMARA\",\"isMandatory\":true},{\"userId\":6,\"name\":\"LOUISE JOHNSON\",\"isMandatory\":false}]', '[{\"name\":\"VERIFICATION\",\"approvers\":[{\"userId\":2,\"name\":\"ALFRED JUXON-SMITH\",\"isMandatory\":true},{\"userId\":5,\"name\":\"MOHAMED KAMARA\",\"isMandatory\":false},{\"userId\":6,\"name\":\"LOUISE JOHNSON\",\"isMandatory\":true}],\"quorum\":\"2\"},{\"name\":\"FINAL APPROVAL\",\"approvers\":[{\"userId\":2,\"name\":\"ALFRED JUXON-SMITH\",\"isMandatory\":false},{\"userId\":3,\"name\":\"MILLICENT COLE\",\"isMandatory\":true},{\"userId\":5,\"name\":\"MOHAMED KAMARA\",\"isMandatory\":true},{\"userId\":6,\"name\":\"LOUISE JOHNSON\",\"isMandatory\":false}],\"quorum\":\"3\"}]', '1', NULL, NULL),
(3, 2, 'APPROVAL', '1', 4, 0, '4', '[{\"userId\":2,\"name\":\"ALFRED JUXON-SMITH\",\"isMandatory\":false},{\"userId\":5,\"name\":\"MOHAMED KAMARA\",\"isMandatory\":false},{\"userId\":3,\"name\":\"MILLICENT COLE\",\"isMandatory\":false},{\"userId\":6,\"name\":\"LOUISE JOHNSON\",\"isMandatory\":false}]', '[{\"name\":\"APPROVAL\",\"approvers\":[{\"userId\":2,\"name\":\"ALFRED JUXON-SMITH\",\"isMandatory\":false},{\"userId\":5,\"name\":\"MOHAMED KAMARA\",\"isMandatory\":false},{\"userId\":3,\"name\":\"MILLICENT COLE\",\"isMandatory\":false},{\"userId\":6,\"name\":\"LOUISE JOHNSON\",\"isMandatory\":false}],\"quorum\":\"4\"}]', '1', NULL, NULL),
(4, 4, 'test', '1', 3, 1, '2', '[{\"userId\":3,\"name\":\"MILLICENT COLE\",\"isMandatory\":false},{\"userId\":5,\"name\":\"MOHAMED KAMARA\",\"isMandatory\":true},{\"userId\":6,\"name\":\"LOUISE JOHNSON\",\"isMandatory\":false}]', '[{\"name\":\"test\",\"quorum\":\"2\",\"approvers\":[{\"userId\":3,\"name\":\"MILLICENT COLE\",\"isMandatory\":false},{\"userId\":5,\"name\":\"MOHAMED KAMARA\",\"isMandatory\":true},{\"userId\":6,\"name\":\"LOUISE JOHNSON\",\"isMandatory\":false}]}]', '1', NULL, NULL),
(5, 3, 'testing', '1', 1, 0, '1', '[{\"userId\":3,\"name\":\"MILLICENT COLE\",\"isMandatory\":false}]', '[{\"name\":\"testing\",\"quorum\":\"1\",\"approvers\":[{\"userId\":3,\"name\":\"MILLICENT COLE\",\"isMandatory\":false}]},{\"name\":\"final\",\"quorum\":\"1\",\"approvers\":[{\"userId\":3,\"name\":\"MILLICENT COLE\",\"isMandatory\":false}]}]', '1', NULL, NULL),
(6, 3, 'final', '2', 1, 0, '1', '[{\"userId\":3,\"name\":\"MILLICENT COLE\",\"isMandatory\":false}]', '[{\"name\":\"testing\",\"quorum\":\"1\",\"approvers\":[{\"userId\":3,\"name\":\"MILLICENT COLE\",\"isMandatory\":false}]},{\"name\":\"final\",\"quorum\":\"1\",\"approvers\":[{\"userId\":3,\"name\":\"MILLICENT COLE\",\"isMandatory\":false}]}]', '1', NULL, NULL),
(7, 5, 'Verify', '1', 1, 0, '1', '[{\"userId\":3,\"name\":\"MILLICENT COLE\",\"isMandatory\":false}]', '[{\"name\":\"Verify\",\"quorum\":\"1\",\"approvers\":[{\"userId\":3,\"name\":\"MILLICENT COLE\",\"isMandatory\":false}]}]', '1', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `doc_approvers`
--

DROP TABLE IF EXISTS `doc_approvers`;
CREATE TABLE IF NOT EXISTS `doc_approvers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `doctype_id` bigint NOT NULL,
  `approver_id` bigint NOT NULL,
  `is_mandatory` tinyint(1) NOT NULL,
  `approval_stage` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `doc_approvers`
--

INSERT INTO `doc_approvers` (`id`, `doctype_id`, `approver_id`, `is_mandatory`, `approval_stage`, `created_at`, `updated_at`) VALUES
(2, 2, 2, 0, '1', '2025-03-17 13:47:13', '2025-03-17 13:47:13'),
(3, 2, 3, 0, '1', '2025-03-17 13:47:13', '2025-03-17 13:47:13'),
(4, 2, 2, 1, '2', '2025-03-17 13:47:13', '2025-03-17 13:47:13'),
(15, 3, 3, 1, '1', '2025-03-26 13:02:03', '2025-03-26 13:02:03'),
(16, 3, 5, 0, '1', '2025-03-26 13:02:03', '2025-03-26 13:02:03'),
(17, 3, 6, 0, '1', '2025-03-26 13:02:03', '2025-03-26 13:02:03'),
(18, 4, 3, 0, '1', '2025-04-01 19:29:51', '2025-04-01 19:29:51'),
(19, 1, 2, 0, '1', '2025-04-08 08:32:34', '2025-04-08 08:32:34'),
(20, 1, 3, 0, '1', '2025-04-08 08:32:34', '2025-04-08 08:32:34'),
(21, 1, 5, 1, '1', '2025-04-08 08:32:34', '2025-04-08 08:32:34'),
(22, 1, 2, 0, '2', '2025-04-08 08:32:34', '2025-04-08 08:32:34'),
(23, 1, 6, 1, '2', '2025-04-08 08:32:34', '2025-04-08 08:32:34'),
(24, 1, 5, 0, '2', '2025-04-08 08:32:34', '2025-04-08 08:32:34'),
(25, 6, 2, 1, '1', '2025-04-28 10:56:06', '2025-04-28 10:56:06'),
(26, 6, 3, 0, '1', '2025-04-28 10:56:06', '2025-04-28 10:56:06'),
(27, 6, 5, 0, '1', '2025-04-28 10:56:06', '2025-04-28 10:56:06'),
(28, 6, 6, 0, '1', '2025-04-28 10:56:06', '2025-04-28 10:56:06'),
(29, 6, 2, 0, '2', '2025-04-28 10:56:06', '2025-04-28 10:56:06'),
(30, 6, 3, 1, '2', '2025-04-28 10:56:06', '2025-04-28 10:56:06'),
(31, 6, 5, 0, '2', '2025-04-28 10:56:06', '2025-04-28 10:56:06'),
(32, 6, 6, 1, '2', '2025-04-28 10:56:06', '2025-04-28 10:56:06'),
(33, 1, 2, 1, '1', '2025-05-05 12:01:45', '2025-05-05 12:01:45'),
(34, 1, 5, 0, '1', '2025-05-05 12:01:45', '2025-05-05 12:01:45'),
(35, 1, 6, 1, '1', '2025-05-05 12:01:45', '2025-05-05 12:01:45'),
(36, 1, 2, 0, '2', '2025-05-05 12:01:45', '2025-05-05 12:01:45'),
(37, 1, 3, 1, '2', '2025-05-05 12:01:45', '2025-05-05 12:01:45'),
(38, 1, 5, 1, '2', '2025-05-05 12:01:45', '2025-05-05 12:01:45'),
(39, 1, 6, 0, '2', '2025-05-05 12:01:45', '2025-05-05 12:01:45'),
(40, 2, 2, 0, '1', '2025-05-07 15:32:53', '2025-05-07 15:32:53'),
(41, 2, 5, 0, '1', '2025-05-07 15:32:53', '2025-05-07 15:32:53'),
(42, 2, 3, 0, '1', '2025-05-07 15:32:53', '2025-05-07 15:32:53'),
(43, 2, 6, 0, '1', '2025-05-07 15:32:53', '2025-05-07 15:32:53'),
(44, 4, 3, 0, '1', '2026-01-31 00:17:20', '2026-01-31 00:17:20'),
(45, 4, 5, 1, '1', '2026-01-31 00:17:20', '2026-01-31 00:17:20'),
(46, 4, 6, 0, '1', '2026-01-31 00:17:20', '2026-01-31 00:17:20'),
(47, 3, 3, 0, '1', '2026-01-31 00:54:59', '2026-01-31 00:54:59'),
(48, 3, 3, 0, '2', '2026-01-31 00:54:59', '2026-01-31 00:54:59'),
(49, 5, 3, 0, '1', '2026-01-31 00:59:37', '2026-01-31 00:59:37');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
CREATE TABLE IF NOT EXISTS `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
CREATE TABLE IF NOT EXISTS `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2024_10_01_115509_create_personal_access_tokens_table', 1),
(6, '2024_10_01_150752_create_approval_activities_table', 1),
(7, '2024_10_01_151815_create_document_types_table', 1),
(8, '2024_10_01_155016_create_approver_setups_table', 1),
(9, '2024_10_01_155719_create_temporary_approvers_table', 1),
(10, '2024_10_01_160721_create_audits_table', 1),
(11, '2024_10_03_174707_create_approvers_table', 1),
(12, '2024_10_07_111521_create_code_creations_table', 1),
(13, '2024_10_07_114614_create_code_creation_details_table', 1),
(14, '2024_10_13_182404_update_code_creation_details_table', 1),
(15, '2024_10_15_123510_update_code_creation_details_table', 1),
(16, '2024_10_28_153956_create_permission_tables', 1),
(17, '2024_12_23_163913_create_doc_approval_setups_table', 1),
(18, '2025_01_17_164858_create_account_setups_table', 2),
(19, '2024_10_01_140331_create_request_documents_table', 3);

-- --------------------------------------------------------

--
-- Table structure for table `model_has_permissions`
--

DROP TABLE IF EXISTS `model_has_permissions`;
CREATE TABLE IF NOT EXISTS `model_has_permissions` (
  `permission_id` bigint UNSIGNED NOT NULL,
  `model_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint UNSIGNED NOT NULL,
  PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `model_has_roles`
--

DROP TABLE IF EXISTS `model_has_roles`;
CREATE TABLE IF NOT EXISTS `model_has_roles` (
  `role_id` bigint UNSIGNED NOT NULL,
  `model_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint UNSIGNED NOT NULL,
  PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `model_has_roles`
--

INSERT INTO `model_has_roles` (`role_id`, `model_type`, `model_id`) VALUES
(2, 'AppModelsUser', 1),
(2, 'AppModelsUser', 2),
(3, 'AppModelsUser', 3),
(4, 'AppModelsUser', 4),
(3, 'AppModelsUser', 5),
(3, 'AppModelsUser', 6),
(1, 'AppModelsUser', 7),
(2, 'AppModelsUser', 8),
(2, 'AppModelsUser', 9),
(2, 'AppModelsUser', 10),
(3, 'AppModelsUser', 11);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `password_reset_tokens`
--

INSERT INTO `password_reset_tokens` (`email`, `token`, `created_at`) VALUES
('hnramoh3@gmail.com', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhucmFtb2gzQGdtYWlsLmNvbSIsImlhdCI6MTc3MTUxNjM4MiwiZXhwIjoxNzcxNTE5OTgyfQ.CzD3YquOmOjEw1txJ170WRkC6At181gSjDDV9ZtdOyk', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 1, 'auth_token', '7915f978f5ad43ff1a88ab7bcdfe5a3f5fba12847e072e339986be9d20f664b7', '[\"*\"]', '2025-02-20 19:24:01', NULL, '2025-01-15 14:30:31', '2025-02-20 19:24:01'),
(2, 'App\\Models\\User', 1, 'auth_token', '8327e236533d8d60f5712c7ecd10023ca787f280603c0a91435a97d20c2d0638', '[\"*\"]', NULL, NULL, '2025-02-11 10:33:19', '2025-02-11 10:33:19');

-- --------------------------------------------------------

--
-- Table structure for table `request_documents`
--

DROP TABLE IF EXISTS `request_documents`;
CREATE TABLE IF NOT EXISTS `request_documents` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `doctype_id` bigint NOT NULL,
  `branch` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requested_amount` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approved_amount` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_no` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_desc` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `details` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doc_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch_no` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_date` date DEFAULT NULL,
  `is_transaction_failed` tinyint(1) NOT NULL,
  `is_approved` tinyint(1) NOT NULL DEFAULT '0',
  `posted_by` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `approval_stage` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '1',
  `current_approvers` int DEFAULT NULL,
  `is_required_approvers_left` tinyint(1) NOT NULL DEFAULT '0',
  `decline_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `stage_updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `request_documents`
--

INSERT INTO `request_documents` (`id`, `doctype_id`, `branch`, `requested_amount`, `approved_amount`, `customer_no`, `customer_desc`, `details`, `doc_id`, `batch_no`, `transaction_date`, `is_transaction_failed`, `is_approved`, `posted_by`, `status`, `approval_stage`, `current_approvers`, `is_required_approvers_left`, `decline_reason`, `updated_by`, `created_at`, `updated_at`, `stage_updated_at`) VALUES
(1, 1, '000', '120', NULL, '0010102334501', '0010102334501-ALEX F. JOHNSON', 'Newspaper payment for the month of may', '1746534000', 'cd1746605968950', NULL, 0, 0, '1', 'APPROVED', '3', 0, 0, NULL, NULL, NULL, NULL, '2025-06-03 17:07:54'),
(2, 1, '000', '134', '150', '0010102341201', '0010102341201-ANTHONY H. KOLLIE', 'test', '1746543091', NULL, NULL, 0, 0, '7', 'REJECTED', '3', 0, 0, 'this is not right', NULL, NULL, NULL, '2025-05-11 18:35:31'),
(3, 2, '000', '5678', NULL, '00322404764101', '00322404764101-AMAZE ELECTRIC WORLD', 'PAYMENT FOR USAGE OF ELECTRICITY', '1746632061', 'g11748969916508', NULL, 0, 0, '1', 'PAID', '1', 0, 0, 'The account involved is wrong', NULL, NULL, NULL, '2025-06-03 16:58:45'),
(4, 2, '000', '346', '350', '0710154556001', '0710154556001-2- REAL AUTOPARTS & FILLING STATION', 'payment details attached', '1746991485', 'ua1747039197364', NULL, 0, 0, '1', 'PAID', '2', 0, 0, NULL, NULL, NULL, NULL, '2025-05-12 08:40:03'),
(5, 1, '000', '124', NULL, '0010101422102', '0010101422102-ALARM RESPOND SECURITY GUARD SERVICES INC.', 'test again', '1747057908', '311747058906932', NULL, 0, 0, '1', 'APPROVED', '3', 0, 0, NULL, NULL, NULL, NULL, '2025-06-03 17:08:41'),
(6, 2, '000', '3455', NULL, '0010101800602', '0010101800602-ADS SOLUTIONS LTD', 'test', '1747223384', 'xb1748970711437', NULL, 0, 0, '1', 'PAID', '2', 0, 0, NULL, NULL, NULL, NULL, '2025-06-03 17:11:51'),
(7, 1, '000', '50', NULL, '0010100032202', '0010100032202-\'KONOLA ACADEMY MODERINIZATION FUND\'\'', 'details goes here', '1749573411', NULL, NULL, 0, 0, '1', 'PENDING', '1', 1, 0, NULL, NULL, NULL, NULL, '2026-01-14 14:16:03'),
(8, 1, '000', '200', NULL, '092827778827', '092827778827-Mr Solomon', 'okay', '1768225558', NULL, NULL, 0, 0, '1', 'SUBMITTED', '1', NULL, 0, NULL, NULL, NULL, NULL, '2026-01-12 14:13:25'),
(9, 2, '000', '345', NULL, '092827778827', '092827778827-Mr Solomon', 'test', '1768228851', NULL, NULL, 0, 0, '1', 'SUBMITTED', '1', NULL, 0, NULL, NULL, NULL, NULL, '2026-02-04 14:19:51'),
(10, 1, '000', '300', NULL, '092827778827', '092827778827-Mr Solomon', 'a few details', '1768232606', NULL, NULL, 0, 0, '1', 'REJECTED', '1', 0, 0, 'All bad', NULL, NULL, NULL, '2026-01-12 15:48:27'),
(11, 2, '000', '200', NULL, '144200', '', 'Test Request', '1770215032', NULL, NULL, 0, 0, '1', 'SUBMITTED', '1', NULL, 0, NULL, NULL, NULL, NULL, '2026-02-04 14:25:07'),
(12, 2, '000', '300', NULL, '14410020300', '', 'ggg gh hjka', '1770216646', NULL, NULL, 0, 0, '1', 'DRAFT', '1', NULL, 0, NULL, NULL, NULL, NULL, '2026-02-04 14:51:07'),
(13, 5, '000', '500', NULL, '600', '', 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one ', '1770217913', NULL, NULL, 0, 0, '1', 'SUBMITTED', '1', NULL, 0, NULL, NULL, NULL, NULL, '2026-02-06 09:57:27'),
(14, 1, '000', NULL, NULL, NULL, '', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', '1770394377', NULL, NULL, 0, 0, '1', 'DRAFT', '1', NULL, 0, NULL, NULL, NULL, NULL, '2026-02-06 16:13:07'),
(15, 3, '000', '7050', NULL, '14412265452', '', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', '1770394577', NULL, NULL, 0, 0, '1', 'DRAFT', '1', NULL, 0, NULL, NULL, NULL, NULL, '2026-02-06 16:16:21');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
CREATE TABLE IF NOT EXISTS `roles` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'originator', 'web', '2025-01-15 14:24:48', '2025-01-15 14:24:48'),
(2, 'admin', 'web', '2025-01-15 14:24:48', '2025-01-15 14:24:48'),
(3, 'approver', 'web', '2025-01-15 14:24:48', '2025-01-15 14:24:48'),
(4, 'finance', 'web', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `role_has_permissions`
--

DROP TABLE IF EXISTS `role_has_permissions`;
CREATE TABLE IF NOT EXISTS `role_has_permissions` (
  `permission_id` bigint UNSIGNED NOT NULL,
  `role_id` bigint UNSIGNED NOT NULL,
  PRIMARY KEY (`permission_id`,`role_id`),
  KEY `role_has_permissions_role_id_foreign` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('0TYlhETKjk2c6St4bvuI4D2zRrLlndbXfSYdB6ob', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiemJPcXA1cGhWbldhUGt3UmJCUmVYZ3pJZlY3ZThXVVdHSkFZNWxBZyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1739177711),
('Tui5V7oDdGeBItu0otKrxx8PuxrsoCCrayotPUMR', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoidG1wMWs4dHZ6bEE1MjNnSlVqN0w3dHc4a2l1aU9pWDFEbDhqMlJWdCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1739255968),
('VVdr9Emudwh0NTMXYtnaqkzYO81l6vyDvpEKAhCD', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiSm9DVDM5NWY5a2ZpNkZYT2VjSHNtYWZVYVhaR1hLV0MwTXBuM2NlSCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1739257664);

-- --------------------------------------------------------

--
-- Table structure for table `temporary_approvers`
--

DROP TABLE IF EXISTS `temporary_approvers`;
CREATE TABLE IF NOT EXISTS `temporary_approvers` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `doctype_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `permission` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` char(1) COLLATE utf8mb4_unicode_ci NOT NULL,
  `posted_by` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `branch` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rank` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `signature` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` char(1) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `posted_by` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_employee_id_unique` (`employee_id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_phone_unique` (`phone`),
  UNIQUE KEY `users_signature_unique` (`signature`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `employee_id`, `first_name`, `last_name`, `branch`, `email`, `email_verified_at`, `password`, `rank`, `phone`, `signature`, `status`, `remember_token`, `posted_by`, `created_at`, `updated_at`) VALUES
(1, '000000', 'Henry', 'Amoh', NULL, 'hnramoh3@gmail.com', NULL, '$2b$10$Q4LURdbEhoYWetrzeGDHXuWsNBXO/8vJqFC28gJDLhoA7vL5KVtw6', NULL, '0908898877', NULL, '1', NULL, 2, NULL, NULL),
(2, 'P1987001', 'ALFRED', 'JUXON-SMITH', NULL, 'ajuxonsmith@rokelban', NULL, '$2b$10$euUYRblP.IXkF6ixl7rZpOvmoB/BKcudihaIVPSzC4Qo5/3/9JL.m', NULL, '076607454', NULL, '1', NULL, 1, NULL, NULL),
(3, 'P1987003', 'MILLICENT', 'COLE', NULL, 'mkrcole@rokelbank.sl', NULL, '$2b$10$5dJ0QFSXcBTydED3EdbVMO1bMsZm/Q2BadpTrDNMiBhsX/bnMWxN.', NULL, '076660415', NULL, '1', NULL, 1, NULL, NULL),
(4, 'P2006011', 'YUSUF', 'KAMARA', NULL, 'ykamara@rokelbank.sl', NULL, '$2b$10$l3LdzDpqvAM/FodwR2y5X.kAM3.varVqPYGllSUILcruPjBIMDyXi', NULL, '', NULL, '1', NULL, 1, NULL, NULL),
(5, 'P2004004', 'MOHAMED', 'KAMARA', NULL, 'mdkamara@rokelbank.s', NULL, '$2b$10$GWYEEuYEt9Xxj0EZdAeWf.Vh0x7p64pl3cAo4aKQ/64xUrjX6e3a.', NULL, '078343475', NULL, '1', NULL, 1, NULL, NULL),
(6, 'P1990002', 'LOUISE', 'JOHNSON', NULL, 'ljohnson@rokelbank.s', NULL, '$2b$10$e1BBeTbwbgNI4VfHNZwGEOFSQsAJWdxcpK1sF6eIcV2dnNc3jlN/i', NULL, '076705271', NULL, '1', NULL, 1, NULL, NULL),
(7, 'P2000002', 'JOSEPH', 'MICHAEL', NULL, 'jmichael@rokelbank.s', NULL, '$2b$10$pCHpXqKqN3jBEvGTPtsU2u901CneO.OT143/7MfC5tWsXkuw7lJKS', NULL, '078929394', NULL, '1', NULL, 1, NULL, NULL),
(8, '0001', 'henry', 'amoh', NULL, 'henry@gmail.com', NULL, '$2b$10$pO9xo66XzvA0nqxqQzBWZu.suWnRBQYRuFwDyqQ2lbzluMV8OT66i', NULL, '0243069666', NULL, '1', NULL, 1, NULL, NULL),
(9, '0010', 'henry', 'amoh', NULL, 'henry3@gmail.com', NULL, '$2b$10$UEijNWDI7RCs.sLvSjfCGuXPNRmQqVPHJCaL/6jKfhlpPLruXGAoS', NULL, '0243069667', NULL, '1', NULL, 1, NULL, NULL),
(10, '0011', 'henry', 'amoh', NULL, 'henry4@gmail.com', NULL, '$2b$10$zmQAcWwxPdewt8L4kqE4/Oqn2X8FMxUJPFQaTOTfsWvH3nVk/YnbS', NULL, '0243069668', NULL, '1', NULL, 1, NULL, NULL),
(11, 'EMP004', 'Alice', 'Brown', NULL, 'alice.brown@company.com', NULL, '$2b$10$IIEEDDg93PQFTGox7hYn2eADhP5aL1CSwOadVEmZ0Q4jPCEpEBUL6', NULL, '+233004', NULL, '1', NULL, 2, NULL, NULL);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
