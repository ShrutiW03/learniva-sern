-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: learniva_db
-- ------------------------------------------------------
-- Server version	8.0.40

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
-- Table structure for table `userquizresults`
--

DROP TABLE IF EXISTS `userquizresults`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userquizresults` (
  `result_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `topic` varchar(255) NOT NULL,
  `score` int NOT NULL,
  `total_questions` int NOT NULL,
  `taken_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `course_id` int DEFAULT NULL,
  `difficulty` varchar(50) DEFAULT NULL,
  `quiz_type` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`result_id`),
  KEY `user_id` (`user_id`),
  KEY `fk_course_id` (`course_id`),
  CONSTRAINT `fk_course_id` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `userquizresults_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userquizresults`
--

LOCK TABLES `userquizresults` WRITE;
/*!40000 ALTER TABLE `userquizresults` DISABLE KEYS */;
INSERT INTO `userquizresults` VALUES (1,4,'selenium',1,5,'2025-11-03 15:00:33',2,'Beginner','quiz'),(2,4,'selenium',1,10,'2025-11-03 15:03:46',2,'Beginner','test'),(3,3,'java',1,5,'2025-11-03 15:37:57',3,'Beginner','quiz'),(4,3,'java',1,5,'2025-11-03 15:42:33',3,'Beginner','quiz'),(5,4,'machine learning',4,5,'2025-11-03 20:27:24',4,'Beginner','quiz'),(6,4,'machine learning',4,5,'2025-11-03 20:29:23',4,'Advanced','quiz'),(7,4,'selenium',4,5,'2025-11-03 20:30:33',2,'Beginner','quiz'),(8,4,'selenium',2,5,'2025-11-03 20:31:49',2,'Intermediate','quiz'),(9,3,'Week 1: Introduction to Data Science and Python Basics',2,5,'2025-11-17 12:49:33',6,'Beginner','quiz'),(10,6,'python',1,5,'2025-11-21 21:57:20',9,'Beginner','quiz'),(11,6,'machine learning',0,5,'2025-11-22 04:43:24',10,'Beginner','quiz'),(12,6,'Week 1: Introduction to Vercel and MERN Stack Basics',2,5,'2025-11-22 05:12:04',11,'Beginner','quiz');
/*!40000 ALTER TABLE `userquizresults` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-29 15:43:36
