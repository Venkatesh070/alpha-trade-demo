-- Session storage for Exness India demo platform
-- Compatible with MySQL 8+ and SQLite 3

CREATE TABLE IF NOT EXISTS app_sessions (
  id VARCHAR(36) PRIMARY KEY,
  session_type VARCHAR(16) NOT NULL,
  user_email VARCHAR(254),
  admin_email VARCHAR(254),
  device_id VARCHAR(64),
  otp_verified TINYINT NOT NULL DEFAULT 0,
  trusted_until BIGINT,
  payload_json TEXT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_app_sessions_user_email ON app_sessions (user_email);
CREATE INDEX IF NOT EXISTS idx_app_sessions_admin_email ON app_sessions (admin_email);
CREATE INDEX IF NOT EXISTS idx_app_sessions_expires_at ON app_sessions (expires_at);
CREATE INDEX IF NOT EXISTS idx_app_sessions_device ON app_sessions (user_email, device_id);

CREATE TABLE IF NOT EXISTS login_otp_codes (
  email VARCHAR(254) PRIMARY KEY,
  code_hash VARCHAR(64) NOT NULL,
  expires_at BIGINT NOT NULL,
  resend_available_at BIGINT NOT NULL,
  attempts INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_login_otp_expires_at ON login_otp_codes (expires_at);
