CREATE DATABASE odoo;
USE odoo;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255)
);

CREATE TABLE companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100)
);

CREATE TABLE technicians (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100)
);

CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100)
);

CREATE TABLE teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  company_id INT
);

CREATE TABLE team_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_id INT,
  technician_id INT
);

CREATE TABLE equipment_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  responsible VARCHAR(100),
  company_id INT
);

CREATE TABLE work_centers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  department VARCHAR(100),
  description TEXT,
  tag VARCHAR(50),
  alternatives VARCHAR(100),
  cost_per_hour DECIMAL(10,2),
  capacity_percentage INT,
  oee_target INT
);

CREATE TABLE equipment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  category_id INT,
  serial_number VARCHAR(100),
  technician_id INT,
  employee_id INT,
  team_id INT,
  work_center_id INT,
  description TEXT
);

CREATE TABLE maintenance_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150),
  equipment_id INT,
  type ENUM('CORRECTIVE','PREVENTIVE'),
  priority ENUM('LOW','MEDIUM','HIGH'),
  status ENUM('NEW','IN_PROGRESS','REPAIRED','SCRAP'),
  due_date DATE,
  team_id INT,
  technician_id INT,
  notes TEXT
);
