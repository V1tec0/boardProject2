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
  `activation_code` varchar(6) DEFAULT NULL,
  `reset_code` varchar(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `api_user`
--

LOCK TABLES `api_user` WRITE;
/*!40000 ALTER TABLE `api_user` DISABLE KEYS */;
INSERT INTO `api_user` VALUES (6,'2025-05-08 16:32:28.783790','qwe1qwe','qwe','','kovitalij50@gmail.com','pbkdf2_sha256$1000000$HYm9FToCrGL3P2EtgarHvW$2I1RiPPKNp6tUUblz1KpHwp1q13iD+ECEpkmfdADzhc=',1,1,NULL,NULL),(7,'2025-05-02 21:40:01.647341','V1tec0000','qwe','','abcihbava@gmail.com','pbkdf2_sha256$1000000$2e9uNGtCM1SPDiZfDI6dv4$ErrHVXKg2zL2V0Qt2/jJcPAacgwAR1w4V/emsp6zi/s=',1,0,NULL,NULL),(16,'2025-05-01 23:40:09.197449','V1tec0','qweqweqwe','','kovitalij50@googlemail.com','pbkdf2_sha256$1000000$6rQXm55OxC7SOZC3FPrdlM$bpdNv6L+RrsFi+ctZGRXOJXir2xxE3Igc4XgEddSDjs=',1,0,NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',2,'add_permission'),(6,'Can change permission',2,'change_permission'),(7,'Can delete permission',2,'delete_permission'),(8,'Can view permission',2,'view_permission'),(9,'Can add group',3,'add_group'),(10,'Can change group',3,'change_group'),(11,'Can delete group',3,'delete_group'),(12,'Can view group',3,'view_group'),(13,'Can add content type',4,'add_contenttype'),(14,'Can change content type',4,'change_contenttype'),(15,'Can delete content type',4,'delete_contenttype'),(16,'Can view content type',4,'view_contenttype'),(17,'Can add session',5,'add_session'),(18,'Can change session',5,'change_session'),(19,'Can delete session',5,'delete_session'),(20,'Can view session',5,'view_session'),(21,'Can add image',6,'add_image'),(22,'Can change image',6,'change_image'),(23,'Can delete image',6,'delete_image'),(24,'Can view image',6,'view_image'),(25,'Can add message',7,'add_message'),(26,'Can change message',7,'change_message'),(27,'Can delete message',7,'delete_message'),(28,'Can view message',7,'view_message'),(29,'Can add news',8,'add_news'),(30,'Can change news',8,'change_news'),(31,'Can delete news',8,'delete_news'),(32,'Can view news',8,'view_news'),(33,'Can add user',9,'add_user'),(34,'Can change user',9,'change_user'),(35,'Can delete user',9,'delete_user'),(36,'Can view user',9,'view_user'),(37,'Can add user',10,'add_user'),(38,'Can change user',10,'change_user'),(39,'Can delete user',10,'delete_user'),(40,'Can view user',10,'view_user'),(41,'Can add bell schedule',11,'add_bellschedule'),(42,'Can change bell schedule',11,'change_bellschedule'),(43,'Can delete bell schedule',11,'delete_bellschedule'),(44,'Can view bell schedule',11,'view_bellschedule'),(45,'Can add bell template',12,'add_belltemplate'),(46,'Can change bell template',12,'change_belltemplate'),(47,'Can delete bell template',12,'delete_belltemplate'),(48,'Can view bell template',12,'view_belltemplate'),(49,'Can add displayed news',13,'add_displayednews'),(50,'Can change displayed news',13,'change_displayednews'),(51,'Can delete displayed news',13,'delete_displayednews'),(52,'Can view displayed news',13,'view_displayednews'),(53,'Can add client',14,'add_client'),(54,'Can change client',14,'change_client'),(55,'Can delete client',14,'delete_client'),(56,'Can view client',14,'view_client'),(57,'Can add video',15,'add_video'),(58,'Can change video',15,'change_video'),(59,'Can delete video',15,'delete_video'),(60,'Can view video',15,'view_video'),(61,'Can add log entry',16,'add_logentry'),(62,'Can change log entry',16,'change_logentry'),(63,'Can delete log entry',16,'delete_logentry'),(64,'Can view log entry',16,'view_logentry');
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bell_schedule`
--

LOCK TABLES `bell_schedule` WRITE;
/*!40000 ALTER TABLE `bell_schedule` DISABLE KEYS */;
INSERT INTO `bell_schedule` VALUES (3,1,'lesson','05:35:00','Звонок на 1 пару',1),(4,1,'break','05:40:00','Перерыв внутри 1 пары',1);
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bell_template`
--

LOCK TABLES `bell_template` WRITE;
/*!40000 ALTER TABLE `bell_template` DISABLE KEYS */;
INSERT INTO `bell_template` VALUES (1,'Обычное расписание','qweqweqwe',1),(2,'Сокращенное расписание 1','пары по 1 часу',0),(3,'Сокращенное расписание 2','Занятия по 45 минут',0);
/*!40000 ALTER TABLE `bell_template` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `client`
--

DROP TABLE IF EXISTS `client`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `client` (
  `pk_client` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `token` varchar(420) NOT NULL,
  `floor` int NOT NULL,
  `building` int NOT NULL,
  PRIMARY KEY (`pk_client`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client`
--

LOCK TABLES `client` WRITE;
/*!40000 ALTER TABLE `client` DISABLE KEYS */;
INSERT INTO `client` VALUES (1,'Фойе','51ad2cd1cd',1,1),(2,'2 Этаж, Левое крыло','29f7d6d352',1,1),(3,'1 Копрус, 2 этаж, правое крыло','9b405385fe',2,1);
/*!40000 ALTER TABLE `client` ENABLE KEYS */;
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
INSERT INTO `displayed_news` VALUES (18,'2025-05-03 20:01:24',0),(20,'2025-05-03 20:01:24',5),(21,'2025-05-03 20:01:24',2),(26,'2025-05-03 20:01:24',1),(27,'2025-05-03 20:01:24',4),(28,'2025-05-03 20:01:24',3);
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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (1,'admin','logentry'),(11,'api','bellschedule'),(12,'api','belltemplate'),(14,'api','client'),(13,'api','displayednews'),(6,'api','image'),(16,'api','logentry'),(7,'api','message'),(8,'api','news'),(9,'api','user'),(15,'api','video'),(3,'auth','group'),(2,'auth','permission'),(10,'auth','user'),(4,'contenttypes','contenttype'),(5,'sessions','session');
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
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2024-12-13 21:59:28.889864'),(2,'api','0001_initial','2024-12-13 21:59:28.949804'),(3,'admin','0001_initial','2024-12-13 21:59:29.231634'),(4,'admin','0002_logentry_remove_auto_add','2024-12-13 21:59:29.241781'),(5,'admin','0003_logentry_add_action_flag_choices','2024-12-13 21:59:29.250796'),(6,'contenttypes','0002_remove_content_type_name','2024-12-13 21:59:29.446317'),(7,'auth','0001_initial','2024-12-13 21:59:29.959817'),(8,'auth','0002_alter_permission_name_max_length','2024-12-13 21:59:30.078747'),(9,'auth','0003_alter_user_email_max_length','2024-12-13 21:59:30.088635'),(10,'auth','0004_alter_user_username_opts','2024-12-13 21:59:30.098168'),(11,'auth','0005_alter_user_last_login_null','2024-12-13 21:59:30.109789'),(12,'auth','0006_require_contenttypes_0002','2024-12-13 21:59:30.115076'),(13,'auth','0007_alter_validators_add_error_messages','2024-12-13 21:59:30.124839'),(14,'auth','0008_alter_user_username_max_length','2024-12-13 21:59:30.136714'),(15,'auth','0009_alter_user_last_name_max_length','2024-12-13 21:59:30.151291'),(16,'auth','0010_alter_group_name_max_length','2024-12-13 21:59:30.293301'),(17,'auth','0011_update_proxy_permissions','2024-12-13 21:59:30.310235'),(18,'auth','0012_alter_user_first_name_max_length','2024-12-13 21:59:30.323517'),(19,'sessions','0001_initial','2024-12-13 21:59:30.389617'),(20,'api','0002_rename_first_name_user_firstname_and_more','2024-12-18 12:08:08.031030'),(21,'api','0003_bellschedule_belltemplate_displayednews_client_video_and_more','2025-05-02 20:25:02.129622'),(22,'api','0004_alter_logentry_table','2025-05-02 20:25:02.173364');
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
INSERT INTO `django_session` VALUES ('13f7tlglxrcrjl87v1rm8opo29ew619a','.eJxVjEEOgjAQRe_StWkYBkpx6Z4zNNPO1KKmTSisjHcXEha6_e-9_1aOtjW5rcriZlZXZdTld_MUnpIPwA_K96JDyesye30o-qRVT4XldTvdv4NENe31bjLQGAPhAD3E1kpvyUoU3xgc2UhnITQtUUNCGCmCAQxB0MPAHarPFxeeOQk:1uD4Ae:aZgU10VeDXUPZ70o3ptbOZcwQVlPAh6ouEiRZeS939w','2025-05-22 16:32:28.866423'),('a06duuhbbjsba3jbo2zs9kfeeggchc7e','.eJxVjDsOwyAQBe9CHSHAmE_K9D4D2mUhOIlAMnYV5e6xJRdJ-2bmvVmAbS1h62kJM7Ers-zyuyHEZ6oHoAfUe-Ox1XWZkR8KP2nnU6P0up3u30GBXvZaDZq0zjgAOuUpSjEq76IHkhmjccJlZZLMghIJ4wlctkjK7tFIPjn2-QLx2Th2:1uAy6z:ddCu3bdD588JF9Ga7O6ecbtGifNGgluMkh_GK9BB98Y','2025-05-16 21:40:01.679141'),('qvlw7y4ynom9y2qgtl0tg1ec5irej5t8','.eJxVjEEOwiAQRe_C2hAYCgWX7j0DGWZAqoYmpV0Z765NutDtf-_9l4i4rTVuPS9xYnEWTpx-t4T0yG0HfMd2myXNbV2mJHdFHrTL68z5eTncv4OKvX5rtBaDU-A90TiEwoSOmQbQhjU6zcUF68F4bYJXBIlLUg4CeQUBzCjeH-JeN00:1uADJo:K8i3SovAQk0AjsA01q9P_u3I43fo3jryQgzAs952LbI','2025-05-14 19:42:08.379370'),('yq1r0cq7n47oxu8j023cmxztt6vb8up8','.eJxVjMsOwiAQRf-FtSFDebS4dO83kIEZpGogKe3K-O_apAvd3nPOfYmA21rC1nkJM4mzcOL0u0VMD647oDvWW5Op1XWZo9wVedAur434eTncv4OCvXzr0SpPbBICkWeTx8FZx5NTYIesFFubFEAGnWOcsrImE2sDBBo9GELx_gDfETfE:1u4vhP:0OyEA-WkJST9DB649kaj8rbV3eLnHrL6_NN28JLlhts','2025-04-30 05:52:39.225607');
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
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `image`
--

LOCK TABLES `image` WRITE;
/*!40000 ALTER TABLE `image` DISABLE KEYS */;
INSERT INTO `image` VALUES (15,'18_b8dffc25.jpg',18),(16,'18_b7380ab8.jpg',18),(21,'21_9b979c9a.bin',21),(24,'27_4e7b7f16.png',27),(25,'28_c278367d.png',28);
/*!40000 ALTER TABLE `image` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `log_entries`
--

DROP TABLE IF EXISTS `log_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `log_entries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `method` varchar(10) NOT NULL,
  `path` varchar(255) NOT NULL,
  `action` varchar(255) NOT NULL,
  `data` json DEFAULT NULL,
  `timestamp` datetime(6) NOT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `api_logentry_user_id_5cc2ec6e_fk_api_user_id` (`user_id`),
  CONSTRAINT `api_logentry_user_id_5cc2ec6e_fk_api_user_id` FOREIGN KEY (`user_id`) REFERENCES `api_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `log_entries`
--

LOCK TABLES `log_entries` WRITE;
/*!40000 ALTER TABLE `log_entries` DISABLE KEYS */;
INSERT INTO `log_entries` VALUES (1,'POST','/api/schedule/','POST /api/schedule/','{\"type\": \"z\"}','2025-05-02 20:25:51.033972',6),(2,'POST','/api/schedule/','POST /api/schedule/','{\"type\": \"z\"}','2025-05-02 21:20:11.095450',6),(3,'POST','/api/schedule/','POST /api/schedule/','{\"type\": \"s\"}','2025-05-02 21:21:01.094392',6),(4,'POST','/api/schedule/','POST /api/schedule/','{\"type\": \"p\"}','2025-05-02 21:21:01.111379',6),(5,'POST','/api/schedule/','POST /api/schedule/','{\"type\": \"z\"}','2025-05-02 21:21:01.150518',6),(6,'DELETE','/api/schedule/','DELETE /api/schedule/',NULL,'2025-05-02 21:24:15.462475',6),(7,'PATCH','/api/schedule/','PATCH /api/schedule/',NULL,'2025-05-02 21:29:20.721774',6),(8,'POST','/api/session/','POST /api/session/',NULL,'2025-05-02 21:32:11.706562',6),(9,'POST','/api/session/','POST /api/session/',NULL,'2025-05-02 21:33:23.477887',7),(10,'DELETE','/api/schedule/','DELETE /api/schedule/',NULL,'2025-05-02 21:33:44.481460',7),(11,'POST','/api/session/','POST /api/session/',NULL,'2025-05-02 21:40:01.658125',7),(12,'POST','/api/schedule/','POST /api/schedule/',NULL,'2025-05-02 21:42:49.730412',7),(13,'POST','/api/schedule/','POST /api/schedule/',NULL,'2025-05-02 21:42:49.759421',7),(14,'POST','/api/schedule/','POST /api/schedule/',NULL,'2025-05-02 21:42:49.771941',7),(15,'DELETE','/api/schedule/','DELETE /api/schedule/',NULL,'2025-05-02 21:42:54.553671',7),(16,'POST','/api/news/','POST /api/news/',NULL,'2025-05-02 21:43:24.609573',7),(17,'DELETE','/api/news/29/','DELETE /api/news/29/',NULL,'2025-05-02 21:43:28.314116',7),(18,'POST','/api/messages/','POST /api/messages/',NULL,'2025-05-02 21:43:53.026166',7),(19,'DELETE','/api/messages/23/','DELETE /api/messages/23/',NULL,'2025-05-02 21:43:55.815052',7),(20,'PATCH','/api/user/','PATCH /api/user/',NULL,'2025-05-02 21:44:09.924521',7),(21,'PATCH','/api/admin/users/7/','PATCH /api/admin/users/7/',NULL,'2025-05-02 21:44:55.833274',6),(22,'PATCH','/api/admin/users/7/','PATCH /api/admin/users/7/',NULL,'2025-05-02 21:45:05.315612',6),(23,'PATCH','/api/admin/users/7/','PATCH /api/admin/users/7/',NULL,'2025-05-02 21:48:11.325718',6),(24,'POST','/api/schedule/','POST /api/schedule/',NULL,'2025-05-02 21:48:29.370086',6),(25,'DELETE','/api/schedule/','DELETE /api/schedule/',NULL,'2025-05-02 21:48:35.485647',6),(26,'POST','/api/update-displayed-news/','POST /api/update-displayed-news/',NULL,'2025-05-03 20:01:11.386159',6),(27,'POST','/api/update-displayed-news/','POST /api/update-displayed-news/',NULL,'2025-05-03 20:01:24.489567',6),(28,'DELETE','/api/messages/undefined/','DELETE /api/messages/undefined/',NULL,'2025-05-03 20:38:11.658296',6),(29,'DELETE','/api/messages/undefined/','DELETE /api/messages/undefined/',NULL,'2025-05-03 20:38:13.922672',6),(30,'DELETE','/api/messages/22/','DELETE /api/messages/22/',NULL,'2025-05-04 02:31:57.872248',6),(31,'POST','/api/messages/','POST /api/messages/',NULL,'2025-05-04 02:32:10.937730',6),(32,'DELETE','/api/bell-schedules/1/','DELETE /api/bell-schedules/1/',NULL,'2025-05-04 02:32:20.249665',6),(33,'DELETE','/api/bell-schedules/2/','DELETE /api/bell-schedules/2/',NULL,'2025-05-04 02:32:21.340529',6),(34,'POST','/api/bell-schedules/','POST /api/bell-schedules/',NULL,'2025-05-04 02:33:02.577277',6),(35,'POST','/api/bell-schedules/','POST /api/bell-schedules/',NULL,'2025-05-04 02:33:38.127858',6),(36,'PATCH','/api/admin/users/7/','PATCH /api/admin/users/7/',NULL,'2025-05-04 14:58:45.816325',6),(37,'DELETE','/api/news/20/','DELETE /api/news/20/',NULL,'2025-05-04 14:59:06.613549',6),(38,'POST','/api/session/','POST /api/session/',NULL,'2025-05-08 16:32:28.836013',6),(39,'POST','/api/schedule/','POST /api/schedule/',NULL,'2025-05-10 18:00:33.730265',6),(40,'POST','/api/schedule/','POST /api/schedule/',NULL,'2025-05-10 18:00:33.729266',6);
/*!40000 ALTER TABLE `log_entries` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message`
--

LOCK TABLES `message` WRITE;
/*!40000 ALTER TABLE `message` DISABLE KEYS */;
INSERT INTO `message` VALUES (13,'Тестовое сообщение',0,0),(14,'Тестовое сообщение',1,0),(21,'Звонок на перемену',0,0),(24,'Звонок на урок',0,0);
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
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb3;
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
-- Table structure for table `video`
--

DROP TABLE IF EXISTS `video`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `video` (
  `pk_video` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` longtext,
  `file` varchar(100) NOT NULL,
  `uploaded_at` datetime(6) NOT NULL,
  PRIMARY KEY (`pk_video`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `video`
--

LOCK TABLES `video` WRITE;
/*!40000 ALTER TABLE `video` DISABLE KEYS */;
/*!40000 ALTER TABLE `video` ENABLE KEYS */;
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

-- Dump completed on 2025-05-30 13:54:39
