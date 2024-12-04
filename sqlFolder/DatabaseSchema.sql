
CREATE TABLE users (
    userId INTEGER PRIMARY KEY AUTOINCREMENT,
    partnerId INTEGER,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    exchange_key TEXT,
    FOREIGN KEY (partnerId) REFERENCES users(userId) ON DELETE SET NULL
);

CREATE TABLE item (
    itemId INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    amount INTEGER NOT NULL,
    itemName TEXT NOT NULL,
    InMovement BOOLEAN NOT NULL,
    valuePerUnit REAL NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

CREATE TABLE listing (
    listingId INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    itemId INTEGER NOT NULL,
    hasAmount INTEGER NOT NULL,
    wants TEXT NOT NULL,
    wantsAmount INTEGER NOT NULL,
    partnerId INTEGER,
    tradeValue REAL NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
    FOREIGN KEY (itemId) REFERENCES Item(itemId) ON DELETE CASCADE,
    FOREIGN KEY (partnerId) REFERENCES users(userId) ON DELETE SET NULL
);

CREATE TABLE transactions (
    transactionId INTEGER PRIMARY KEY AUTOINCREMENT,
    listing1 INTEGER NOT NULL,
    listing2 INTEGER NOT NULL,
    fullHash TEXT NOT NULL,
    firstHalfHash TEXT,
    secondHalfHash TEXT,
    equivalence REAL NOT NULL,
    UNIQUE(transactionId),
    FOREIGN KEY (listing1) REFERENCES Listing(listingId) ON DELETE CASCADE,
    FOREIGN KEY (listing2) REFERENCES Listing(listingId) ON DELETE CASCADE
);

--Creating basic entries
INSERT INTO users (userId, username, password) VALUES (0, 'Admin', 'p@ssw0rd!');
INSERT INTO users (userId, username, password) VALUES (1, 'Steven', 'p@ssw0rd!');
INSERT INTO users (userId, username, password) VALUES (2, 'Matthew', 'p@ssw0rd!');
INSERT INTO users (userId, partnerId, username, password) VALUES (3, 4, 'Henery', 'p@ssw0rd!');
INSERT INTO users (userId, partnerId, username, password) VALUES (4, 3, 'Frank', 'p@ssw0rd!');

--Creating item values to create standards
INSERT INTO item (itemID, userId, amount, itemName, InMovement, valuePerUnit) Values (1, 0, "0", "Wheat", false, 5);
INSERT INTO item (itemID, userId, amount, itemName, InMovement, valuePerUnit) Values (2, 0, "0", "Corn", false, 2);
INSERT INTO item (itemID, userId, amount, itemName, InMovement, valuePerUnit) Values (3, 0, "0", "Barley", false, 10);
INSERT INTO item (itemID, userId, amount, itemName, InMovement, valuePerUnit) Values (4, 0, "0", "Peas", false, 3);
INSERT INTO item (itemID, userId, amount, itemName, InMovement, valuePerUnit) Values (5, 0, "0", "Rice", false, 4);
INSERT INTO item (itemID, userId, amount, itemName, InMovement, valuePerUnit) Values (6, 0, "0", "Soybeans", false, 7);
INSERT INTO item (itemID, userId, amount, itemName, InMovement, valuePerUnit) Values (7, 0, "0", "Oats", false, 6);
INSERT INTO item (itemID, userId, amount, itemName, InMovement, valuePerUnit) Values (8, 0, "0", "Lentils", false, 8);
INSERT INTO item (itemID, userId, amount, itemName, InMovement, valuePerUnit) Values (9, 0, "0", "Quinoa", false, 12);
INSERT INTO item (itemID, userId, amount, itemName, InMovement, valuePerUnit) Values (10, 0, "0", "Chickpeas", false, 5);
INSERT INTO item (itemID, userId, amount, itemName, InMovement, valuePerUnit) Values (11, 0, "0", "Millet", false, 3);
INSERT INTO item (itemID, userId, amount, itemName, InMovement, valuePerUnit) Values (12, 0, "0", "Sorghum", false, 9);
INSERT INTO item (itemID, userId, amount, itemName, InMovement, valuePerUnit) Values (13, 0, "0", "Beans", false, 4);
INSERT INTO item (itemID, userId, amount, itemName, InMovement, valuePerUnit) Values (14, 0, "0", "Buckwheat", false, 11);
INSERT INTO item (itemID, userId, amount, itemName, InMovement, valuePerUnit) Values (15, 0, "0", "Spelt", false, 10);
INSERT INTO item (itemID, userId, amount, itemName, InMovement, valuePerUnit) Values (16, 0, "0", "Flaxseed", false, 15);
INSERT INTO item (itemID, userId, amount, itemName, InMovement, valuePerUnit) Values (17, 0, "0", "Rye", false, 6);
INSERT INTO item (itemID, userId, amount, itemName, InMovement, valuePerUnit) Values (18, 0, "0", "Teff", false, 14);
INSERT INTO item (itemID, userId, amount, itemName, InMovement, valuePerUnit) Values (19, 0, "0", "Amaranth", false, 13);
INSERT INTO item (itemID, userId, amount, itemName, InMovement, valuePerUnit) Values (20, 0, "0", "Sesame", false, 16);

INSERT INTO item VALUES(21,3,0,'Wheat',0,5.0);
INSERT INTO item VALUES(22,3,0,'Corn',0,2.0);
INSERT INTO item VALUES(23,3,0,'Barley',0,10.0);
INSERT INTO item VALUES(24,3,0,'Peas',0,3.0);
INSERT INTO item VALUES(25,3,150,'Rice',0,4.0);
INSERT INTO item VALUES(26,3,0,'Soybeans',0,7.0);
INSERT INTO item VALUES(27,3,0,'Oats',0,6.0);
INSERT INTO item VALUES(28,3,0,'Lentils',0,8.0);
INSERT INTO item VALUES(29,3,0,'Quinoa',0,11.999999999999999644);
INSERT INTO item VALUES(30,3,0,'Chickpeas',0,5.0);
INSERT INTO item VALUES(31,3,0,'Millet',0,3.0);
INSERT INTO item VALUES(32,3,0,'Sorghum',0,9.0);
INSERT INTO item VALUES(33,3,0,'Beans',0,4.0);
INSERT INTO item VALUES(34,3,1500,'Buckwheat',0,11.000000000000000888);
INSERT INTO item VALUES(35,3,0,'Spelt',0,10.0);
INSERT INTO item VALUES(36,3,0,'Flaxseed',0,15.0);
INSERT INTO item VALUES(37,3,0,'Rye',0,6.0);
INSERT INTO item VALUES(38,3,0,'Teff',0,13.999999999999999111);
INSERT INTO item VALUES(39,3,0,'Amaranth',0,13.000000000000000444);
INSERT INTO item VALUES(40,3,0,'Sesame',0,16.000000000000000888);
INSERT INTO item VALUES(41,3,100,'Wheat',1,5.0);
INSERT INTO item VALUES(42,3,50,'Corn',1,2.0);
INSERT INTO item VALUES(43,3,250,'Barley',1,10.0);
INSERT INTO item VALUES(44,3,100,'Peas',1,3.0);
INSERT INTO item VALUES(45,3,150,'Rice',1,4.0);
INSERT INTO item VALUES(46,3,100,'Soybeans',1,7.0);
INSERT INTO item VALUES(47,3,200,'Oats',1,6.0);
INSERT INTO item VALUES(48,3,50,'Lentils',1,8.0);
INSERT INTO item VALUES(49,3,100,'Quinoa',1,11.999999999999999644);
INSERT INTO item VALUES(50,3,100,'Quinoa',1,11.999999999999999644);
INSERT INTO item VALUES(51,3,100,'Chickpeas',1,5.0);
INSERT INTO item VALUES(52,3,50,'Millet',1,3.0);
INSERT INTO item VALUES(53,3,150,'Millet',1,3.0);
INSERT INTO item VALUES(54,3,100,'Sorghum',1,9.0);
INSERT INTO item VALUES(55,3,100,'Beans',1,4.0);
INSERT INTO item VALUES(56,3,100,'Beans',1,4.0);
INSERT INTO item VALUES(57,3,1000,'Spelt',1,10.0);
INSERT INTO item VALUES(58,3,100,'Spelt',1,10.0);
INSERT INTO item VALUES(59,3,900,'Spelt',1,10.0);
INSERT INTO item VALUES(60,3,50,'Flaxseed',1,15.0);
INSERT INTO item VALUES(61,3,800,'Flaxseed',1,15.0);
INSERT INTO item VALUES(62,3,150,'Flaxseed',1,15.0);
INSERT INTO item VALUES(63,3,200,'Rye',1,6.0);
INSERT INTO item VALUES(64,3,100,'Rye',1,6.0);
INSERT INTO item VALUES(65,3,200,'Rye',1,6.0);
INSERT INTO item VALUES(66,3,50,'Rye',1,6.0);
INSERT INTO item VALUES(67,3,100,'Rye',1,6.0);
INSERT INTO item VALUES(68,3,100,'Rye',1,6.0);
INSERT INTO item VALUES(69,3,50,'Rye',1,6.0);
INSERT INTO item VALUES(70,3,150,'Teff',1,13.999999999999999111);
INSERT INTO item VALUES(71,3,500,'Amaranth',1,13.000000000000000444);
INSERT INTO item VALUES(72,3,100,'Amaranth',1,13.000000000000000444);
INSERT INTO item VALUES(73,3,300,'Amaranth',1,13.000000000000000444);
INSERT INTO item VALUES(74,3,100,'Amaranth',1,13.000000000000000444);
INSERT INTO item VALUES(75,3,1200,'Sesame',1,16.000000000000000888);

INSERT INTO listing VALUES(1,3,41,100,'Millet',166.66666666666665186,NULL,1.0);
INSERT INTO listing VALUES(2,3,42,50,'Barley',10,NULL,1.0);
INSERT INTO listing VALUES(3,3,43,250,'Oats',416.66666666666669627,NULL,1.0);
INSERT INTO listing VALUES(4,3,44,100,'Teff',21.428571428571427937,NULL,1.0);
INSERT INTO listing VALUES(5,3,45,150,'Wheat',120,NULL,1.0);
INSERT INTO listing VALUES(6,3,46,100,'Wheat',140,NULL,1.0);
INSERT INTO listing VALUES(7,3,47,200,'Wheat',240,NULL,1.0);
INSERT INTO listing VALUES(8,3,48,50,'Corn',200,NULL,1.0);
INSERT INTO listing VALUES(9,3,49,100,'Beans',300,NULL,1.0);
INSERT INTO listing VALUES(10,3,50,100,'Wheat',240,NULL,1.0);
INSERT INTO listing VALUES(11,3,51,100,'Corn',250,NULL,1.0);
INSERT INTO listing VALUES(12,3,52,50,'Buckwheat',13.636363636363637574,NULL,1.0);
INSERT INTO listing VALUES(13,3,53,150,'Rice',112.5,NULL,1.0);
INSERT INTO listing VALUES(14,3,54,100,'Wheat',180,NULL,1.0);
INSERT INTO listing VALUES(15,3,55,100,'Spelt',40,NULL,1.0);
INSERT INTO listing VALUES(16,3,56,100,'Wheat',80,NULL,1.0);
INSERT INTO listing VALUES(17,3,57,1000,'Flaxseed',666.66666666666660745,NULL,1.0);
INSERT INTO listing VALUES(18,3,58,100,'Wheat',200,NULL,1.0);
INSERT INTO listing VALUES(19,3,59,900,'Corn',4500,NULL,1.0);
INSERT INTO listing VALUES(20,3,60,50,'Millet',250,NULL,1.0);
INSERT INTO listing VALUES(21,3,61,800,'Corn',6000,NULL,1.0);
INSERT INTO listing VALUES(22,3,62,150,'Rice',562.5,NULL,1.0);
INSERT INTO listing VALUES(23,3,63,200,'Chickpeas',240,NULL,1.0);
INSERT INTO listing VALUES(24,3,64,100,'Amaranth',46.153846153846149746,NULL,1.0);
INSERT INTO listing VALUES(25,3,65,200,'Peas',400,NULL,1.0);
INSERT INTO listing VALUES(26,3,66,50,'Barley',30,NULL,1.0);
INSERT INTO listing VALUES(27,3,67,100,'Lentils',75,NULL,1.0);
INSERT INTO listing VALUES(28,3,68,100,'Chickpeas',120,NULL,1.0);
INSERT INTO listing VALUES(29,3,69,50,'Oats',50,NULL,1.0);
INSERT INTO listing VALUES(30,3,70,150,'Sesame',131.25,NULL,1.0);
INSERT INTO listing VALUES(31,3,71,500,'Oats',1083.3333333333332504,NULL,1.0);
INSERT INTO listing VALUES(32,3,72,100,'Lentils',162.5,NULL,1.0);
INSERT INTO listing VALUES(33,3,73,300,'Spelt',390,NULL,1.0);
INSERT INTO listing VALUES(34,3,74,100,'Peas',433.33333333333330372,NULL,1.0);
INSERT INTO listing VALUES(35,3,75,1200,'Teff',1371.4285714285714412,NULL,1.0);