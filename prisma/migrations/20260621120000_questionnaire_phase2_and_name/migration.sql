-- User name (shown on the dashboard sidebar; seeded from Clerk, editable in-app)
ALTER TABLE "User" ADD COLUMN "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN "lastName" TEXT;

-- Phase 2 preferences: age + sex (scored) and hoursAlone (soft signal)
ALTER TABLE "AdopterProfile" ADD COLUMN "agePreference" TEXT;
ALTER TABLE "AdopterProfile" ADD COLUMN "sexPreference" TEXT;
ALTER TABLE "AdopterProfile" ADD COLUMN "hoursAlone" TEXT;
