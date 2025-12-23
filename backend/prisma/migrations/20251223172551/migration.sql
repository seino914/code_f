-- CreateEnum
CREATE TYPE "Unit" AS ENUM ('GRAM', 'KILOGRAM', 'STICK', 'PIECE');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('REGULAR', 'SINGLE', 'LUNCH_BOX');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "google_id" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'email',
    "role" TEXT NOT NULL DEFAULT 'user',
    "company" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" "Unit" NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "purchase_date" TIMESTAMP(3) NOT NULL,
    "purchase_unit" TEXT NOT NULL,
    "purchase_total" DECIMAL(10,2) NOT NULL,
    "purchase_subtotal" DECIMAL(10,2) NOT NULL,
    "usage_amount" DECIMAL(10,2) NOT NULL,
    "purchase_amount" DECIMAL(10,2) NOT NULL,
    "monthly_usage_amount" DECIMAL(10,2) NOT NULL,
    "ingredient_cost" DECIMAL(10,2) NOT NULL,
    "previous_month_actual_stock" DECIMAL(10,2) NOT NULL,
    "current_month_actual_stock" DECIMAL(10,2) NOT NULL,
    "current_month_inventory_amount" DECIMAL(10,2) NOT NULL,
    "stock_amount" DECIMAL(10,2) NOT NULL,
    "current_month_theoretical_material_value" DECIMAL(10,2) NOT NULL,
    "current_month_theoretical_stock" DECIMAL(10,2) NOT NULL,
    "variance_amount" DECIMAL(10,2) NOT NULL,
    "variance_amount_money" DECIMAL(10,2) NOT NULL,
    "variance_rate" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Menu" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "menu_cost" DECIMAL(10,2) NOT NULL,
    "serving_count" INTEGER NOT NULL,
    "menu_theoretical_cost" DECIMAL(10,2) NOT NULL,
    "ingredient_theoretical_cost" DECIMAL(10,2) NOT NULL,
    "selling_price" DECIMAL(10,2) NOT NULL,
    "monthly_sales" DECIMAL(10,2) NOT NULL,
    "ingredient_theoretical_cost_rate" DECIMAL(5,2) NOT NULL,
    "ingredient_cost_rate" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_google_id_key" ON "User"("google_id");
