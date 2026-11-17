CREATE DATABASE IF NOT EXISTS stockmarket_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE stockmarket_manager;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  sku VARCHAR(40) NOT NULL UNIQUE,
  category VARCHAR(80) NOT NULL,
  cost_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  sale_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantity INT NOT NULL DEFAULT 0,
  min_quantity INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (cost_price >= 0 AND sale_price >= 0),
  CHECK (quantity >= 0 AND min_quantity >= 0)
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  movement_type ENUM('entrada','saida') NOT NULL,
  quantity INT NOT NULL,
  note VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  CHECK (quantity > 0)
);

INSERT IGNORE INTO products (name,sku,category,cost_price,sale_price,quantity,min_quantity) VALUES
('Arroz tipo 1 5kg','MER-001','Mercearia',22.50,29.90,35,10),
('Feijão carioca 1kg','MER-002','Mercearia',6.20,8.49,8,12),
('Leite integral 1L','LAT-001','Laticínios',4.10,5.49,42,15),
('Café tradicional 500g','MER-003','Mercearia',12.00,16.90,0,8);
