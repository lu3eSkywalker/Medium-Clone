/*
  Warnings:

  - You are about to drop the `ToFollow` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ToFollow" DROP CONSTRAINT "ToFollow_userId_fkey";

-- DropTable
DROP TABLE "ToFollow";
