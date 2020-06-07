
-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

CREATE TABLE `Users` (
  `SUID` varchar(20) COLLATE utf8_bin NOT NULL COMMENT 'ServerUniqueID',
  `UID` varchar(50) COLLATE utf8_bin NOT NULL COMMENT 'UserID',
  `Username` varchar(50) COLLATE utf8_bin NOT NULL,
  `PermissionsLevel` int(2) NOT NULL DEFAULT '0',
  `EXP` int(10) NOT NULL DEFAULT '0',
  `Warnings` int(2) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
