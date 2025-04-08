CREATE DATABASE  IF NOT EXISTS `diplom_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `diplom_db`;
-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: diplom_db
-- ------------------------------------------------------
-- Server version	8.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `api_user`
--

DROP TABLE IF EXISTS `api_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `api_user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `last_login` datetime(6) DEFAULT NULL,
  `firstname` varchar(100) NOT NULL,
  `lastname` varchar(100) NOT NULL,
  `middlename` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `is_admin` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `api_user`
--

LOCK TABLES `api_user` WRITE;
/*!40000 ALTER TABLE `api_user` DISABLE KEYS */;
INSERT INTO `api_user` VALUES (6,'2025-03-09 23:36:14.401544','qwe','qwe','','kovitalij50@gmail.com','pbkdf2_sha256$870000$lzxgmA9uKAf7P9fi9PYj8j$LnJeshDgcaXcMoFQTGAOgWfyU+24Svp9vwVYBv6/P9s=',1,1),(7,'2025-03-03 09:06:36.817177','V1tec0','qwe','','abcihbava@gmail.com','pbkdf2_sha256$870000$C2N4uL2bAdaz4682WEohdS$olOLrOw7oXGViuaT9b3/D6HuOwvOccNtx/HlAkzoB+4=',0,0);
/*!40000 ALTER TABLE `api_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',2,'add_permission'),(6,'Can change permission',2,'change_permission'),(7,'Can delete permission',2,'delete_permission'),(8,'Can view permission',2,'view_permission'),(9,'Can add group',3,'add_group'),(10,'Can change group',3,'change_group'),(11,'Can delete group',3,'delete_group'),(12,'Can view group',3,'view_group'),(13,'Can add content type',4,'add_contenttype'),(14,'Can change content type',4,'change_contenttype'),(15,'Can delete content type',4,'delete_contenttype'),(16,'Can view content type',4,'view_contenttype'),(17,'Can add session',5,'add_session'),(18,'Can change session',5,'change_session'),(19,'Can delete session',5,'delete_session'),(20,'Can view session',5,'view_session'),(21,'Can add image',6,'add_image'),(22,'Can change image',6,'change_image'),(23,'Can delete image',6,'delete_image'),(24,'Can view image',6,'view_image'),(25,'Can add message',7,'add_message'),(26,'Can change message',7,'change_message'),(27,'Can delete message',7,'delete_message'),(28,'Can view message',7,'view_message'),(29,'Can add news',8,'add_news'),(30,'Can change news',8,'change_news'),(31,'Can delete news',8,'delete_news'),(32,'Can view news',8,'view_news'),(33,'Can add user',9,'add_user'),(34,'Can change user',9,'change_user'),(35,'Can delete user',9,'delete_user'),(36,'Can view user',9,'view_user'),(37,'Can add user',10,'add_user'),(38,'Can change user',10,'change_user'),(39,'Can delete user',10,'delete_user'),(40,'Can view user',10,'view_user');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bell_schedule`
--

DROP TABLE IF EXISTS `bell_schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bell_schedule` (
  `id` int NOT NULL AUTO_INCREMENT,
  `template_id` int NOT NULL,
  `bell_type` enum('lesson','break') NOT NULL,
  `scheduled_time` time NOT NULL,
  `message` text NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_template` (`template_id`),
  CONSTRAINT `fk_template` FOREIGN KEY (`template_id`) REFERENCES `bell_template` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bell_schedule`
--

LOCK TABLES `bell_schedule` WRITE;
/*!40000 ALTER TABLE `bell_schedule` DISABLE KEYS */;
INSERT INTO `bell_schedule` VALUES (1,1,'lesson','02:00:00','Звонок на урок',1),(2,1,'break','02:05:00','Звонок на перемену',1);
/*!40000 ALTER TABLE `bell_schedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bell_template`
--

DROP TABLE IF EXISTS `bell_template`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bell_template` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `is_active` tinyint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bell_template`
--

LOCK TABLES `bell_template` WRITE;
/*!40000 ALTER TABLE `bell_template` DISABLE KEYS */;
INSERT INTO `bell_template` VALUES (1,'Обычное расписание','qweqweqwe',1),(2,'Сокращенное расписание 1','пары по 1 часу',0);
/*!40000 ALTER TABLE `bell_template` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `displayed_news`
--

DROP TABLE IF EXISTS `displayed_news`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `displayed_news` (
  `fk_news` int unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`fk_news`),
  KEY `fk_table1_news1_idx` (`fk_news`),
  CONSTRAINT `fk_table1_news1` FOREIGN KEY (`fk_news`) REFERENCES `news` (`pk_news`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `displayed_news`
--

LOCK TABLES `displayed_news` WRITE;
/*!40000 ALTER TABLE `displayed_news` DISABLE KEYS */;
INSERT INTO `displayed_news` VALUES (18,'2025-03-05 20:38:10',3),(20,'2025-03-05 20:38:10',4),(21,'2025-03-05 20:38:10',0),(26,'2025-03-05 20:38:10',1),(27,'2025-03-05 20:38:10',2),(28,'2025-03-05 20:38:10',5);
/*!40000 ALTER TABLE `displayed_news` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_admin_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint unsigned NOT NULL,
  `change_message` longtext NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_api_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_api_user_id` FOREIGN KEY (`user_id`) REFERENCES `api_user` (`id`),
  CONSTRAINT `django_admin_log_chk_1` CHECK ((`action_flag` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (1,'admin','logentry'),(6,'api','image'),(7,'api','message'),(8,'api','news'),(9,'api','user'),(3,'auth','group'),(2,'auth','permission'),(10,'auth','user'),(4,'contenttypes','contenttype'),(5,'sessions','session');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2024-12-13 21:59:28.889864'),(2,'api','0001_initial','2024-12-13 21:59:28.949804'),(3,'admin','0001_initial','2024-12-13 21:59:29.231634'),(4,'admin','0002_logentry_remove_auto_add','2024-12-13 21:59:29.241781'),(5,'admin','0003_logentry_add_action_flag_choices','2024-12-13 21:59:29.250796'),(6,'contenttypes','0002_remove_content_type_name','2024-12-13 21:59:29.446317'),(7,'auth','0001_initial','2024-12-13 21:59:29.959817'),(8,'auth','0002_alter_permission_name_max_length','2024-12-13 21:59:30.078747'),(9,'auth','0003_alter_user_email_max_length','2024-12-13 21:59:30.088635'),(10,'auth','0004_alter_user_username_opts','2024-12-13 21:59:30.098168'),(11,'auth','0005_alter_user_last_login_null','2024-12-13 21:59:30.109789'),(12,'auth','0006_require_contenttypes_0002','2024-12-13 21:59:30.115076'),(13,'auth','0007_alter_validators_add_error_messages','2024-12-13 21:59:30.124839'),(14,'auth','0008_alter_user_username_max_length','2024-12-13 21:59:30.136714'),(15,'auth','0009_alter_user_last_name_max_length','2024-12-13 21:59:30.151291'),(16,'auth','0010_alter_group_name_max_length','2024-12-13 21:59:30.293301'),(17,'auth','0011_update_proxy_permissions','2024-12-13 21:59:30.310235'),(18,'auth','0012_alter_user_first_name_max_length','2024-12-13 21:59:30.323517'),(19,'sessions','0001_initial','2024-12-13 21:59:30.389617'),(20,'api','0002_rename_first_name_user_firstname_and_more','2024-12-18 12:08:08.031030');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
INSERT INTO `django_session` VALUES ('nppmj2swrbblvgh880sz7ua4qr1eycbn','.eJxVjMsOwiAQRf-FtSFDebS4dO83kIEZpGogKe3K-O_apAvd3nPOfYmA21rC1nkJM4mzcOL0u0VMD647oDvWW5Op1XWZo9wVedAur434eTncv4OCvXzr0SpPbBICkWeTx8FZx5NTYIesFFubFEAGnWOcsrImE2sDBBo9GELx_gDfETfE:1tnRGe:8oOiN1YfOa1n88nkSoCi-OygJD_OufQNdrdy-pz5PS4','2025-03-12 23:56:44.715835'),('rw5aesnntszmnmi01fai0h676r39rt6m','.eJxVjMsOwiAQRf-FtSFDebS4dO83kIEZpGogKe3K-O_apAvd3nPOfYmA21rC1nkJM4mzcOL0u0VMD647oDvWW5Op1XWZo9wVedAur434eTncv4OCvXzr0SpPbBICkWeTx8FZx5NTYIesFFubFEAGnWOcsrImE2sDBBo9GELx_gDfETfE:1trQBq:ruFmm8QLWrQgklBuWo5Ub0j5EbHgnB5AWB6Aq6Ekjg4','2025-03-23 23:36:14.412783');
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `image`
--

DROP TABLE IF EXISTS `image`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `image` (
  `pk_image` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(45) NOT NULL,
  `fk_news` int unsigned NOT NULL,
  PRIMARY KEY (`pk_image`),
  KEY `fk_image_news_idx` (`fk_news`),
  CONSTRAINT `fk_image_news` FOREIGN KEY (`fk_news`) REFERENCES `news` (`pk_news`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `image`
--

LOCK TABLES `image` WRITE;
/*!40000 ALTER TABLE `image` DISABLE KEYS */;
INSERT INTO `image` VALUES (15,'18_b8dffc25.jpg',18),(16,'18_b7380ab8.jpg',18),(19,'20_9eff3fda.jpg',20),(20,'20_a8d0cb07.jpg',20),(21,'21_9b979c9a.bin',21),(24,'27_4e7b7f16.png',27),(25,'28_c278367d.png',28);
/*!40000 ALTER TABLE `image` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message`
--

DROP TABLE IF EXISTS `message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `message` (
  `pk_message` int unsigned NOT NULL AUTO_INCREMENT,
  `text` text NOT NULL,
  `isprimary` tinyint NOT NULL,
  `isshowing` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`pk_message`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message`
--

LOCK TABLES `message` WRITE;
/*!40000 ALTER TABLE `message` DISABLE KEYS */;
INSERT INTO `message` VALUES (13,'Тестовое сообщение',0,0),(14,'Тестовое сообщение',1,0),(21,'Звонок на перемену',0,0),(22,'Звонок на урок',0,0);
/*!40000 ALTER TABLE `message` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `news`
--

DROP TABLE IF EXISTS `news`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `news` (
  `pk_news` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `small_text` text NOT NULL,
  `main_text` text NOT NULL,
  PRIMARY KEY (`pk_news`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news`
--

LOCK TABLES `news` WRITE;
/*!40000 ALTER TABLE `news` DISABLE KEYS */;
INSERT INTO `news` VALUES (18,'Новое расписание и изменения в учебном процессе','Важные изменения в расписании занятий для студентов всех факультетов.\nСледите за новостями на сайте.','С 1 января вступает в силу обновлённое расписание занятий для всех курсов и факультетов. Основные изменения включают:\n1. Увеличение перерывов между парами до 15 минут.\n2. Добавление нового предмета для старших курсов.\nПросим внимательно следить за обновлениями на информационных табло.'),(20,'впрверптвшгпрвешк','Ыгпаыукнапуарущнапаапгзркапгкрпкпри\nЫугшапу8анпка8укнра9ш','lksrgfuyfbrkhbdrudfk'),(21,'eqweqwe','fthytjkyhikjfhxhdxhx','fthytjkyhikjfhxhdxhxfthytjkyhikjfhxhdxhxfthytjkyhikjfhxhdxhx'),(26,'qweqwe','qweqweqwe','qweqweqweqweqwe'),(27,'dfsrfsrfa','sgrgasffsaf','sgrssefrgdgrs'),(28,'dcdcxdxfv','bfgbgbgbg','bgbgbgb');
/*!40000 ALTER TABLE `news` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'diplom_db'
--

--
-- Dumping routines for database 'diplom_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-11  8:33:12
