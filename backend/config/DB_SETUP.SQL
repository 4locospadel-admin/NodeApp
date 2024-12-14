-- Create Court Table
CREATE TABLE Court (
    CourtID INT PRIMARY KEY,
    CourtName NVARCHAR(50) NOT NULL
);

-- Create Reservation Table
CREATE TABLE Reservation (
    ReservationID INT PRIMARY KEY IDENTITY(1,1),
    CourtID INT NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL,
    Date DATE NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    Status NVARCHAR(50) NOT NULL,
    CancellationReason NVARCHAR(255) NULL,
    FOREIGN KEY (CourtID) REFERENCES Court(CourtID)
);

-- Create SupportInquiry Table
CREATE TABLE SupportInquiry (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Subject NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX) NOT NULL,
    Answer NVARCHAR(MAX) NULL,
    Status NVARCHAR(50) NOT NULL,
    Notification BIT NOT NULL,
    Created DATETIME NOT NULL,
    Category NVARCHAR(50) NOT NULL,
    Email NVARCHAR(100) NOT NULL
);

-- Create User Table
CREATE TABLE [User] (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL,
    Password NVARCHAR(255) NOT NULL,
    Role NVARCHAR(50) NOT NULL,
    ResetToken NVARCHAR(255) NULL,
    TokenExpiration DATETIME NULL
);