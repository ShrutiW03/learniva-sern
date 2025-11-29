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
-- Table structure for table `user_course_progress`
--

DROP TABLE IF EXISTS `user_course_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_course_progress` (
  `progress_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `course_id` int NOT NULL,
  `completed_resources` json DEFAULT NULL,
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`progress_id`),
  UNIQUE KEY `user_course` (`user_id`,`course_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `user_course_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_course_progress_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_course_progress`
--

LOCK TABLES `user_course_progress` WRITE;
/*!40000 ALTER TABLE `user_course_progress` DISABLE KEYS */;
INSERT INTO `user_course_progress` VALUES (1,3,3,'[\"https://www.oracle.com/java/technologies/javase-j2se8-intro.html\", \"https://www.youtube.com/watch?v=eIrMbAQSU34\", \"https://www.tutorialspoint.com/java/java_methods.htm\", \"https://docs.oracle.com/javase/tutorial/java/nutsandbolts/flow.html\"]','2025-11-03 15:38:11'),(5,4,4,'[\"https://www.youtube.com/watch?v=Gv9_4yMH8ao\", \"https://developers.google.com/machine-learning/crash-course\"]','2025-11-03 20:24:58'),(7,3,5,'[\"https://www.w3schools.com/sql/\", \"https://www.youtube.com/watch?v=HXV3zeQKqGY\", \"https://www.amazon.com/SQL-Complete-Reference-James-R-Groff/dp/0071748642\"]','2025-11-17 11:38:34'),(10,6,7,'[\"https://www.youtube.com/watch?v=KX0ZT2D9KqY\", \"https://towardsdatascience.com/logistic-regression-detailed-overview-46c4da4303bc\", \"https://scikit-learn.org/stable/modules/tree.html\", \"https://www.datacamp.com/community/tutorials/k-means-clustering-python\"]','2025-11-17 18:04:56'),(14,6,9,'[\"https://docs.python.org/3/\", \"https://www.google.com/search?q=how+to+install+python\"]','2025-11-21 21:58:20'),(16,6,12,'[\"https://www.youtube.com/results?search_query=what+is+mern+stack\", \"https://www.youtube.com/results?search_query=introduction+to+vercel\"]','2025-11-22 05:42:28');
/*!40000 ALTER TABLE `user_course_progress` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-29 15:43:37
