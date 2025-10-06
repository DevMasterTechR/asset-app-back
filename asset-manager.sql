-- ============================================
-- HYBRID EAV SYSTEM - ASSET MANAGEMENT
-- Essential Tables Only
-- ============================================

-- ============================================
-- BASE CATALOG TABLES
-- ============================================

CREATE TABLE Branches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    region VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE Roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- ============================================
-- PEOPLE / USERS TABLE
-- ============================================

CREATE TYPE person_status AS ENUM ('active', 'inactive', 'suspended');

CREATE TABLE People (
    id SERIAL PRIMARY KEY,
    national_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255),
    status person_status DEFAULT 'active',
    department_id INT,
    role_id INT,
    branch_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES Departments(id),
    FOREIGN KEY (role_id) REFERENCES Roles(id),
    FOREIGN KEY (branch_id) REFERENCES Branches(id)
);

-- ============================================
-- MAIN ASSETS TABLE (EAV CORE)
-- ============================================

CREATE TYPE asset_status AS ENUM ('available', 'assigned', 'maintenance', 'decommissioned');

CREATE TABLE Assets (
    id SERIAL PRIMARY KEY,
    asset_code VARCHAR(50) UNIQUE NOT NULL,
    asset_type VARCHAR(50) NOT NULL,
    serial_number VARCHAR(100) UNIQUE,
    brand VARCHAR(100),
    model VARCHAR(100),
    status asset_status DEFAULT 'available',
    branch_id INT,
    assigned_person_id INT NULL,
    purchase_date DATE,
    delivery_date DATE,
    received_date DATE,
    notes TEXT,
    attributes_json JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES Branches(id),
    FOREIGN KEY (assigned_person_id) REFERENCES People(id) ON DELETE SET NULL
);

CREATE INDEX idx_assets_asset_type ON Assets(asset_type);
CREATE INDEX idx_assets_status ON Assets(status);

-- ============================================
-- SPECIALIZED TABLE: STORAGE
-- ============================================

CREATE TYPE storage_type AS ENUM ('SSD', 'HDD', 'M.2', 'NVMe', 'eMMC', 'Soldered', 'Other');

CREATE TABLE Storage_Capacity (
    id SERIAL PRIMARY KEY,
    asset_id INT UNIQUE NOT NULL,
    type storage_type NOT NULL,
    capacity_gb INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES Assets(id) ON DELETE CASCADE
);

CREATE INDEX idx_storage_type ON Storage_Capacity(type);
CREATE INDEX idx_storage_capacity ON Storage_Capacity(capacity_gb);

-- ============================================
-- ASSIGNMENT HISTORY TABLE
-- ============================================

CREATE TYPE condition_enum AS ENUM ('excellent', 'good', 'fair', 'poor');

CREATE TABLE Assignment_History (
    id SERIAL PRIMARY KEY,
    asset_id INT NOT NULL,
    person_id INT NOT NULL,
    branch_id INT,
    assignment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    return_date TIMESTAMP NULL,
    delivery_condition condition_enum DEFAULT 'good',
    return_condition condition_enum NULL,
    delivery_notes TEXT,
    return_notes TEXT,
    FOREIGN KEY (asset_id) REFERENCES Assets(id) ON DELETE CASCADE,
    FOREIGN KEY (person_id) REFERENCES People(id),
    FOREIGN KEY (branch_id) REFERENCES Branches(id)
);

CREATE INDEX idx_assignment_asset ON Assignment_History(asset_id);
CREATE INDEX idx_assignment_person ON Assignment_History(person_id);
CREATE INDEX idx_assignment_dates ON Assignment_History(assignment_date, return_date);

-- ============================================
-- INKS TABLE (INDEPENDENT)
-- ============================================

CREATE TABLE Inks (
    id SERIAL PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    color VARCHAR(50) NOT NULL,
    quantity INT DEFAULT 0,
    ink_type VARCHAR(50),
    purchase_date DATE,
    usage_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inks_brand_model ON Inks(brand, model);
CREATE INDEX idx_inks_color ON Inks(color);
CREATE INDEX idx_inks_ink_type ON Inks(ink_type);
CREATE INDEX idx_inks_purchase_date ON Inks(purchase_date);

-- ============================================
-- UTP CABLES TABLE (INDEPENDENT)
-- ============================================

CREATE TYPE utp_type AS ENUM ('indoor', 'outdoor');

CREATE TABLE UTP_Cables (
    id SERIAL PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    type utp_type NOT NULL,
    material VARCHAR(100),
    length_meters INT DEFAULT 0,
    color VARCHAR(50),
    purchase_date DATE,
    usage_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_utp_type ON UTP_Cables(type);
CREATE INDEX idx_utp_material ON UTP_Cables(material);
CREATE INDEX idx_utp_color ON UTP_Cables(color);
CREATE INDEX idx_utp_purchase_date ON UTP_Cables(purchase_date);

-- ============================================
-- RJ45 CONNECTORS TABLE (INDEPENDENT)
-- ============================================

CREATE TABLE RJ45_Connectors (
    id SERIAL PRIMARY KEY,
    model VARCHAR(100) NOT NULL,
    quantity_units INT DEFAULT 0,
    material VARCHAR(100),
    type VARCHAR(50),
    purchase_date DATE,
    usage_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rj45_model ON RJ45_Connectors(model);
CREATE INDEX idx_rj45_type ON RJ45_Connectors(type);
CREATE INDEX idx_rj45_purchase_date ON RJ45_Connectors(purchase_date);

-- ============================================
-- POWER STRIPS TABLE (INDEPENDENT)
-- ============================================

CREATE TABLE Power_Strips (
    id SERIAL PRIMARY KEY,
    brand VARCHAR(100),
    model VARCHAR(100) NOT NULL,
    outlet_count INT,
    length_meters DECIMAL(5,2),
    color VARCHAR(50),
    capacity INT,
    purchase_date DATE,
    usage_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_powerstrips_model ON Power_Strips(model);
CREATE INDEX idx_powerstrips_length ON Power_Strips(length_meters);
CREATE INDEX idx_powerstrips_color ON Power_Strips(color);
CREATE INDEX idx_powerstrips_purchase_date ON Power_Strips(purchase_date);

-- ============================================
-- JSON USAGE EXAMPLES
-- ============================================

/*
-- LAPTOP
INSERT INTO Assets (asset_code, asset_type, serial_number, brand, model, attributes_json)
VALUES ('LAPTOP-001', 'laptop', 'SN123', 'Dell', 'Latitude 5420', 
jsonb_build_object(
    'cpu', 'Intel Core i5-1135G7',
    'gpu', 'Intel Iris Xe Graphics',
    'ram', 16,
    'charger_cable', true,
    'charger', true,
    'charger_notes', 'Original Dell 65W charger'
));

-- Storage for the laptop
INSERT INTO Storage_Capacity (asset_id, type, capacity_gb, notes)
VALUES (1, 'SSD', 512, 'M.2 NVMe');

-- MOUSE (No storage)
INSERT INTO Assets (asset_code, asset_type, brand, model, attributes_json)
VALUES ('MOUSE-001', 'mouse', 'Logitech', 'M720', 
jsonb_build_object(
    'connection', 'Bluetooth',
    'dpi', 1000,
    'battery', true
));
-- Note: Nothing is inserted into Storage_Capacity for the mouse ✅

-- SMARTPHONE
INSERT INTO Assets (asset_code, asset_type, serial_number, brand, model, purchase_date, attributes_json)
VALUES ('CEL-001', 'smartphone', 'IMEI123456', 'Samsung', 'Galaxy S23', '2024-01-15',
jsonb_build_object(
    'cpu', 'Snapdragon 8 Gen 2',
    'ram', 8,
    'charger_cable', true,
    'charger', true,
    'charger_notes', 'Fast charger 25W',
    'stand_model', 'Universal stand',
    'stand_notes', 'Included with phone'
));

-- Storage for the smartphone
INSERT INTO Storage_Capacity (asset_id, type, capacity_gb)
VALUES (3, 'Soldered', 256);

-- PRINTER
INSERT INTO Assets (asset_code, asset_type, serial_number, brand, model, attributes_json)
VALUES ('PRINTER-001', 'printer', 'SNPRINT789', 'HP', 'LaserJet Pro M404n',
jsonb_build_object(
    'ink_type', 'Toner',
    'compatible_ink_model', 'HP 58A',
    'connectivity', jsonb_build_array('USB', 'Ethernet')
));

-- INKS (Independent table - no relation)
INSERT INTO Inks (brand, model, color, quantity, ink_type, purchase_date, usage_date, notes)
VALUES 
('HP', '58A', 'Black', 5, 'Toner', '2024-01-10', NULL, 'Compatible with LaserJet Pro M404n'),
('Canon', 'GI-790', 'Black', 3, 'Pigment', '2024-02-15', '2024-03-01', 'For printer G5010'),
('Canon', 'GI-790', 'Cyan', 2, 'Pigment', '2024-02-15', NULL, 'For printer G5010'),
('Canon', 'GI-790', 'Magenta', 2, 'Pigment', '2024-02-15', NULL, 'For printer G5010'),
('Canon', 'GI-790', 'Yellow', 2, 'Pigment', '2024-02-15', NULL, 'For printer G5010'),
('Epson', 'T664120', 'Black', 4, 'Dye', '2024-03-20', '2024-04-05', 'For EcoTank L3150'),
('HP', '664', 'Tricolor', 6, 'Dye', '2024-01-25', NULL, 'For DeskJet Ink Advantage');

-- DESKTOP COMPUTER
INSERT INTO Assets (asset_code, asset_type, serial_number, brand, model, attributes_json)
VALUES ('DESK-001', 'desktop_computer', 'SNDESK456', 'Custom', 'Workstation Pro',
jsonb_build_object(
    'motherboard_model', 'ASUS ROG STRIX B550-F',
    'fans', 5,
    'cpu', 'AMD Ryzen 7 5800X',
    'ram', 32,
    'gpu', jsonb_build_object(
        'model', 'NVIDIA RTX 3070',
        'ram_gb', 8,
        'notes', 'Dedicated GPU'
    ),
    'monitor', jsonb_build_object(
        'brand', 'LG',
        'model', '27GL850',
        'inches', 27,
        'cable_type', 'DisplayPort',
        'notes', '144Hz Monitor'
    )
));

-- Storage for the desktop
INSERT INTO Storage_Capacity (asset_id, type, capacity_gb, notes)
VALUES (5, 'NVMe', 1000, 'Samsung 980 Pro');

-- KEYBOARD (No storage)
INSERT INTO Assets (asset_code, asset_type, brand, model, attributes_json)
VALUES ('KEYBOARD-001', 'keyboard', 'Logitech', 'K380',
jsonb_build_object(
    'type', 'Wireless',
    'connection', 'Bluetooth',
    'layout', 'Spanish',
    'color', 'Gray'
));

-- UPS
INSERT INTO Assets (asset_code, asset_type, brand, model, attributes_json)
VALUES ('UPS-001', 'ups', 'APC', 'Back-UPS Pro 1500VA',
jsonb_build_object(
    'capacity_va', 1500,
    'capacity_watts', 865,
    'backup_time_min', 15,
    'output_ports', 8
));

-- UTP CABLES (Special type inventory)
INSERT INTO Assets (asset_code, asset_type, brand, attributes_json)
VALUES ('UTP-CABLE-001', 'utp_cable', 'Panduit',
jsonb_build_object(
    'type', 'outdoor',
    'category', 'CAT6',
    'material', '100% copper',
    'length_meters', 305,
    'color', 'Black'
));

-- RJ45 CONNECTORS (Special type inventory)
INSERT INTO Assets (asset_code, asset_type, model, attributes_json)
VALUES ('RJ45-001', 'rj45_connector', 'RJ45 CAT6',
jsonb_build_object(
    'type', 'CAT6',
    'quantity_units', 100,
    'material', 'Gold plated'
));

-- USEFUL QUERIES WITH JSON

-- Search laptops with specific CPU
SELECT * FROM Assets 
WHERE asset_type = 'laptop' 
AND attributes_json ->> 'cpu' LIKE '%i5%';

-- Search assets with included charger
SELECT asset_code, brand, model 
FROM Assets 
WHERE (attributes_json ->> 'charger')::boolean = true;

-- Get RAM from all devices
SELECT 
    asset_code,
    asset_type,
    (attributes_json ->> 'ram')::INT as ram_gb
FROM Assets
WHERE attributes_json ? 'ram';

-- Laptops with their storage
SELECT 
    a.asset_code,
    a.brand,
    a.model,
    a.attributes_json ->> 'cpu' as cpu,
    (a.attributes_json ->> 'ram')::INT as ram,
    s.type as storage_type,
    s.capacity_gb as storage_capacity
FROM Assets a
LEFT JOIN Storage_Capacity s ON a.id = s.asset_id
WHERE a.asset_type = 'laptop';

-- Assets WITHOUT storage (mouse, keyboard, etc.)
SELECT 
    a.asset_code,
    a.asset_type,
    a.brand,
    a.model,
    a.attributes_json
FROM Assets a
LEFT JOIN Storage_Capacity s ON a.id = s.asset_id
WHERE s.id IS NULL;

-- UTP cable inventory by type
SELECT 
    asset_code,
    attributes_json ->> 'type' as type,
    attributes_json ->> 'category' as category,
    (attributes_json ->> 'length_meters')::INT as meters
FROM Assets
WHERE asset_type = 'utp_cable';

-- Available ink inventory
SELECT 
    brand,
    model,
    color,
    quantity,
    ink_type,
    purchase_date,
    CASE 
        WHEN usage_date IS NULL THEN 'Unused'
        ELSE 'Used: ' || usage_date::TEXT
    END as usage_status
FROM Inks
WHERE quantity > 0
ORDER BY brand, model, color;

-- Inks not yet used
SELECT * FROM Inks WHERE usage_date IS NULL AND quantity > 0;

-- Total inks by type
SELECT ink_type, SUM(quantity) as total_quantity
FROM Inks
GROUP BY ink_type;
*/
