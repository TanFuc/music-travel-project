-- Add ticket_tier_id to booking_items (snake_case for Prisma @map).
-- If old camelCase column "ticketTierId" exists (from add_init), copy and drop it.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'booking_items' AND column_name = 'ticket_tier_id'
  ) THEN
    NULL;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'booking_items' AND column_name = 'ticketTierId'
  ) THEN
    ALTER TABLE "booking_items" RENAME COLUMN "ticketTierId" TO ticket_tier_id;
  ELSE
    ALTER TABLE "booking_items" ADD COLUMN ticket_tier_id INTEGER;
  END IF;
END $$;

-- Add FK if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'booking_items_ticket_tier_id_fkey'
  ) THEN
    ALTER TABLE "booking_items"
    ADD CONSTRAINT "booking_items_ticket_tier_id_fkey"
    FOREIGN KEY ("ticket_tier_id") REFERENCES "ticket_tiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
