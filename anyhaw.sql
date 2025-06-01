CREATE DATABASE IF NOT EXISTS anyhaw;
USE anyhaw;

-- Account Module --
CREATE TABLE Image_List (
    Image_ID INT PRIMARY KEY AUTO_INCREMENT,
    Image LONGBLOB NOT NULL
);

CREATE TABLE Position_List (
    Position_ID INT PRIMARY KEY AUTO_INCREMENT,
    Position_name VARCHAR(100) NOT NULL UNIQUE,
    FULLTEXT(Position_name)
);

CREATE TABLE restaurant_accounts (
    account_id INT AUTO_INCREMENT PRIMARY KEY,
    account_type ENUM('Admin', 'Staff', 'Cashier', 'Kitchen', 'Delivery') NOT NULL,
    position_id INT not null,
    image_id INT default null,
    first_name VARCHAR(50) not null,
    middle_name VARCHAR(50),
    last_name VARCHAR(50) not null,
    contact_number VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(50) not null UNIQUE,
    password VARCHAR(255) not null unique,
    FOREIGN KEY (position_id) REFERENCES Position_List(Position_ID) ON DELETE RESTRICT,
    FOREIGN KEY (image_id) REFERENCES Image_List(Image_ID) ON DELETE cascade
);


CREATE TABLE customer_accounts (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_username VARCHAR(255) NOT NULL UNIQUE,
    Fname VARCHAR(100),
    Mname VARCHAR(100),
    Lname VARCHAR(100),
    contact_number VARCHAR(15) UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE customer_locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    location_name VARCHAR(255) NOT NULL,
    customer_id INT,
    Street_Address TEXT NOT NULL,
    Barangay_Subdivision TEXT NOT NULL,
    City_Municipality TEXT NOT NULL,
    Province_Region TEXT NOT NULL,
    landmark text not null,
    FOREIGN KEY (customer_id) REFERENCES customer_accounts(customer_id) ON DELETE CASCADE on update cascade
);

-- Menu Module --
CREATE TABLE Food_Category (
    F_Category_ID INT PRIMARY KEY AUTO_INCREMENT,
    Category_Name VARCHAR(100) NOT NULL UNIQUE,
    FULLTEXT(Category_Name)
);

CREATE TABLE Food_List (
    Food_ID INT PRIMARY KEY AUTO_INCREMENT,
    Food_Name VARCHAR(100) NOT NULL,
    Availability BOOLEAN NOT NULL,
    FULLTEXT(Food_Name)
);

CREATE TABLE Normal_Food_List (
    N_List_ID INT PRIMARY KEY AUTO_INCREMENT,
    Food_ID INT NOT NULL UNIQUE,
    F_Category_ID INT NOT NULL,
    Image_ID INT NOT NULL UNIQUE,
    Description TEXT DEFAULT NULL,
    Price DECIMAL(10,2) NOT NULL,
    Code_Name VARCHAR(50) NOT NULL UNIQUE,
    FOREIGN KEY (Food_ID) REFERENCES Food_List(Food_ID) ON DELETE RESTRICT,
    FOREIGN KEY (F_Category_ID) REFERENCES Food_Category(F_Category_ID) ON DELETE RESTRICT,
    FOREIGN KEY (Image_ID) REFERENCES Image_List(Image_ID) ON DELETE RESTRICT,
    FULLTEXT(Description, Code_Name)
);

CREATE TABLE Drink_Category (
    Dr_Category_ID INT PRIMARY KEY AUTO_INCREMENT,
    Category_Name VARCHAR(100) NOT NULL UNIQUE,
    FULLTEXT(Category_Name)
);

CREATE TABLE Drink_List (
    Drink_ID INT PRIMARY KEY AUTO_INCREMENT,
    Dr_Category_ID INT NOT NULL,
    Image_ID INT NOT NULL UNIQUE,
    Drink_Name VARCHAR(150) NOT NULL,
    Code_Name VARCHAR(25) NOT NULL UNIQUE,
    Price DECIMAL(10,2) NOT NULL,
    Availability BOOLEAN NOT NULL,
    FOREIGN KEY (Dr_Category_ID) REFERENCES Drink_Category(Dr_Category_ID) ON DELETE RESTRICT,
    FOREIGN KEY (Image_ID) REFERENCES Image_List(Image_ID) ON DELETE RESTRICT,
    FULLTEXT(Drink_Name, Code_Name)
);

CREATE TABLE Dessert_Category (
    De_Category_ID INT PRIMARY KEY AUTO_INCREMENT,
    Category_Name VARCHAR(100) NOT NULL UNIQUE,
    Availability BOOLEAN NOT NULL,
    FULLTEXT(Category_Name)
);

CREATE TABLE Dessert_List (
    Dessert_ID INT PRIMARY KEY AUTO_INCREMENT,
    De_Category_ID INT NOT NULL,
    Image_ID INT NOT NULL UNIQUE,
    Dessert_Name VARCHAR(100) NOT NULL,
    Code_Name VARCHAR(50) NOT NULL UNIQUE,
    Price DECIMAL(10,2) NOT NULL,
    Availability BOOLEAN NOT NULL,
    FOREIGN KEY (De_Category_ID) REFERENCES Dessert_Category(De_Category_ID) ON DELETE RESTRICT,
    FOREIGN KEY (Image_ID) REFERENCES Image_List(Image_ID) ON DELETE RESTRICT,
    FULLTEXT(Dessert_Name, Code_Name)
);

CREATE TABLE Combo_Category (
    C_Category_ID INT PRIMARY KEY AUTO_INCREMENT,
    Category_Name VARCHAR(100) NOT NULL UNIQUE,
    FULLTEXT(Category_Name)
);

CREATE TABLE Combo_Food_Details (
    C_Details_ID INT PRIMARY KEY AUTO_INCREMENT,
    Image_ID INT NOT NULL UNIQUE,
    Description TEXT NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (Image_ID) REFERENCES Image_List(Image_ID) ON DELETE RESTRICT,
    FULLTEXT(Description)
);

CREATE TABLE Combo_Food_List (
    Combo_List_ID INT PRIMARY KEY AUTO_INCREMENT,
    C_Category_ID INT NOT NULL,
    C_Details_ID INT NOT NULL,
    Code_Name VARCHAR(50) NOT NULL UNIQUE,
    Availability BOOLEAN NOT NULL,
    FOREIGN KEY (C_Category_ID) REFERENCES Combo_Category(C_Category_ID) ON DELETE RESTRICT,
    FOREIGN KEY (C_Details_ID) REFERENCES Combo_Food_Details(C_Details_ID) ON DELETE RESTRICT,
    FULLTEXT(Code_Name)
);

CREATE TABLE Combo_Food_Organizer (
    Combo_Food_ID INT PRIMARY KEY AUTO_INCREMENT,
    Item_ID INT NOT NULL,
    Item_Type ENUM('normal', 'drink', 'dessert') NOT NULL,
    Combo_List_ID INT NOT NULL,
    FOREIGN KEY (Combo_List_ID) REFERENCES Combo_Food_List(Combo_List_ID) ON DELETE RESTRICT
);

CREATE TABLE Discount_Table (
    Discount_ID INT PRIMARY KEY AUTO_INCREMENT,
    Discount_Name VARCHAR(50) UNIQUE NOT NULL,
    Discount_Percent DECIMAL(5,2) NOT NULL,
    FULLTEXT(Discount_Name)
);

CREATE TABLE Ordered_Logs (
    Or_Logs_ID INT PRIMARY KEY AUTO_INCREMENT,
    Transaction_ID VARCHAR(25) NOT NULL UNIQUE,
    customer_id INT DEFAULT NULL,
    cashier_id INT DEFAULT NULL,
    Original_Price INT not null,
    Discount_ID INT DEFAULT NULL,
    Total_Price DECIMAL(10,2) NOT NULL,
    payment_method text,
    order_type ENUM('delivery', 'dine-in', 'take-out') not null,
    status ENUM('unpaid', 'paid', 'cancelled') DEFAULT 'unpaid',
    Date_Time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer_accounts(customer_id),
    FOREIGN KEY (Discount_ID) REFERENCES Discount_Table(Discount_ID),
    FOREIGN KEY (cashier_id) REFERENCES restaurant_accounts(account_id)
);

CREATE TABLE Ordered_Items (
    Or_Items_ID INT PRIMARY KEY AUTO_INCREMENT,
    Or_Logs_ID INT NOT NULL,
    item_id INT NOT NULL,
    Item_Type ENUM('normal', 'drink', 'dessert', 'combo') NOT NULL,
    Quantity INT NOT NULL,
    Price_Per_Item DECIMAL(10,2) NOT NULL,
    Total_Item_Price DECIMAL(10,2) AS (Quantity * Price_Per_Item) STORED,
    FOREIGN KEY (Or_Logs_ID) REFERENCES Ordered_Logs(Or_Logs_ID) ON DELETE CASCADE
);

CREATE TABLE System_Log (
    System_Log_ID INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT,
    Action_Type VARCHAR(10) NOT NULL,
    Table_Name VARCHAR(100) NOT NULL,
    Affected_Row_ID INT NOT NULL,
    Old_Data TEXT NOT NULL,
    NEW_Data TEXT NOT NULL,
    Full_Details TEXT NOT NULL,
    Date_Time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES restaurant_accounts(account_id) ON DELETE SET NULL,
    FULLTEXT(Action_Type, Table_Name, Full_Details)
);

CREATE TABLE Activity_Log (
    Log_ID INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT,
    Fullname VARCHAR(255) NOT NULL,
    Date_Time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Action_Type VARCHAR(10) NOT NULL,
    FOREIGN KEY (account_id) REFERENCES restaurant_accounts(account_id) ON DELETE SET NULL,
    FULLTEXT(Fullname, Action_Type)
);

-- --------------------------------------------------
-- order processing --
CREATE TABLE processing_orders (
    order_ID INT PRIMARY KEY AUTO_INCREMENT,
    order_status VARCHAR(10) DEFAULT "Pending" NOT NULL,
    customer_id int,
    customer_note text,
    transaction_id INT NOT NULL UNIQUE,
    order_list_id INT NOT NULL UNIQUE,
    delivery_payment_status Enum("Yes","No"),
    delivery_distance DECIMAL(10,5),
    delivery_payment_method Enum("cash","gcash"),
    table_number int,
    order_type ENUM('dine-in','take-out','delivery') not null default 'dine-in',
    order_time timestamp not null default current_timestamp,
    foreign key (customer_id) references customer_accounts(customer_id)
);

CREATE TABLE processing_order_items (
    order_list_ID INT PRIMARY KEY AUTO_INCREMENT,
    order_ID INT NOT NULL,
    item_id INT NOT NULL,
    Item_Type ENUM('normal', 'drink', 'dessert', 'combo') NOT NULL,
    Quantity INT NOT NULL,
    Prep_status Enum('preparing','prepared') default 'preparing', 
    Price_Per_Item DECIMAL(10,2) NOT NULL,
    Total_Item_Price DECIMAL(10,2) AS (Quantity * Price_Per_Item) STORED,
    FOREIGN KEY (order_ID) REFERENCES processing_orders(order_ID) ON DELETE CASCADE ON UPDATE CASCADE
);
