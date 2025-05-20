/*
  Warnings:

  - Changed the type of `linkPrecedence` on the `Contact` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "linkPrecedence",
ADD COLUMN     "linkPrecedence" TEXT NOT NULL;

-- DropEnum
DROP TYPE "LinkType";
