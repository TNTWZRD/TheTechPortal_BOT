
-- --------------------------------------------------------

--
-- Table structure for table `Servers`
--

CREATE TABLE `Servers` (
  `SUID` varchar(20) COLLATE utf8_bin NOT NULL COMMENT 'ServerUniqueID',
  `WarningsBeforeKick` int(11) NOT NULL DEFAULT '3',
  `WarningsBeforeBan` int(11) NOT NULL DEFAULT '6',
  `ProfanityFilterKickBan` tinyint(1) NOT NULL DEFAULT '1',
  `ProfanityFilterCustom` tinyint(1) NOT NULL DEFAULT '0',
  `ProfanityFilterFullWords` tinyint(1) NOT NULL DEFAULT '1',
  `DeleteCommandsAfterSent` tinyint(1) NOT NULL DEFAULT '1',
  `MaxChainedCommands` int(11) NOT NULL DEFAULT '3',
  `ServerRole_GENERAL_USER` varchar(500) COLLATE utf8_bin DEFAULT NULL,
  `ServerRole_MUTED` varchar(500) COLLATE utf8_bin DEFAULT NULL,
  `ServerName` varchar(50) COLLATE utf8_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
