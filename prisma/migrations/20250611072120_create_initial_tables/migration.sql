-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "onesignal_player_id" TEXT NOT NULL,
    "external_id" TEXT,
    "service" TEXT,
    "subscribed_at" TIMESTAMP(3),
    "last_active" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_onesignal_player_id_key" ON "subscriptions"("onesignal_player_id");
