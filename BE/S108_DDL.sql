USE s11p31s108;

-- 1. departments 테이블 생성
CREATE TABLE `departments` (
  `department_id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `department_name` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
);

-- 2. users 테이블 생성
CREATE TABLE `users` (
  `user_id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL ,
  `email` VARCHAR(255) NOT NULL UNIQUE ,
  `password` VARCHAR(255) NOT NULL,
  `duty` VARCHAR(255) NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `department` INTEGER,
  `is_supervised` TINYINT NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  CONSTRAINT `fk_users_department` FOREIGN KEY (`department`) REFERENCES `departments` (`department_id`) ON DELETE SET NULL
);

-- 3. images 테이블 생성
CREATE TABLE `images` (
  `image_id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `metadata_id` VARCHAR(255), -- MongoDB 참조
  `feature_id` VARCHAR(255), -- MongoDB 참조
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL
);

-- 4. projects 테이블 생성
CREATE TABLE `projects` (
  `project_id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `user_id` INTEGER,
  `permission_id` VARCHAR(255), -- MongoDB 참조
  `project_name` VARCHAR(255) NOT NULL ,
  `model_name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `is_private` TINYINT NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  CONSTRAINT `fk_projects_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
);

-- 5. project_image 테이블 생성
CREATE TABLE  `project_image` (
    project_image INTEGER PRIMARY KEY AUTO_INCREMENT,
    project_id INTEGER NOT NULL ,
    image_id INTEGER NOT NULL ,
    CONSTRAINT `fk_project_image_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_project_image_image` FOREIGN KEY (`image_id`) REFERENCES `images` (`image_id`) ON DELETE CASCADE
);

-- 6. tags 테이블 생성
CREATE TABLE `tags` (
  `tag_id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `tag_name` VARCHAR(255) NOT NULL ,
  `tag_type` ENUM('YEAR', 'MONTH', 'MODEL', 'TASK', 'BRANCH', 'LOCATION', 'EQUIPMENT', 'USER', 'PREDICTION') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL
);

-- 7. image_tag 테이블 생성
CREATE TABLE `image_tag` (
  `image_tag_id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `tag_id` INTEGER NOT NULL,
  `image_id` INTEGER NOT NULL,
  CONSTRAINT `fk_image_tag_image` FOREIGN KEY (`image_id`) REFERENCES `images` (`image_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_image_tag_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`tag_id`) ON DELETE CASCADE
);

-- 8. histories 테이블 생성
CREATE TABLE `histories` (
  `history_id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `project_id` INTEGER NOT NULL ,
  `user_id` INTEGER,
  `history_name` VARCHAR(255) NOT NULL,
  `history_obj_id` VARCHAR(255), -- MongoDB 참조
  `is_private` TINYINT NOT NULL,
  `is_done` TINYINT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  CONSTRAINT `fk_histories_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_histories_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`) ON DELETE CASCADE
);

-- 9. upload_batches 테이블 생성
CREATE TABLE `upload_batches`(
  `upload_batch_id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `user_id` INTEGER,
  `project_id` INTEGER,
  `is_done` TINYINT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  CONSTRAINT `fk_upload_batches_user` FOREIGN KEY upload_batches (`user_id`) REFERENCES users (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_upload_batches_project` FOREIGN KEY upload_batches (`project_id`) REFERENCES projects (`project_id`) ON DELETE CASCADE
);