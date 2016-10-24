DROP DATABASE IF EXISTS devicemanager_db_v1;
CREATE DATABASE IF NOT EXISTS devicemanager_db_v1;


USE devicemanager_db_v1;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `evicemanager_db_v1`
--

-- --------------------------------------------------------

--
-- Table structure for table `devices`
--

CREATE TABLE IF NOT EXISTS `devices` (
  `brand` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  `os` varchar(100) NOT NULL,
  `status` varchar(100) NOT NULL,
  `caseid` int(4) ,
  `refid` varchar(50) NOT NULL,
  `badgeid` varchar(50) NOT NULL,
  PRIMARY KEY (`refid`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 ;


--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `name` varchar(100),
  `badgeid` varchar(50) NOT NULL,
  `lastlogged` varchar(100),
  PRIMARY KEY (`badgeid`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 ;

--
-- Table structure for table `userdevice`
--

-- CREATE TABLE IF NOT EXISTS `userdevice` (
--   `id` varchar(100) NOT NULL,
--   `refid` varchar(50) NOT NULL,
--   `badgeid` varchar(50) NOT NULL,
--   PRIMARY KEY (`id`)
-- ) ENGINE=InnoDB  DEFAULT CHARSET=latin1 ;


--
-- Dumping data for tables
--

DELETE FROM `users`;
DELETE FROM `devices`;

INSERT INTO `devices` (`brand`, `model`, `os`, `caseid`, `refid`, `status`, `badgeid`) VALUES
('Apple', 'Iphone 6', 'IOS', '14', 'DD001214', 'Unavailable', 'AA009E45'),
('Apple', 'Iphone 6+', 'IOS', '12', 'DD001213', 'Available', ''),
('Apple', 'Iphone 7', 'IOS', '13', 'DD001212', 'Available', ''),
('Samsung', 'S3', 'Android', '11', 'DD001211', 'Available', ''),
('Samsung', 'S4', 'Android', '6', 'DD001210', 'Available', ''),
('Samsung', 'S5', 'Android', '5', 'DD001239', 'Available', ''),
('Nokia', 'Lumia 532', 'Windows phone', '1', 'DD001238', 'Available', ''),
('Nokia', 'Lumia 640', 'Windows phone', '3', 'DD001237', 'Available', '');

INSERT INTO `users` (`name`, `badgeid`, `lastlogged`) VALUES
('Marwan Laurent', 'AA009E45', '15:11:58 on 23/10/2016'),
('Athony Hopkins', 'AA009C32', '14:44:25 on 21/10/2016'),
('Marc Vandendorre', 'AA009EEE', '13:34:34 on 20/10/2016');


/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
