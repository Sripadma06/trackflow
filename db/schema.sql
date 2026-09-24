-- TrackFlow schema (Hibernate ddl-auto=update will also create this automatically on first boot;
-- this file is provided for the required "database dump" deliverable / manual setup).

CREATE TABLE IF NOT EXISTS bases (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    location VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS equipment_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('VEHICLE','WEAPON','AMMUNITION'))
);

CREATE TABLE IF NOT EXISTS app_users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN','BASE_COMMANDER','LOGISTICS_OFFICER')),
    base_id BIGINT REFERENCES bases(id)
);

CREATE TABLE IF NOT EXISTS purchases (
    id BIGSERIAL PRIMARY KEY,
    base_id BIGINT NOT NULL REFERENCES bases(id),
    equipment_type_id BIGINT NOT NULL REFERENCES equipment_types(id),
    quantity INTEGER NOT NULL,
    purchase_date DATE NOT NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS transfers (
    id BIGSERIAL PRIMARY KEY,
    from_base_id BIGINT NOT NULL REFERENCES bases(id),
    to_base_id BIGINT NOT NULL REFERENCES bases(id),
    equipment_type_id BIGINT NOT NULL REFERENCES equipment_types(id),
    quantity INTEGER NOT NULL,
    transfer_date DATE NOT NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS assignments (
    id BIGSERIAL PRIMARY KEY,
    base_id BIGINT NOT NULL REFERENCES bases(id),
    equipment_type_id BIGINT NOT NULL REFERENCES equipment_types(id),
    personnel_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('ASSIGNED','EXPENDED')),
    assigned_date DATE NOT NULL,
    expended_date DATE,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    entity_name VARCHAR(255),
    entity_id VARCHAR(255),
    details VARCHAR(1000),
    timestamp TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_purchases_base_date ON purchases(base_id, purchase_date);
CREATE INDEX IF NOT EXISTS idx_transfers_from_date ON transfers(from_base_id, transfer_date);
CREATE INDEX IF NOT EXISTS idx_transfers_to_date ON transfers(to_base_id, transfer_date);
CREATE INDEX IF NOT EXISTS idx_assignments_base_date ON assignments(base_id, assigned_date);
