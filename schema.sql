-- Schema for the medication dispenser.
--
-- dose_time is TIMESTAMPTZ so every dose is stored as an absolute UTC instant.
-- Timezone conversion to IST happens only on read (see server.js), following
-- the "store in UTC, convert at the edges" rule. Do not do offset math in the
-- client or store naive local times.

CREATE TABLE IF NOT EXISTS medication_schedule (
  id           SERIAL PRIMARY KEY,
  patient_name TEXT        NOT NULL,
  device       INTEGER     NOT NULL,
  pod          INTEGER     NOT NULL,
  dose_time    TIMESTAMPTZ NOT NULL
);
