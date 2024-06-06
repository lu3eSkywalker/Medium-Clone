/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `ToFollow` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ToFollow_userId_key" ON "ToFollow"("userId");
