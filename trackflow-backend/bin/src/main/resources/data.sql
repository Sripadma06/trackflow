-- Seed reference data + demo transactions + working login credentials.
-- Safe to re-run: guarded with NOT EXISTS checks.

INSERT INTO bases (name, location)
SELECT * FROM (VALUES
    ('Fort Alpha', 'Northern Command'),
    ('Fort Bravo', 'Eastern Command'),
    ('Fort Charlie', 'Southern Command')
) AS v(name, location)
WHERE NOT EXISTS (SELECT 1 FROM bases);

INSERT INTO equipment_types (name, category)
SELECT * FROM (VALUES
    ('Rifle', 'WEAPON'),
    ('Sidearm', 'WEAPON'),
    ('5.56mm Ammunition', 'AMMUNITION'),
    ('9mm Ammunition', 'AMMUNITION'),
    ('Humvee', 'VEHICLE'),
    ('Armored Transport', 'VEHICLE')
) AS v(name, category)
WHERE NOT EXISTS (SELECT 1 FROM equipment_types);

-- Users: password hashes below are BCrypt for the plaintext passwords shown.
-- admin / admin123           -> ADMIN (all bases)
-- cmd_alpha / commander123   -> BASE_COMMANDER, Fort Alpha
-- log_alpha / logistics123   -> LOGISTICS_OFFICER, Fort Alpha
INSERT INTO app_users (username, password, full_name, role, base_id)
SELECT 'admin', '$2b$10$oBr.y20u48RHUoyC09P5.O70a2l80F/AmAIRFO9NvQtJkXCjA5k5e', 'System Administrator', 'ADMIN', NULL
WHERE NOT EXISTS (SELECT 1 FROM app_users WHERE username = 'admin');

INSERT INTO app_users (username, password, full_name, role, base_id)
SELECT 'cmd_alpha', '$2b$10$k5fgwloI1WraKYv2YYL5OOA4twxmlcNdB21vAGaKzoQOqMT25wQv2', 'Commander - Fort Alpha', 'BASE_COMMANDER',
       (SELECT id FROM bases WHERE name = 'Fort Alpha')
WHERE NOT EXISTS (SELECT 1 FROM app_users WHERE username = 'cmd_alpha');

INSERT INTO app_users (username, password, full_name, role, base_id)
SELECT 'log_alpha', '$2b$10$TbTVankINzcWF7lNCxMD/Ov0Z9Ps8K/.mndlt9v6SRa.V198cQb3q', 'Logistics Officer - Fort Alpha', 'LOGISTICS_OFFICER',
       (SELECT id FROM bases WHERE name = 'Fort Alpha')
WHERE NOT EXISTS (SELECT 1 FROM app_users WHERE username = 'log_alpha');

-- A little demo history so the dashboard isn't empty on first login.
INSERT INTO purchases (base_id, equipment_type_id, quantity, purchase_date, created_by, created_at)
SELECT (SELECT id FROM bases WHERE name='Fort Alpha'), (SELECT id FROM equipment_types WHERE name='Rifle'), 50, CURRENT_DATE - INTERVAL '10 day', 'admin', now()
WHERE NOT EXISTS (SELECT 1 FROM purchases);

INSERT INTO purchases (base_id, equipment_type_id, quantity, purchase_date, created_by, created_at)
SELECT (SELECT id FROM bases WHERE name='Fort Alpha'), (SELECT id FROM equipment_types WHERE name='5.56mm Ammunition'), 5000, CURRENT_DATE - INTERVAL '8 day', 'admin', now()
WHERE (SELECT count(*) FROM purchases) = 1;

INSERT INTO transfers (from_base_id, to_base_id, equipment_type_id, quantity, transfer_date, created_by, created_at)
SELECT (SELECT id FROM bases WHERE name='Fort Alpha'), (SELECT id FROM bases WHERE name='Fort Bravo'), (SELECT id FROM equipment_types WHERE name='Rifle'), 10, CURRENT_DATE - INTERVAL '5 day', 'admin', now()
WHERE NOT EXISTS (SELECT 1 FROM transfers);

INSERT INTO assignments (base_id, equipment_type_id, personnel_name, quantity, status, assigned_date, created_by, created_at)
SELECT (SELECT id FROM bases WHERE name='Fort Alpha'), (SELECT id FROM equipment_types WHERE name='Rifle'), 'Sgt. J. Rivera', 5, 'ASSIGNED', CURRENT_DATE - INTERVAL '3 day', 'cmd_alpha', now()
WHERE NOT EXISTS (SELECT 1 FROM assignments);

INSERT INTO assignments (base_id, equipment_type_id, personnel_name, quantity, status, assigned_date, expended_date, created_by, created_at)
SELECT (SELECT id FROM bases WHERE name='Fort Alpha'), (SELECT id FROM equipment_types WHERE name='5.56mm Ammunition'), 'Sgt. J. Rivera', 200, 'EXPENDED', CURRENT_DATE - INTERVAL '2 day', CURRENT_DATE - INTERVAL '1 day', 'cmd_alpha', now()
WHERE (SELECT count(*) FROM assignments) = 1;
