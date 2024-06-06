-- CreateTable
CREATE TABLE "ToFollow" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ToFollow_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ToFollow" ADD CONSTRAINT "ToFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
