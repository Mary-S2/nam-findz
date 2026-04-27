-- namFindz database export
-- Generated at 2026-04-27T04:03:55.123Z
-- 
-- Run this AFTER `pnpm --filter @workspace/db run push` has created the tables.
-- Wipes existing rows in each table before inserting.

BEGIN;

TRUNCATE TABLE messages, activity, reports, document_types, users RESTART IDENTITY CASCADE;

-- users: no rows

-- document_types: 12 rows
INSERT INTO "document_types" ("slug", "label") VALUES
  ('national_id', 'National ID Card'),
  ('drivers_license', 'Driver''s License'),
  ('passport', 'Passport'),
  ('birth_certificate', 'Birth Certificate'),
  ('academic_certificate', 'Academic Certificate'),
  ('work_permit', 'Work Permit'),
  ('wallet', 'Wallet'),
  ('phone', 'Mobile Phone'),
  ('keys', 'Keys'),
  ('bag', 'Bag / Backpack'),
  ('bank_card', 'Bank Card'),
  ('other', 'Other');

-- reports: 12 rows
INSERT INTO "reports" ("id", "kind", "status", "document_type", "title", "name_on_document", "description", "location", "event_date", "contact_name", "contact_phone", "contact_email", "photo_url", "reward", "flag_count", "user_id", "created_at") VALUES
  (1, 'lost', 'active', 'national_id', 'Namibian National ID lost in Windhoek CBD', 'Tangeni Shilongo', 'Lost my green national ID card in a brown wallet between Independence Avenue and Wernhil Park. Reward offered for safe return.', 'Windhoek CBD, Independence Avenue', '2026-04-22', 'Tangeni S.', '+264 81 555 0142', 'tangeni.s@example.na', NULL, 'N$300', 0, NULL, '2026-04-26T17:23:12.070Z'),
  (2, 'found', 'active', 'drivers_license', 'Driver''s licence found near Maerua Mall taxi rank', 'P. Nakale', 'Picked up a Namibian driver''s licence card on the pavement outside the Maerua Mall taxi rank on Saturday afternoon. Holding it safely.', 'Maerua Mall, Windhoek', '2026-04-20', 'Helena', '+264 85 555 0199', NULL, NULL, NULL, 0, NULL, '2026-04-26T17:23:12.070Z'),
  (3, 'lost', 'active', 'passport', 'South African passport missing after Eros flight', 'Lerato Mokoena', 'Travelled SA Airlink from Johannesburg to Eros on 18 April. Passport missing from carry-on by the time I reached the hotel. Urgently needed.', 'Eros Airport, Windhoek', '2026-04-18', 'Lerato M.', NULL, 'lerato.mokoena@example.com', NULL, 'N$1500', 0, NULL, '2026-04-26T17:23:12.070Z'),
  (4, 'found', 'active', 'passport', 'Passport handed in at Eros Airport information desk', 'L. Mokoena', 'A passport was handed in to the Eros information desk on Saturday evening. Owner can collect with proof of identity.', 'Eros Airport information desk, Windhoek', '2026-04-19', 'Eros Info Desk', '+264 61 555 0188', 'info@erosairport.example.na', NULL, NULL, 0, NULL, '2026-04-26T17:23:12.070Z'),
  (5, 'lost', 'active', 'phone', 'Black Samsung phone lost in Katutura combi', NULL, 'Black Samsung Galaxy A54, cracked top-left corner, in a clear silicone case. Slipped out in a combi from Katutura to town.', 'Katutura to Windhoek CBD, combi route', '2026-04-21', 'Selma', '+264 81 555 0107', NULL, NULL, 'N$500', 0, NULL, '2026-04-26T17:23:12.070Z'),
  (6, 'found', 'matched', 'wallet', 'Brown leather wallet found at Wernhil Park', NULL, 'Brown leather wallet containing cards and a small amount of cash, found near the food court entrance.', 'Wernhil Park, Windhoek', '2026-04-15', 'Centre Management', '+264 61 555 0123', 'lostandfound@wernhil.example.na', NULL, NULL, 0, NULL, '2026-04-26T17:23:12.070Z'),
  (7, 'lost', 'claimed', 'academic_certificate', 'UNAM matric certificate copy lost in printing shop', 'Johannes Amupolo', 'Certified copy of grade 12 certificate left at a printing shop in town. Recovered with help from a kind shop assistant.', 'Independence Avenue, Windhoek', '2026-04-08', 'Johannes A.', '+264 81 555 0166', NULL, NULL, NULL, 0, NULL, '2026-04-26T17:23:12.070Z'),
  (8, 'found', 'active', 'keys', 'Bunch of car and house keys, Toyota fob', NULL, 'Set of keys with a Toyota remote and a small leather tag with the initials ''KS''. Found in the parking lot.', 'Grove Mall, Windhoek', '2026-04-23', 'Grove Mall Security', '+264 61 555 0144', NULL, NULL, NULL, 0, NULL, '2026-04-26T17:23:12.070Z'),
  (9, 'lost', 'active', 'bank_card', 'FNB bank card lost at petrol station', 'M. Nghipandulwa', 'Blue FNB debit card. Last used at a petrol station in Pioneers Park. Card has already been blocked, just want it back to destroy.', 'Pioneers Park, Windhoek', '2026-04-24', 'Maria', '+264 81 555 0133', NULL, NULL, NULL, 0, NULL, '2026-04-26T17:23:12.070Z'),
  (10, 'lost', 'active', 'bag', 'Black laptop bag forgotten at Swakopmund taxi', NULL, 'Black laptop sleeve with a Lenovo ThinkPad inside, plus a notebook with handwritten engineering notes. Forgotten in a taxi in Swakopmund.', 'Swakopmund taxi rank', '2026-04-19', 'David', '+264 81 555 0151', 'david.k@example.na', NULL, 'N$1000', 0, NULL, '2026-04-26T17:23:12.070Z'),
  (11, 'found', 'active', 'national_id', 'Green ID card found at Wernhil parking', 'T. Shilongo', 'Green Namibian ID card picked up in the lower parking deck. Looks recent. Holding for the owner.', 'Wernhil Park parking, Windhoek', '2026-04-23', 'Wernhil Lost & Found', '+264 61 555 0188', NULL, NULL, NULL, 0, NULL, '2026-04-26T17:23:12.070Z'),
  (12, 'found', 'active', 'academic_certificate', 'Folder of certified copies left at copy shop', NULL, 'Plastic folder containing certified copies of school certificates and an ID. Left on the counter at the copy shop.', 'Klein Windhoek copy shop', '2026-04-22', 'CopyZone Klein Windhoek', '+264 61 555 0177', NULL, NULL, NULL, 0, NULL, '2026-04-26T17:23:12.070Z');

-- messages: 2 rows
INSERT INTO "messages" ("id", "report_id", "author_name", "body", "created_at") VALUES
  (1, 3, 'Eros Info Desk', 'Hello, we have a passport handed in matching the name. Please come with another form of ID to collect.', '2026-04-26T17:23:12.077Z'),
  (2, 3, 'Lerato M.', 'Thank you so much. I can be there tomorrow morning at 9am with my driver''s licence.', '2026-04-26T17:23:12.077Z');

-- activity: 5 rows
INSERT INTO "activity" ("id", "kind", "title", "document_type", "location", "timestamp") VALUES
  (1, 'match', 'Match found: Brown leather wallet at Wernhil Park', 'wallet', 'Wernhil Park, Windhoek', '2026-04-26T17:23:12.080Z'),
  (2, 'recovery', 'Recovered: UNAM matric certificate copy', 'academic_certificate', 'Independence Avenue, Windhoek', '2026-04-26T17:23:12.080Z'),
  (3, 'new_report', 'New found report: Folder of certified copies', 'academic_certificate', 'Klein Windhoek copy shop', '2026-04-26T17:23:12.080Z'),
  (4, 'new_report', 'New lost report: FNB bank card', 'bank_card', 'Pioneers Park, Windhoek', '2026-04-26T17:23:12.080Z'),
  (5, 'new_report', 'New found report: Bunch of car and house keys', 'keys', 'Grove Mall, Windhoek', '2026-04-26T17:23:12.080Z');


-- Reset sequences so future inserts don't collide with imported IDs
SELECT setval(pg_get_serial_sequence('reports', 'id'), COALESCE((SELECT MAX(id) FROM reports), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('messages', 'id'), COALESCE((SELECT MAX(id) FROM messages), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('activity', 'id'), COALESCE((SELECT MAX(id) FROM activity), 0) + 1, false);

COMMIT;
