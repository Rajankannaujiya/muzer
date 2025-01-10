/*
  Warnings:

  - You are about to drop the `Downvotes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Downvotes" DROP CONSTRAINT "Downvotes_streamId_fkey";

-- DropForeignKey
ALTER TABLE "Downvotes" DROP CONSTRAINT "Downvotes_userId_fkey";

-- DropTable
DROP TABLE "Downvotes";
