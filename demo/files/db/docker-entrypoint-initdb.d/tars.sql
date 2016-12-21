-- MySQL dump 10.13  Distrib 5.7.16, for Linux (x86_64)
--
-- Host: localhost    Database: tars
-- ------------------------------------------------------
-- Server version	5.7.16

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 COLLATE utf8_general_ci */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `applications`
--

DROP TABLE IF EXISTS `applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `applications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `DataChange_LastTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `environment` varchar(255) DEFAULT NULL,
  `ignore_fort` tinyint(1) NOT NULL,
  `organization` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `applications_eff87ce7` (`DataChange_LastTime`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applications`
--

LOCK TABLES `applications` WRITE;
/*!40000 ALTER TABLE `applications` DISABLE KEYS */;
INSERT INTO `applications` VALUES (1,'2016-12-07 09:25:00','2016-12-07 09:25:00','2016-12-07 09:25:00','sample_application',NULL,0,'');
/*!40000 ALTER TABLE `applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(80) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
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
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_group_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `group_id` (`group_id`,`permission_id`),
  KEY `auth_group_permissions_0e939a4f` (`group_id`),
  KEY `auth_group_permissions_8373b171` (`permission_id`),
  CONSTRAINT `auth_group__permission_id_1f49ccbbdc69d2fc_fk_auth_permission_id` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permission_group_id_689710a9a73b7457_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
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
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_permission` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `content_type_id` int(11) NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `content_type_id` (`content_type_id`,`codename`),
  KEY `auth_permission_417f1b1c` (`content_type_id`),
  CONSTRAINT `auth__content_type_id_508cf46651277a81_fk_django_content_type_id` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can change config',1,'change_config'),(2,'Can add log entry',2,'add_logentry'),(3,'Can change log entry',2,'change_logentry'),(4,'Can delete log entry',2,'delete_logentry'),(5,'Can add permission',3,'add_permission'),(6,'Can change permission',3,'change_permission'),(7,'Can delete permission',3,'delete_permission'),(8,'Can add group',4,'add_group'),(9,'Can change group',4,'change_group'),(10,'Can delete group',4,'delete_group'),(11,'Can add user',5,'add_user'),(12,'Can change user',5,'change_user'),(13,'Can delete user',5,'delete_user'),(14,'Can add content type',6,'add_contenttype'),(15,'Can change content type',6,'change_contenttype'),(16,'Can delete content type',6,'delete_contenttype'),(17,'Can add session',7,'add_session'),(18,'Can change session',7,'change_session'),(19,'Can delete session',7,'delete_session'),(20,'Can add application',8,'add_application'),(21,'Can change application',8,'change_application'),(22,'Can delete application',8,'delete_application'),(23,'Can add package',9,'add_package'),(24,'Can change package',9,'change_package'),(25,'Can delete package',9,'delete_package'),(26,'Can add tars deployment config',10,'add_tarsdeploymentconfig'),(27,'Can change tars deployment config',10,'change_tarsdeploymentconfig'),(28,'Can delete tars deployment config',10,'delete_tarsdeploymentconfig'),(29,'Can add tars deployment',11,'add_tarsdeployment'),(30,'Can change tars deployment',11,'change_tarsdeployment'),(31,'Can delete tars deployment',11,'delete_tarsdeployment'),(32,'Can add tars fort deployment',11,'add_tarsfortdeployment'),(33,'Can change tars fort deployment',11,'change_tarsfortdeployment'),(34,'Can delete tars fort deployment',11,'delete_tarsfortdeployment'),(35,'Can add tars deployment4uat',11,'add_tarsdeployment4uat'),(36,'Can change tars deployment4uat',11,'change_tarsdeployment4uat'),(37,'Can delete tars deployment4uat',11,'delete_tarsdeployment4uat'),(38,'Can add tars deployment join',11,'add_tarsdeploymentjoin'),(39,'Can change tars deployment join',11,'change_tarsdeploymentjoin'),(40,'Can delete tars deployment join',11,'delete_tarsdeploymentjoin'),(41,'Can add tars fort deployment join',11,'add_tarsfortdeploymentjoin'),(42,'Can change tars fort deployment join',11,'change_tarsfortdeploymentjoin'),(43,'Can delete tars fort deployment join',11,'delete_tarsfortdeploymentjoin'),(44,'Can add tars deployment4uat join',11,'add_tarsdeployment4uatjoin'),(45,'Can change tars deployment4uat join',11,'change_tarsdeployment4uatjoin'),(46,'Can delete tars deployment4uat join',11,'delete_tarsdeployment4uatjoin'),(47,'Can add tars deployment action',12,'add_tarsdeploymentaction'),(48,'Can change tars deployment action',12,'change_tarsdeploymentaction'),(49,'Can delete tars deployment action',12,'delete_tarsdeploymentaction'),(50,'Can add tars deployment batch',13,'add_tarsdeploymentbatch'),(51,'Can change tars deployment batch',13,'change_tarsdeploymentbatch'),(52,'Can delete tars deployment batch',13,'delete_tarsdeploymentbatch'),(53,'Can add tars deployment fort batch',13,'add_tarsdeploymentfortbatch'),(54,'Can change tars deployment fort batch',13,'change_tarsdeploymentfortbatch'),(55,'Can delete tars deployment fort batch',13,'delete_tarsdeploymentfortbatch'),(56,'Can add tars deployment join batch',13,'add_tarsdeploymentjoinbatch'),(57,'Can change tars deployment join batch',13,'change_tarsdeploymentjoinbatch'),(58,'Can delete tars deployment join batch',13,'delete_tarsdeploymentjoinbatch'),(59,'Can add tars deployment fort join batch',13,'add_tarsdeploymentfortjoinbatch'),(60,'Can change tars deployment fort join batch',13,'change_tarsdeploymentfortjoinbatch'),(61,'Can delete tars deployment fort join batch',13,'delete_tarsdeploymentfortjoinbatch'),(62,'Can add tars deployment target',14,'add_tarsdeploymenttarget'),(63,'Can change tars deployment target',14,'change_tarsdeploymenttarget'),(64,'Can delete tars deployment target',14,'delete_tarsdeploymenttarget'),(65,'Can add tars join group target',14,'add_tarsjoingrouptarget'),(66,'Can change tars join group target',14,'change_tarsjoingrouptarget'),(67,'Can delete tars join group target',14,'delete_tarsjoingrouptarget'),(68,'Can add server',24,'add_server'),(69,'Can change server',24,'change_server'),(70,'Can delete server',24,'delete_server'),(71,'Can add group',25,'add_group'),(72,'Can change group',25,'change_group'),(73,'Can delete group',25,'delete_group'),(74,'Can add joined group',26,'add_joinedgroup'),(75,'Can change joined group',26,'change_joinedgroup'),(76,'Can delete joined group',26,'delete_joinedgroup');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user`
--

DROP TABLE IF EXISTS `auth_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime NOT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(30) NOT NULL,
  `first_name` varchar(30) NOT NULL,
  `last_name` varchar(30) NOT NULL,
  `email` varchar(75) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user`
--

LOCK TABLES `auth_user` WRITE;
/*!40000 ALTER TABLE `auth_user` DISABLE KEYS */;
INSERT INTO `auth_user` VALUES (1,'pbkdf2_sha256$15000$D6oi7vJkm3KT$tT5nRAL9TzxCN59ExtWUxdDoeXYMS5KH3QJObUwQ02c=','2016-12-07 09:24:08',1,'admin','','','',1,1,'2016-12-07 09:18:46');
/*!40000 ALTER TABLE `auth_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_groups`
--

DROP TABLE IF EXISTS `auth_user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_user_groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`group_id`),
  KEY `auth_user_groups_e8701ad4` (`user_id`),
  KEY `auth_user_groups_0e939a4f` (`group_id`),
  CONSTRAINT `auth_user_groups_group_id_33ac548dcf5f8e37_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `auth_user_groups_user_id_4b5ed4ffdb8fd9b0_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_groups`
--

LOCK TABLES `auth_user_groups` WRITE;
/*!40000 ALTER TABLE `auth_user_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_user_permissions`
--

DROP TABLE IF EXISTS `auth_user_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_user_user_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`permission_id`),
  KEY `auth_user_user_permissions_e8701ad4` (`user_id`),
  KEY `auth_user_user_permissions_8373b171` (`permission_id`),
  CONSTRAINT `auth_user_u_permission_id_384b62483d7071f0_fk_auth_permission_id` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_user_user_permissi_user_id_7f0938558328534a_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_user_permissions`
--

LOCK TABLES `auth_user_user_permissions` WRITE;
/*!40000 ALTER TABLE `auth_user_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deployment_actions`
--

DROP TABLE IF EXISTS `deployment_actions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `deployment_actions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `DataChange_LastTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `action` varchar(255) DEFAULT NULL,
  `message` varchar(255) DEFAULT NULL,
  `operator` varchar(55) DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `deployment_id` int(11) DEFAULT NULL,
  `finish_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `deployment_actions_eff87ce7` (`DataChange_LastTime`),
  KEY `deployment_actions_8dcac567` (`deployment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deployment_actions`
--

LOCK TABLES `deployment_actions` WRITE;
/*!40000 ALTER TABLE `deployment_actions` DISABLE KEYS */;
INSERT INTO `deployment_actions` VALUES (1,'2016-12-07 09:27:21','2016-12-07 09:27:21','2016-12-07 09:27:21','create','new deployment','admin','2016-12-07 09:27:21',1,'2016-12-07 09:27:21'),(2,'2016-12-07 09:27:21','2016-12-07 09:27:21','2016-12-07 09:27:21','start','activate deployment','admin','2016-12-07 09:27:21',1,'2016-12-07 09:27:21'),(3,'2016-12-07 09:27:21','2016-12-07 09:27:21','2016-12-07 09:27:21','smoke','start smoking','admin','2016-12-07 09:27:21',1,'2016-12-07 09:27:21'),(4,'2016-12-07 09:28:12','2016-12-07 09:28:12','2016-12-07 09:28:12','bake','start baking','admin','2016-12-07 09:28:12',1,'2016-12-07 09:28:12'),(5,'2016-12-07 09:28:17','2016-12-07 09:28:17','2016-12-07 09:28:17','rollout','start rolling out','admin','2016-12-07 09:28:17',1,'2016-12-07 09:28:17');
/*!40000 ALTER TABLE `deployment_actions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deployment_batches`
--

DROP TABLE IF EXISTS `deployment_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `deployment_batches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `DataChange_LastTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `status` varchar(32) DEFAULT NULL,
  `index` int(11) DEFAULT NULL,
  `pause_time` int(11) NOT NULL,
  `deployment_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `deployment_batches_eff87ce7` (`DataChange_LastTime`),
  KEY `deployment_batches_8dcac567` (`deployment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deployment_batches`
--

LOCK TABLES `deployment_batches` WRITE;
/*!40000 ALTER TABLE `deployment_batches` DISABLE KEYS */;
INSERT INTO `deployment_batches` VALUES (1,'2016-12-07 09:28:14','2016-12-07 09:27:21','2016-12-07 09:28:14','SUCCESS',1,0,1),(2,'2016-12-07 09:28:47','2016-12-07 09:27:21','2016-12-07 09:28:47','SUCCESS',2,0,1),(3,'2016-12-07 09:29:18','2016-12-07 09:27:21','2016-12-07 09:29:18','SUCCESS',3,0,1);
/*!40000 ALTER TABLE `deployment_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deployment_configs`
--

DROP TABLE IF EXISTS `deployment_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `deployment_configs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `DataChange_LastTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `batch_pattern` varchar(300) DEFAULT NULL,
  `pause_time` int(11) NOT NULL,
  `mode` varchar(1) NOT NULL,
  `verify_timeout` int(11) DEFAULT NULL,
  `startup_timeout` int(11) DEFAULT NULL,
  `ignore_verify_result` tinyint(1) NOT NULL,
  `restart_app_pool` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `deployment_configs_eff87ce7` (`DataChange_LastTime`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deployment_configs`
--

LOCK TABLES `deployment_configs` WRITE;
/*!40000 ALTER TABLE `deployment_configs` DISABLE KEYS */;
INSERT INTO `deployment_configs` VALUES (1,'2016-12-07 09:27:21','2016-12-07 09:27:21','2016-12-07 09:27:21','25%+25%+25%+25%',0,'a',0,180,0,0);
/*!40000 ALTER TABLE `deployment_configs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deployment_targets`
--

DROP TABLE IF EXISTS `deployment_targets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `deployment_targets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `DataChange_LastTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `status` varchar(32) DEFAULT NULL,
  `task_id` varchar(36) DEFAULT NULL,
  `is_fort` tinyint(1) NOT NULL,
  `hostname` varchar(100) DEFAULT NULL,
  `ip_address` varchar(64) DEFAULT NULL,
  `batch_id` int(11) DEFAULT NULL,
  `server_id` int(11) DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `deployment_targets_eff87ce7` (`DataChange_LastTime`),
  KEY `deployment_targets_12927864` (`batch_id`),
  KEY `deployment_targets_2f18fe12` (`server_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deployment_targets`
--

LOCK TABLES `deployment_targets` WRITE;
/*!40000 ALTER TABLE `deployment_targets` DISABLE KEYS */;
INSERT INTO `deployment_targets` VALUES (1,'2016-12-07 09:28:13','2016-12-07 09:27:21','2016-12-07 09:28:13','SUCCESS','b1cf7a31-4613-4f38-b1c7-ab911bb22048',1,'server1','server1',1,1,0),(2,'2016-12-07 09:28:47','2016-12-07 09:27:21','2016-12-07 09:28:47','SUCCESS','42c153e8-ef7c-4c09-9860-7070f24ee0cd',0,'server2','server2',2,2,0),(3,'2016-12-07 09:29:18','2016-12-07 09:27:21','2016-12-07 09:29:18','SUCCESS','8aba3180-b07f-413c-878e-598fff008a1b',0,'server3','server3',3,3,0);
/*!40000 ALTER TABLE `deployment_targets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deployments`
--

DROP TABLE IF EXISTS `deployments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `deployments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `DataChange_LastTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `status` varchar(32) DEFAULT NULL,
  `category` varchar(20) DEFAULT NULL,
  `config_id` int(11) DEFAULT NULL,
  `application_id` int(11) DEFAULT NULL,
  `package_id` int(11) DEFAULT NULL,
  `group_id` int(11) DEFAULT NULL,
  `rop_id` int(11) DEFAULT NULL,
  `flavor` int(11) NOT NULL,
  `origin_id` int(11) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `deployments_eff87ce7` (`DataChange_LastTime`),
  KEY `deployments_c07a9fbf` (`config_id`),
  KEY `deployments_bf127e2f` (`application_id`),
  KEY `deployments_b6411b91` (`package_id`),
  KEY `deployments_5f412f9a` (`group_id`),
  KEY `deployments_1f9d29b7` (`rop_id`),
  KEY `deployments_759d5244` (`origin_id`),
  KEY `deployments_410d0aac` (`parent_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deployments`
--

LOCK TABLES `deployments` WRITE;
/*!40000 ALTER TABLE `deployments` DISABLE KEYS */;
INSERT INTO `deployments` VALUES (1,'2016-12-07 09:29:18','2016-12-07 09:27:21','2016-12-07 09:29:18','SUCCESS','normal',1,1,1,1,NULL,0,NULL,NULL);
/*!40000 ALTER TABLE `deployments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_admin_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `action_time` datetime NOT NULL,
  `object_id` longtext,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint(5) unsigned NOT NULL,
  `change_message` longtext NOT NULL,
  `content_type_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_417f1b1c` (`content_type_id`),
  KEY `django_admin_log_e8701ad4` (`user_id`),
  CONSTRAINT `djang_content_type_id_697914295151027a_fk_django_content_type_id` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_52fdd58701c5f563_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
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
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_content_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_45f3b1d93ec8c61c_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (1,'','constance','config'),(2,'log entry','admin','logentry'),(3,'permission','auth','permission'),(4,'group','auth','group'),(5,'user','auth','user'),(6,'content type','contenttypes','contenttype'),(7,'session','sessions','session'),(8,'application','application','application'),(9,'package','application','package'),(10,'tars deployment config','deployment','tarsdeploymentconfig'),(11,'tars deployment','deployment','tarsdeployment'),(12,'tars deployment action','deployment','tarsdeploymentaction'),(13,'tars deployment batch','deployment','tarsdeploymentbatch'),(14,'tars deployment target','deployment','tarsdeploymenttarget'),(15,'tars fort deployment','deployment','tarsfortdeployment'),(16,'tars deployment join batch','deployment','tarsdeploymentjoinbatch'),(17,'tars deployment4uat','deployment','tarsdeployment4uat'),(18,'tars join group target','deployment','tarsjoingrouptarget'),(19,'tars fort deployment join','deployment','tarsfortdeploymentjoin'),(20,'tars deployment fort join batch','deployment','tarsdeploymentfortjoinbatch'),(21,'tars deployment fort batch','deployment','tarsdeploymentfortbatch'),(22,'tars deployment join','deployment','tarsdeploymentjoin'),(23,'tars deployment4uat join','deployment','tarsdeployment4uatjoin'),(24,'server','server','server'),(25,'group','server','group'),(26,'joined group','server','joinedgroup');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_migrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2016-12-07 09:18:06'),(2,'auth','0001_initial','2016-12-07 09:18:11'),(3,'admin','0001_initial','2016-12-07 09:18:13'),(4,'sessions','0001_initial','2016-12-07 09:18:13');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_de54fa62` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
INSERT INTO `django_session` VALUES ('8rx9tnzuc1gxr5scn0g2skcmnaol9dxj','NGY2ZTY5MjI1ZjFjZTg0MTFhOTg2NDI0Y2Q4NzI0YWEzY2E3ZTliYjp7Il9hdXRoX3VzZXJfaGFzaCI6IjZkZjA2ZWI3ODFkZDIzNGI2YmI3YTYzNWMyNzAyZWVkNDk5ODM3MzkiLCJfYXV0aF91c2VyX2JhY2tlbmQiOiJkamFuZ28uY29udHJpYi5hdXRoLmJhY2tlbmRzLk1vZGVsQmFja2VuZCIsIl9hdXRoX3VzZXJfaWQiOjF9','2016-12-21 09:24:08');
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `groups`
--

DROP TABLE IF EXISTS `groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `DataChange_LastTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `application_id` int(11) DEFAULT NULL,
  `vdir_path` varchar(255) DEFAULT NULL,
  `physic_path` varchar(255) DEFAULT NULL,
  `fort` varchar(255) DEFAULT NULL,
  `idc` varchar(255) DEFAULT NULL,
  `health_check_url` varchar(255) DEFAULT NULL,
  `is_ssl` tinyint(1) NOT NULL,
  `g_type` varchar(32) DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `groups_eff87ce7` (`DataChange_LastTime`),
  KEY `groups_bf127e2f` (`application_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `groups`
--

LOCK TABLES `groups` WRITE;
/*!40000 ALTER TABLE `groups` DISABLE KEYS */;
INSERT INTO `groups` VALUES (1,'2016-12-07 09:25:35','2016-12-07 09:25:35','2016-12-07 09:25:35','sample_group1',1,'/','','','','/',0,'Ansible',0);
/*!40000 ALTER TABLE `groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `groups_joins`
--

DROP TABLE IF EXISTS `groups_joins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `groups_joins` (
  `group_ptr_id` int(11) NOT NULL,
  PRIMARY KEY (`group_ptr_id`),
  CONSTRAINT `group_ptr_id_refs_id_cd142d0f` FOREIGN KEY (`group_ptr_id`) REFERENCES `groups` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `groups_joins`
--

LOCK TABLES `groups_joins` WRITE;
/*!40000 ALTER TABLE `groups_joins` DISABLE KEYS */;
/*!40000 ALTER TABLE `groups_joins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `groups_joins_junction`
--

DROP TABLE IF EXISTS `groups_joins_junction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `groups_joins_junction` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `joinedgroup_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `joinedgroup_id` (`joinedgroup_id`,`group_id`),
  KEY `groups_joins_junction_eac5cbe7` (`joinedgroup_id`),
  KEY `groups_joins_junction_5f412f9a` (`group_id`),
  CONSTRAINT `group_id_refs_id_9b78a843` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`),
  CONSTRAINT `joinedgroup_id_refs_group_ptr_id_26d0465a` FOREIGN KEY (`joinedgroup_id`) REFERENCES `groups_joins` (`group_ptr_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `groups_joins_junction`
--

LOCK TABLES `groups_joins_junction` WRITE;
/*!40000 ALTER TABLE `groups_joins_junction` DISABLE KEYS */;
/*!40000 ALTER TABLE `groups_joins_junction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `packages`
--

DROP TABLE IF EXISTS `packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `packages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `DataChange_LastTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `application_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `version` varchar(255) DEFAULT NULL,
  `location` varchar(1023) DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `packages_eff87ce7` (`DataChange_LastTime`),
  KEY `packages_bf127e2f` (`application_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `packages`
--

LOCK TABLES `packages` WRITE;
/*!40000 ALTER TABLE `packages` DISABLE KEYS */;
INSERT INTO `packages` VALUES (1,'2016-12-07 09:26:52','2016-12-07 09:26:52','2016-12-07 09:26:52',1,'sample_package1','','http://tomcat.apache.org/tomcat-6.0-doc/appdev/sample/sample.war',0),(2,'2016-12-07 09:51:01','2016-12-07 09:51:01','2016-12-07 09:51:19',1,'sample_package2','','http://tomcat.apache.org/tomcat-6.0-doc/appdev/sample/sample.war',0);
/*!40000 ALTER TABLE `packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servers`
--

DROP TABLE IF EXISTS `servers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `servers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `DataChange_LastTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `hostname` varchar(255) DEFAULT NULL,
  `ip_address` varchar(64) DEFAULT NULL,
  `group_id` int(11) DEFAULT NULL,
  `is_fort` tinyint(1) NOT NULL,
  `idc` varchar(255) DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `servers_eff87ce7` (`DataChange_LastTime`),
  KEY `servers_5f412f9a` (`group_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servers`
--

LOCK TABLES `servers` WRITE;
/*!40000 ALTER TABLE `servers` DISABLE KEYS */;
INSERT INTO `servers` VALUES (1,'2016-12-07 09:26:12','2016-12-07 09:26:12','2016-12-07 09:26:12','server1','server1',1,0,'',0),(2,'2016-12-07 09:26:20','2016-12-07 09:26:20','2016-12-07 09:26:20','server2','server2',1,0,'',0),(3,'2016-12-07 09:26:27','2016-12-07 09:26:27','2016-12-07 09:26:27','server3','server3',1,0,'',0);
/*!40000 ALTER TABLE `servers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-12-07  9:52:21
