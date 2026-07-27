-- AlterTable
ALTER TABLE "parents" ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "grade" TEXT,
ALTER COLUMN "birth_date" DROP NOT NULL;
