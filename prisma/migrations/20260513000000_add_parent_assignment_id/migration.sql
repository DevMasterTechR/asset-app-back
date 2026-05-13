-- AlterTable
ALTER TABLE "AssignmentHistory" ADD COLUMN "parentAssignmentId" INTEGER;

-- AddForeignKey
ALTER TABLE "AssignmentHistory" ADD CONSTRAINT "AssignmentHistory_parentAssignmentId_fkey" FOREIGN KEY ("parentAssignmentId") REFERENCES "AssignmentHistory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
