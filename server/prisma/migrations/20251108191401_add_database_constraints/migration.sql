/*
  Warnings:

  - You are about to alter the column `action` on the `audit_logs` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `entity` on the `audit_logs` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `entityId` on the `audit_logs` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(36)`.
  - You are about to alter the column `ipAddress` on the `audit_logs` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(45)`.
  - You are about to alter the column `userAgent` on the `audit_logs` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `invoiceNumber` on the `customer_invoices` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `customerName` on the `customer_invoices` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `customerEmail` on the `customer_invoices` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `category` on the `expenses` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `receiptUrl` on the `expenses` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `email` on the `otps` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `otp` on the `otps` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - You are about to alter the column `type` on the `otps` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `role` on the `project_members` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `name` on the `projects` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `clientName` on the `projects` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `clientEmail` on the `projects` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `orderNumber` on the `purchase_orders` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `vendorName` on the `purchase_orders` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `vendorEmail` on the `purchase_orders` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `orderNumber` on the `sales_orders` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `customerName` on the `sales_orders` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `customerEmail` on the `sales_orders` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `fileName` on the `task_attachments` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `fileUrl` on the `task_attachments` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `mimeType` on the `task_attachments` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `title` on the `tasks` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - You are about to alter the column `email` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `password` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `name` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `avatar` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `phone` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `department` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `billNumber` on the `vendor_bills` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `vendorName` on the `vendor_bills` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `vendorEmail` on the `vendor_bills` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "audit_logs" ALTER COLUMN "action" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "entity" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "entityId" SET DATA TYPE VARCHAR(36),
ALTER COLUMN "ipAddress" SET DATA TYPE VARCHAR(45),
ALTER COLUMN "userAgent" SET DATA TYPE VARCHAR(500);

-- AlterTable
ALTER TABLE "customer_invoices" ALTER COLUMN "invoiceNumber" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "customerName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "customerEmail" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "expenses" ALTER COLUMN "category" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "receiptUrl" SET DATA TYPE VARCHAR(500);

-- AlterTable
ALTER TABLE "otps" ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "otp" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "type" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "project_members" ALTER COLUMN "role" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "projects" ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "clientName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "clientEmail" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "purchase_orders" ALTER COLUMN "orderNumber" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "vendorName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "vendorEmail" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "sales_orders" ALTER COLUMN "orderNumber" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "customerName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "customerEmail" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "task_attachments" ALTER COLUMN "fileName" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "fileUrl" SET DATA TYPE VARCHAR(500),
ALTER COLUMN "mimeType" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "tasks" ALTER COLUMN "title" SET DATA TYPE VARCHAR(200);

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "password" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "avatar" SET DATA TYPE VARCHAR(500),
ALTER COLUMN "phone" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "department" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "vendor_bills" ALTER COLUMN "billNumber" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "vendorName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "vendorEmail" SET DATA TYPE VARCHAR(255);
