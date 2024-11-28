-- --------------------------------------------------------
-- 호스트:                          stg-yswa-kr-practice-db-master.mariadb.database.azure.com
-- 서버 버전:                        10.3.23-MariaDB - MariaDB Server
-- 서버 OS:                        Win64
-- HeidiSQL 버전:                  12.6.0.6765
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- s11p31s108 데이터베이스 구조 내보내기
CREATE DATABASE IF NOT EXISTS `s11p31s108` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin */;
USE `s11p31s108`;

-- 테이블 s11p31s108.departments 구조 내보내기
CREATE TABLE IF NOT EXISTS `departments` (
  `department_id` int(11) NOT NULL AUTO_INCREMENT,
  `department_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`department_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- 테이블 데이터 s11p31s108.departments:~6 rows (대략적) 내보내기
INSERT INTO `departments` (`department_id`, `department_name`) VALUES
	(1, 'Human Resource'),
	(2, 'Research and Development'),
	(3, 'Production Management'),
	(4, 'Production Technology'),
	(5, 'Computer'),
	(6, 'Quality Control');

-- 테이블 s11p31s108.users 구조 내보내기
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_bin NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_bin NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_bin NOT NULL,
  `duty` varchar(255) COLLATE utf8mb4_bin NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_bin NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `is_supervised` tinyint(4) NOT NULL,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_users_department` (`department_id`),
  CONSTRAINT `fk_users_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- 테이블 데이터 s11p31s108.users:~10 rows (대략적) 내보내기
INSERT INTO `users` (`user_id`, `name`, `email`, `password`, `duty`, `location`, `department_id`, `is_supervised`, `created_at`, `updated_at`) VALUES
	(1, '김싸피', 'test0@tmail.ws', '$2b$12$siPPxcIVxeLP3gIsRHEyG.fEHWrsdux9.gCYVikFvQZqyS73YvyMO', '팀장', 'Zone A', 1, 1, '2024-11-07 10:59:40', '2024-11-08 10:56:30'),
	(2, '이싸피', 'test1@tmail.ws', '$2b$12$1nnsMYjJwunR2wY6YspEV.VY3hzLfuaZBB8LV.4qnq1U/yjdRy.CG', '팀장', 'Zone B', 2, 0, '2024-11-07 10:59:40', '2024-11-07 10:59:40'),
	(3, '최싸피', 'test2@tmail.ws', '$2b$12$TKL0fSFpZNWF4Uuo4MgU2u5Yd0uShxQK9aRQS06iKTy29P09eC1aS', '팀장', 'Zone C', 1, 1, '2024-11-07 10:59:40', '2024-11-07 10:59:40'),
	(4, '박싸피', 'test3@tmail.ws', '$2b$12$wh2zAwNzaG2g8rUN4NvxEur/6thLfR6Wx2dIyz3zgY4eTHKtsmuSS', '팀장', 'Zone D', 4, 0, '2024-11-07 10:59:40', '2024-11-07 10:59:40'),
	(5, '강싸피', 'test4@tmail.ws', '$2b$12$CtCUOBXipsbNMi1m3Jcww.NN2Lwdh.gPkfg4V0h2rgDqzGGwdlvAG', '팀장', 'Zone E', 5, 1, '2024-11-07 10:59:40', '2024-11-07 10:59:40'),
	(6, '윤싸피', 'test5@tmail.ws', '$2b$12$vJ.OlQnB1XMBvfb0UiCNveoanHzDAiMKWjJFDAI05eZcTsZZ2ozwa', '팀장', 'Zone F', 6, 0, '2024-11-07 10:59:40', '2024-11-07 10:59:40'),
	(8, 'tester', 'test1@teml.net', '$2b$12$iGzvpLmmEMYgVMApPPTgGus2Esht0Vt4.Ut.RngZHX3rGyfrUipq2', 'test', 'test', 1, 0, '2024-11-08 16:58:51', '2024-11-08 16:58:51'),
	(9, 'change_test', 'e36f7658ea93@drmail.in', '$2b$12$I2yljJMkF71W2cbiY.0eHe4P/gMgha6WZDftoVFoLbG32GRNbn9Mu', 'string', 'string', 1, 0, '2024-11-08 17:06:24', '2024-11-08 17:10:06'),
	(10, '김싸피생', 'bolemo7244@gianes.com', '$2b$12$YjC9iRbDBBEMHJNqIQyx4upbtjaMZ3LVNiD9ed2TZ5lqYzcczXwgi', '싸피생', '구미', 3, 0, '2024-11-17 08:55:07', '2024-11-17 08:55:07'),
	(11, '이싸피', 'siwij70232@inikale.com', '$2b$12$Kozk53yNLGGgZ/CZNtIpiOd/yGB1VGUy3UXlMjywXXTCUL2d0DgHq', '싸피생', '구미', 5, 0, '2024-11-18 06:42:59', '2024-11-18 06:42:59');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
