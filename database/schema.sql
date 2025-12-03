-- Database schema for OrdenEya
-- Compatible with TypeORM backend structure

-- Create database (run this separately if needed)
-- CREATE DATABASE IF NOT EXISTS ordeneya;
-- USE ordeneya;

-- Productos table
CREATE TABLE IF NOT EXISTS productos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  costo DECIMAL(10,2) DEFAULT 0,
  imagen VARCHAR(500),
  opciones JSON NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Pedidos table
CREATE TABLE IF NOT EXISTS pedidos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  clienteNombre VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'RECIBIDO',
  metodoPago VARCHAR(50) NULL,
  total DECIMAL(10,2) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Producto variantes table
CREATE TABLE IF NOT EXISTS producto_variantes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  productoId INT NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  costo DECIMAL(10,2) DEFAULT 0,
  sku VARCHAR(100) NULL,
  imagen VARCHAR(500) NULL,
  activo BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (productoId) REFERENCES productos(id) ON DELETE CASCADE
);

-- Pedido items table
CREATE TABLE IF NOT EXISTS pedido_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pedidoId INT NOT NULL,
  productoId INT NOT NULL,
  cantidad INT NOT NULL,
  precioUnitario DECIMAL(10,2) NOT NULL,
  notas TEXT,
  opcionesSeleccionadas JSON NULL,
  varianteId INT NULL,
  varianteNombre VARCHAR(255) NULL,
  numeroPlato INT DEFAULT 1 NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pedidoId) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (productoId) REFERENCES productos(id),
  INDEX idx_numeroPlato (numeroPlato)
);

-- Sample data for productos

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
-- Hash generated with bcryptjs
INSERT INTO users (email, password, role) 
SELECT 'admin@taqueria.com', '$2b$10$cifDJHVJhvoI1IkICOZsr.qCh6AAzMEo6V//pNf3JLctTvG28Oe7u', 'admin'
WHERE NOT EXISTS (SELECT * FROM users WHERE email = 'admin@taqueria.com');