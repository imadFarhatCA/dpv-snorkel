-- Store signed waiver form data as JSON
ALTER TABLE bookings ADD COLUMN waiver_data TEXT DEFAULT '';
