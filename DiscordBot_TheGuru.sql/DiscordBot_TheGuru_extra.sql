
--
-- Indexes for dumped tables
--

--
-- Indexes for table `Servers`
--
ALTER TABLE `Servers`
  ADD PRIMARY KEY (`SUID`),
  ADD UNIQUE KEY `SUID` (`SUID`);

--
-- Indexes for table `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`SUID`,`UID`),
  ADD KEY `SUID` (`SUID`),
  ADD KEY `UID` (`UID`);
