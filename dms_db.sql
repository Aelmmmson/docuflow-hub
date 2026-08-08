-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3309
-- Generation Time: Jul 30, 2026 at 05:49 PM
-- Server version: 10.4.14-MariaDB
-- PHP Version: 7.4.10

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

CREATE TABLE `account_setups` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `account_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` char(1) COLLATE utf8mb4_unicode_ci NOT NULL,
  `posted_by` bigint(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CREATE TABLE `approval_activities` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `approved_by` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comment` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recommended_amount` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `doc_id` bigint(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp(),
  `approval_stage` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(27, '2', NULL, NULL, 7, '2026-01-14 14:16:03', '2026-01-14 14:16:03', 1),
(28, '2', 'ok thanks', NULL, 11, '2026-02-07 13:48:51', '2026-02-07 13:48:51', 1),
(29, '6', 'This is okay for approval', NULL, 11, '2026-02-07 14:13:04', '2026-02-07 14:13:04', 1),
(30, '2', 'Let\'s see', NULL, 12, '2026-02-07 14:25:16', '2026-02-07 14:25:16', 1),
(31, '6', 'All good, let\'s see', NULL, 12, '2026-02-07 14:27:07', '2026-02-07 14:27:07', 1),
(32, '2', 'I dont know if this will get lost in the system', NULL, 11, '2026-02-07 14:33:05', '2026-02-07 14:33:05', 2),
(33, '5', 'Good to go', NULL, 11, '2026-02-07 14:35:10', '2026-02-07 14:35:10', 2),
(34, '6', 'This is not right', NULL, 8, '2026-02-09 08:57:33', '2026-02-09 08:57:33', 1),
(35, '4', 'Finance rejected this', NULL, 11, '2026-02-09 11:45:36', '2026-02-09 11:45:36', 3);

-- --------------------------------------------------------

--
-- Table structure for table `approvers`
--

CREATE TABLE `approvers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `branch` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doctype_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `approver_setups`
--

CREATE TABLE `approver_setups` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `branch_id` bigint(20) NOT NULL,
  `doctype_id` bigint(20) NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `posted_by` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audits`
--

CREATE TABLE `audits` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `activity` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `done_by` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `beneficiary_setups`
--

CREATE TABLE `beneficiary_setups` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `beneficiary_name` varchar(255) NOT NULL,
  `account_number` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` char(1) NOT NULL,
  `posted_by` bigint(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `beneficiary_setups`
--

INSERT INTO `beneficiary_setups` (`id`, `beneficiary_name`, `account_number`, `description`, `status`, `posted_by`, `created_at`, `updated_at`) VALUES
(1, 'Mr Solomon', '092827778827', 'This is a test case', '1', 1, NULL, NULL),
(2, 'Kofi Akoto', '0009992938883', 'Head of Pride race plc', '1', 1, NULL, NULL),
(3, 'test', '34567890', 'test desc', '1', 1, NULL, NULL),
(4, 'test', '34567890', 'test desc', '1', 1, NULL, NULL),
(5, 'ertyop', '4567890', 'yuiop', '1', 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `code_creations`
--

CREATE TABLE `code_creations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `posted_by` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CREATE TABLE `code_creation_details` (
  `id` bigint(20) UNSIGNED NOT NULL,
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
  `color_code` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `code_creation_details`
--

INSERT INTO `code_creation_details` (`id`, `code_id`, `description`, `posted_by`, `created_at`, `updated_at`, `status`, `trans_type`, `expense_code`, `account_desc`, `account_number`, `color_code`) VALUES
(1, '2', 'test4', '3', NULL, NULL, '1', '1', NULL, 'test account', '567890', '#9c9175'),
(2, '2', 'ELECTRIC EXPENSES', '1', NULL, NULL, '1', '1', '2', NULL, NULL, '#3a7ef2'),
(3, '2', 'Test one', '1', NULL, NULL, '1', '1', NULL, 'OFFICE RENT - LD-144200000001', '144200000001', '#a8a970'),
(4, '2', 'Test two', '1', NULL, NULL, '1', '1', NULL, 'ASSETS RISK INSURANCE EXPENSE LRD-144000000007', '144000000007', '#b535ef'),
(5, '2', 'test', '3', NULL, NULL, '1', '1', NULL, NULL, NULL, '#6d63d0'),
(6, '2', 'test1', '3', NULL, NULL, '1', '1', NULL, NULL, '567890', '#95b5a2'),
(7, '2', 'test3', '3', NULL, NULL, '1', '1', NULL, 'test account', '567890', '#692490'),
(8, '2', 'Presentation ', '1', NULL, NULL, '1', '0', NULL, NULL, NULL, '#a2a36d');

-- --------------------------------------------------------

--
-- Table structure for table `document_types`
--

CREATE TABLE `document_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `doc_approval_setups`
--

CREATE TABLE `doc_approval_setups` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `doctype_id` bigint(20) NOT NULL,
  `stage_desc` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `approval_stage` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `number_of_approvers` bigint(20) NOT NULL,
  `number_of_mandatory_approvers` bigint(20) NOT NULL,
  `quorum` varchar(11) COLLATE utf8mb4_unicode_ci NOT NULL,
  `approvers` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `details` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `posted_by` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `doc_approval_setups`
--

INSERT INTO `doc_approval_setups` (`id`, `doctype_id`, `stage_desc`, `approval_stage`, `number_of_approvers`, `number_of_mandatory_approvers`, `quorum`, `approvers`, `details`, `posted_by`, `created_at`, `updated_at`) VALUES
(6, 2, 'APPROVAL', '1', 4, 0, '4', '[{\"userId\":2,\"name\":\"ALFRED JUXON-SMITH\",\"isMandatory\":false},{\"userId\":5,\"name\":\"MOHAMED KAMARA\",\"isMandatory\":false},{\"userId\":3,\"name\":\"MILLICENT COLE\",\"isMandatory\":false},{\"userId\":6,\"name\":\"LOUISE JOHNSON\",\"isMandatory\":false}]', '[{\"name\":\"APPROVAL\",\"approvers\":[{\"userId\":2,\"name\":\"ALFRED JUXON-SMITH\",\"isMandatory\":false},{\"userId\":5,\"name\":\"MOHAMED KAMARA\",\"isMandatory\":false},{\"userId\":3,\"name\":\"MILLICENT COLE\",\"isMandatory\":false},{\"userId\":6,\"name\":\"LOUISE JOHNSON\",\"isMandatory\":false}],\"quorum\":\"4\"}]', '1', NULL, NULL),
(11, 5, 'FINAL APPROVAL1', '1', 2, 1, '1', '[{\"userId\":2,\"name\":\"ALFRED JUXON-SMITH\",\"isMandatory\":true},{\"userId\":5,\"name\":\"MOHAMED KAMARA\",\"isMandatory\":false}]', '[{\"name\":\"FINAL APPROVAL1\",\"quorum\":\"1\",\"approvers\":[{\"userId\":2,\"name\":\"ALFRED JUXON-SMITH\",\"isMandatory\":true},{\"userId\":5,\"name\":\"MOHAMED KAMARA\",\"isMandatory\":false}]}]', '1', NULL, NULL),
(14, 1, 'VERIFICATION', '1', 3, 2, '2', '[{\"userId\":2,\"name\":\"ALFRED JUXON-SMITH\",\"isMandatory\":true},{\"userId\":5,\"name\":\"MOHAMED KAMARA\",\"isMandatory\":true},{\"userId\":6,\"name\":\"LOUISE JOHNSON\",\"isMandatory\":false}]', '[{\"name\":\"VERIFICATION\",\"quorum\":\"2\",\"approvers\":[{\"userId\":2,\"name\":\"ALFRED JUXON-SMITH\",\"isMandatory\":true},{\"userId\":5,\"name\":\"MOHAMED KAMARA\",\"isMandatory\":true},{\"userId\":6,\"name\":\"LOUISE JOHNSON\",\"isMandatory\":false}]},{\"name\":\"FINAL APPROVAL1\",\"quorum\":\"2\",\"approvers\":[{\"userId\":2,\"name\":\"ALFRED JUXON-SMITH\",\"isMandatory\":true},{\"userId\":3,\"name\":\"MILLICENT COLE\",\"isMandatory\":false},{\"userId\":5,\"name\":\"MOHAMED KAMARA\",\"isMandatory\":false},{\"userId\":6,\"name\":\"LOUISE JOHNSON\",\"isMandatory\":false}]}]', '1', NULL, NULL),
(15, 1, 'FINAL APPROVAL1', '2', 4, 1, '2', '[{\"userId\":2,\"name\":\"ALFRED JUXON-SMITH\",\"isMandatory\":true},{\"userId\":3,\"name\":\"MILLICENT COLE\",\"isMandatory\":false},{\"userId\":5,\"name\":\"MOHAMED KAMARA\",\"isMandatory\":false},{\"userId\":6,\"name\":\"LOUISE JOHNSON\",\"isMandatory\":false}]', '[{\"name\":\"VERIFICATION\",\"quorum\":\"2\",\"approvers\":[{\"userId\":2,\"name\":\"ALFRED JUXON-SMITH\",\"isMandatory\":true},{\"userId\":5,\"name\":\"MOHAMED KAMARA\",\"isMandatory\":true},{\"userId\":6,\"name\":\"LOUISE JOHNSON\",\"isMandatory\":false}]},{\"name\":\"FINAL APPROVAL1\",\"quorum\":\"2\",\"approvers\":[{\"userId\":2,\"name\":\"ALFRED JUXON-SMITH\",\"isMandatory\":true},{\"userId\":3,\"name\":\"MILLICENT COLE\",\"isMandatory\":false},{\"userId\":5,\"name\":\"MOHAMED KAMARA\",\"isMandatory\":false},{\"userId\":6,\"name\":\"LOUISE JOHNSON\",\"isMandatory\":false}]}]', '1', NULL, NULL),
(16, 8, 'Verification ', '1', 3, 1, '2', '[{\"userId\":2,\"name\":\"ALFRED JUXON-SMITH\",\"isMandatory\":false},{\"userId\":3,\"name\":\"MILLICENT COLE\",\"isMandatory\":true},{\"userId\":5,\"name\":\"MOHAMED KAMARA\",\"isMandatory\":false}]', '[{\"name\":\"Verification \",\"quorum\":\"2\",\"approvers\":[{\"userId\":2,\"name\":\"ALFRED JUXON-SMITH\",\"isMandatory\":false},{\"userId\":3,\"name\":\"MILLICENT COLE\",\"isMandatory\":true},{\"userId\":5,\"name\":\"MOHAMED KAMARA\",\"isMandatory\":false}]}]', '1', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `doc_approvers`
--

CREATE TABLE `doc_approvers` (
  `id` bigint(10) NOT NULL,
  `doctype_id` bigint(20) NOT NULL,
  `approver_id` bigint(20) NOT NULL,
  `is_mandatory` tinyint(1) NOT NULL,
  `approval_stage` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `doc_approvers`
--

INSERT INTO `doc_approvers` (`id`, `doctype_id`, `approver_id`, `is_mandatory`, `approval_stage`, `created_at`, `updated_at`) VALUES
(15, 3, 3, 1, '1', '2025-03-26 13:02:03', '2025-03-26 13:02:03'),
(16, 3, 5, 0, '1', '2025-03-26 13:02:03', '2025-03-26 13:02:03'),
(17, 3, 6, 0, '1', '2025-03-26 13:02:03', '2025-03-26 13:02:03'),
(18, 4, 3, 0, '1', '2025-04-01 19:29:51', '2025-04-01 19:29:51'),
(25, 6, 2, 1, '1', '2025-04-28 10:56:06', '2025-04-28 10:56:06'),
(26, 6, 3, 0, '1', '2025-04-28 10:56:06', '2025-04-28 10:56:06'),
(27, 6, 5, 0, '1', '2025-04-28 10:56:06', '2025-04-28 10:56:06'),
(28, 6, 6, 0, '1', '2025-04-28 10:56:06', '2025-04-28 10:56:06'),
(29, 6, 2, 0, '2', '2025-04-28 10:56:06', '2025-04-28 10:56:06'),
(30, 6, 3, 1, '2', '2025-04-28 10:56:06', '2025-04-28 10:56:06'),
(31, 6, 5, 0, '2', '2025-04-28 10:56:06', '2025-04-28 10:56:06'),
(32, 6, 6, 1, '2', '2025-04-28 10:56:06', '2025-04-28 10:56:06'),
(56, 2, 2, 0, '1', '2026-01-30 15:53:56', '2026-01-30 15:53:56'),
(57, 2, 5, 0, '1', '2026-01-30 15:53:56', '2026-01-30 15:53:56'),
(58, 2, 3, 0, '1', '2026-01-30 15:53:56', '2026-01-30 15:53:56'),
(59, 2, 6, 0, '1', '2026-01-30 15:53:56', '2026-01-30 15:53:56'),
(74, 5, 2, 1, '1', '2026-02-03 09:25:54', '2026-02-03 09:25:54'),
(75, 5, 5, 0, '1', '2026-02-03 09:25:54', '2026-02-03 09:25:54'),
(83, 1, 2, 1, '1', '2026-02-07 14:31:39', '2026-02-07 14:31:39'),
(84, 1, 5, 1, '1', '2026-02-07 14:31:39', '2026-02-07 14:31:39'),
(85, 1, 6, 0, '1', '2026-02-07 14:31:39', '2026-02-07 14:31:39'),
(86, 1, 2, 1, '2', '2026-02-07 14:31:39', '2026-02-07 14:31:39'),
(87, 1, 3, 0, '2', '2026-02-07 14:31:39', '2026-02-07 14:31:39'),
(88, 1, 5, 0, '2', '2026-02-07 14:31:39', '2026-02-07 14:31:39'),
(89, 1, 6, 0, '2', '2026-02-07 14:31:39', '2026-02-07 14:31:39'),
(90, 8, 2, 0, '1', '2026-02-09 15:21:06', '2026-02-09 15:21:06'),
(91, 8, 3, 1, '1', '2026-02-09 15:21:06', '2026-02-09 15:21:06'),
(92, 8, 5, 0, '1', '2026-02-09 15:21:06', '2026-02-09 15:21:06');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CREATE TABLE `model_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `model_has_roles`
--

CREATE TABLE `model_has_roles` (
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `model_has_roles`
--

INSERT INTO `model_has_roles` (`role_id`, `model_type`, `model_id`) VALUES
(1, 'AppModelsUser', 7),
(2, 'AppModelsUser', 1),
(2, 'AppModelsUser', 8),
(2, 'AppModelsUser', 9),
(2, 'AppModelsUser', 10),
(3, 'AppModelsUser', 2),
(3, 'AppModelsUser', 3),
(3, 'AppModelsUser', 5),
(3, 'AppModelsUser', 6),
(4, 'AppModelsUser', 4);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `password_reset_tokens`
--

INSERT INTO `password_reset_tokens` (`email`, `token`, `created_at`) VALUES
('hnramoh3@gmail.com', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhucmFtb2gzQGdtYWlsLmNvbSIsImlhdCI6MTc4NTQyMTg1NywiZXhwIjoxNzg1NDI1NDU3fQ.JanCEiZj453fduYqm-qidksbxIvWi3KRlB9balR4las', NULL),
('mkrcole@rokelbank.sl', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1rcmNvbGVAcm9rZWxiYW5rLnNsIiwiaWF0IjoxNzcwNjUxNzQ0LCJleHAiOjE3NzA2NTUzNDR9.rFOp70fF_6WVcJ-9Qe9vyWrsHyfZ7-z7YPNk98lyeAA', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CREATE TABLE `request_documents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `doctype_id` bigint(20) NOT NULL,
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
  `is_approved` tinyint(1) NOT NULL DEFAULT 0,
  `posted_by` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `approval_stage` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '1',
  `current_approvers` int(11) DEFAULT NULL,
  `is_required_approvers_left` tinyint(1) NOT NULL DEFAULT 0,
  `decline_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp(),
  `stage_updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(8, 1, '000', '200', NULL, '092827778827', '092827778827-Mr Solomon', 'okay', '1768225558', NULL, NULL, 0, 0, '1', 'REJECTED', '1', 0, 0, 'This is not right', NULL, NULL, NULL, '2026-02-09 08:57:33'),
(9, 2, '000', '345', NULL, '092827778827', '092827778827-Mr Solomon', 'test', '1768228851', NULL, NULL, 0, 0, '1', 'DRAFT', '1', NULL, 0, NULL, NULL, NULL, NULL, '2026-01-12 14:41:15'),
(10, 1, '000', '300', NULL, '092827778827', '092827778827-Mr Solomon', 'a few details', '1768232606', NULL, NULL, 0, 0, '1', 'REJECTED', '1', 0, 0, 'All bad', NULL, NULL, NULL, '2026-01-12 15:48:27'),
(11, 1, '000', '500', '300', NULL, '', 'This is just another test approval purpose', '1770467245', NULL, NULL, 0, 0, '1', 'REJECTED', '3', 0, 0, 'Finance rejected this', NULL, '2026-02-07 12:27:26', '2026-02-07 12:27:26', '2026-02-09 11:45:36'),
(12, 1, '000', '350', '200', NULL, '', 'Another test of the approval setup', '1770474182', NULL, NULL, 0, 0, '1', 'PENDING', '2', 0, 0, NULL, NULL, '2026-02-07 14:23:04', '2026-02-07 14:23:04', '2026-02-07 14:27:07'),
(13, 4, '000', '1234', NULL, 'Dr Sam', '', 'Test for originator', '1770495041', NULL, NULL, 0, 0, '7', 'SUBMITTED', '1', NULL, 0, NULL, NULL, '2026-02-07 20:10:51', '2026-02-07 20:10:51', '2026-02-07 20:11:03'),
(14, 8, '000', NULL, NULL, NULL, '', 'This a test document', '1770650698', NULL, NULL, 0, 0, '1', 'DRAFT', '1', NULL, 0, NULL, NULL, '2026-02-09 15:25:32', '2026-02-09 15:25:32', '2026-02-09 15:25:32');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CREATE TABLE `role_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `temporary_approvers`
--

CREATE TABLE `temporary_approvers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `doctype_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` bigint(20) NOT NULL,
  `permission` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` char(1) COLLATE utf8mb4_unicode_ci NOT NULL,
  `posted_by` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
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
  `posted_by` bigint(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `employee_id`, `first_name`, `last_name`, `branch`, `email`, `email_verified_at`, `password`, `rank`, `phone`, `signature`, `status`, `remember_token`, `posted_by`, `created_at`, `updated_at`) VALUES
(1, 'UNIONADMIN', 'henry', 'amoh', NULL, 'hnramoh3@gmail.com', NULL, '$2b$10$Q4LURdbEhoYWetrzeGDHXuWsNBXO/8vJqFC28gJDLhoA7vL5KVtw6', NULL, '0908898877', NULL, '1', NULL, 1, NULL, NULL),
(2, 'P1987001', 'ALFRED', 'JUXON-SMITH', NULL, 'ajuxonsmith@rokelban', NULL, '$2b$10$euUYRblP.IXkF6ixl7rZpOvmoB/BKcudihaIVPSzC4Qo5/3/9JL.m', NULL, '076607454', NULL, '1', NULL, 1, NULL, NULL),
(3, 'P1987003', 'MILLICENT', 'COLE', NULL, 'mkrcole@rokelbank.sl', NULL, '$2b$10$5dJ0QFSXcBTydED3EdbVMO1bMsZm/Q2BadpTrDNMiBhsX/bnMWxN.', NULL, '076660415', NULL, '1', NULL, 1, NULL, NULL),
(4, 'P2006011', 'YUSUF', 'KAMARA', NULL, 'ykamara@rokelbank.sl', NULL, '$2b$10$l3LdzDpqvAM/FodwR2y5X.kAM3.varVqPYGllSUILcruPjBIMDyXi', NULL, '', NULL, '1', NULL, 1, NULL, NULL),
(5, 'P2004004', 'MOHAMED', 'KAMARA', NULL, 'mdkamara@rokelbank.s', NULL, '$2b$10$GWYEEuYEt9Xxj0EZdAeWf.Vh0x7p64pl3cAo4aKQ/64xUrjX6e3a.', NULL, '078343475', NULL, '1', NULL, 1, NULL, NULL),
(6, 'P1990002', 'LOUISE', 'JOHNSON', NULL, 'ljohnson@rokelbank.s', NULL, '$2b$10$e1BBeTbwbgNI4VfHNZwGEOFSQsAJWdxcpK1sF6eIcV2dnNc3jlN/i', NULL, '076705271', NULL, '1', NULL, 1, NULL, NULL),
(7, 'P2000002', 'JOSEPH', 'MICHAEL', NULL, 'jmichael@rokelbank.s', NULL, '$2b$10$pCHpXqKqN3jBEvGTPtsU2u901CneO.OT143/7MfC5tWsXkuw7lJKS', NULL, '078929394', NULL, '1', NULL, 1, NULL, NULL),
(8, '0001', 'henry', 'amoh', NULL, 'henry@gmail.com', NULL, '$2b$10$pO9xo66XzvA0nqxqQzBWZu.suWnRBQYRuFwDyqQ2lbzluMV8OT66i', NULL, '0243069666', NULL, '1', NULL, 1, NULL, NULL),
(9, '0010', 'henry', 'amoh', NULL, 'henry3@gmail.com', NULL, '$2b$10$UEijNWDI7RCs.sLvSjfCGuXPNRmQqVPHJCaL/6jKfhlpPLruXGAoS', NULL, '0243069667', NULL, '1', NULL, 1, NULL, NULL),
(10, '0011', 'henry', 'amoh', NULL, 'henry4@gmail.com', NULL, '$2b$10$zmQAcWwxPdewt8L4kqE4/Oqn2X8FMxUJPFQaTOTfsWvH3nVk/YnbS', NULL, '0243069668', NULL, '1', NULL, 1, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `account_setups`
--
ALTER TABLE `account_setups`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `approval_activities`
--
ALTER TABLE `approval_activities`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `approvers`
--
ALTER TABLE `approvers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `approver_setups`
--
ALTER TABLE `approver_setups`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `audits`
--
ALTER TABLE `audits`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `beneficiary_setups`
--
ALTER TABLE `beneficiary_setups`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `code_creations`
--
ALTER TABLE `code_creations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `code_creation_details`
--
ALTER TABLE `code_creation_details`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `document_types`
--
ALTER TABLE `document_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `doc_approval_setups`
--
ALTER TABLE `doc_approval_setups`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `doc_approvers`
--
ALTER TABLE `doc_approvers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  ADD KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  ADD KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `request_documents`
--
ALTER TABLE `request_documents`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `role_has_permissions_role_id_foreign` (`role_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `temporary_approvers`
--
ALTER TABLE `temporary_approvers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_employee_id_unique` (`employee_id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_phone_unique` (`phone`),
  ADD UNIQUE KEY `users_signature_unique` (`signature`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `account_setups`
--
ALTER TABLE `account_setups`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `approval_activities`
--
ALTER TABLE `approval_activities`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `approvers`
--
ALTER TABLE `approvers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `approver_setups`
--
ALTER TABLE `approver_setups`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `audits`
--
ALTER TABLE `audits`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `beneficiary_setups`
--
ALTER TABLE `beneficiary_setups`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `code_creations`
--
ALTER TABLE `code_creations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `code_creation_details`
--
ALTER TABLE `code_creation_details`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `document_types`
--
ALTER TABLE `document_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `doc_approval_setups`
--
ALTER TABLE `doc_approval_setups`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `doc_approvers`
--
ALTER TABLE `doc_approvers`
  MODIFY `id` bigint(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=93;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `request_documents`
--
ALTER TABLE `request_documents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `temporary_approvers`
--
ALTER TABLE `temporary_approvers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

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
