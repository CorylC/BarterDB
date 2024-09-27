
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

CREATE TABLE Listing (
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

CREATE TABLE Transaction (
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