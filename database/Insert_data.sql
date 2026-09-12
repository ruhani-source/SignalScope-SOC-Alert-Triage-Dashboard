INSERT INTO users (email, department, role, usual_location)
VALUES
    ('alice@company.com', 'Engineering', 'Software Engineer', 'Canada'),
    ('bob@company.com', 'Finance', 'Financial Analyst', 'Canada'),
    ('charlie@company.com', 'IT', 'System Administrator', 'Canada'),
    ('diana@company.com', 'Human Resources', 'HR Manager', 'Canada'),
    ('ethan@company.com', 'Engineering', 'DevOps Engineer', 'USA'),
    ('fatima@company.com', 'Finance', 'Accountant', 'Canada'),
    ('george@company.com', 'IT', 'Security Analyst', 'Canada'),
    ('helen@company.com', 'Management', 'Director', 'USA');
    
INSERT INTO security_events (
    user_id,
    event_type,
    event_timestamp,
    location,
    ip_address,
    device,
    login_status,
    vpn_suspected
)
VALUES
-- Alice
(1, 'login', '2026-09-01 08:00:00', 'Canada', '192.168.1.10', 'MacBook', 'success', FALSE),
(1, 'login', '2026-09-01 10:00:00', 'Russia', '185.220.101.1', 'Unknown', 'success', TRUE),

-- Bob
(2, 'login', '2026-09-01 09:00:00', 'Canada', '192.168.1.20', 'Windows PC', 'success', FALSE),
(2, 'login', '2026-09-01 10:30:00', 'Germany', '91.198.174.1', 'Windows PC', 'success', FALSE),

-- Charlie
(3, 'login', '2026-09-01 07:30:00', 'Canada', '192.168.1.30', 'Linux Workstation', 'success', FALSE),
(3, 'login', '2026-09-01 12:00:00', 'Canada', '198.51.100.25', 'Linux Workstation', 'success', TRUE),

-- Diana - normal activity
(4, 'login', '2026-09-01 08:15:00', 'Canada', '192.168.1.40', 'MacBook', 'success', FALSE),
(4, 'login', '2026-09-02 08:20:00', 'Canada', '192.168.1.40', 'MacBook', 'success', FALSE),

-- Ethan - failed logins followed by success
(5, 'login', '2026-09-01 07:50:00', 'USA', '203.0.113.10', 'Unknown', 'failed', FALSE),
(5, 'login', '2026-09-01 07:52:00', 'USA', '203.0.113.10', 'Unknown', 'failed', FALSE),
(5, 'login', '2026-09-01 07:54:00', 'USA', '203.0.113.10', 'Unknown', 'failed', FALSE),
(5, 'login', '2026-09-01 07:57:00', 'USA', '203.0.113.10', 'Windows PC', 'success', FALSE),

-- Fatima - new device
(6, 'login', '2026-09-01 09:00:00', 'Canada', '192.168.1.60', 'MacBook', 'success', FALSE),
(6, 'login', '2026-09-02 09:15:00', 'Canada', '192.168.1.61', 'Unknown Device', 'success', FALSE),

-- George - normal activity
(7, 'login', '2026-09-01 08:30:00', 'Canada', '192.168.1.70', 'Windows PC', 'success', FALSE),
(7, 'login', '2026-09-02 08:35:00', 'Canada', '192.168.1.70', 'Windows PC', 'success', FALSE),

-- Helen - new country
(8, 'login', '2026-09-01 09:30:00', 'USA', '192.168.1.80', 'MacBook', 'success', FALSE),
(8, 'login', '2026-09-01 14:00:00', 'Japan', '203.0.113.80', 'MacBook', 'success', FALSE);



INSERT INTO alerts (
    user_id,
    event_id,
    risk_score,
    severity,
    status
)
VALUES
    (1, 2, 85, 'Critical', 'Open'),
    (2, 4, 55, 'Medium', 'Investigating'),
    (3, 6, 40, 'Medium', 'Open'),
    (5, 12, 65, 'High', 'Open'),
    (6, 14, 30, 'Medium', 'Resolved');
    
    
INSERT INTO alert_indicators (
    alert_id,
    indicator_type,
    weight,
    description
)
VALUES

-- Alert 1: Alice
(1, 'new_country', 30,
 'Login detected from a country different from the user''s usual location'),

(1, 'impossible_travel', 25,
 'Login locations changed from Canada to Russia within a short time period'),

(1, 'new_device', 20,
 'Login detected from an unfamiliar device'),

(1, 'vpn_suspected', 10,
 'Login originated from an IP address associated with possible VPN or proxy usage'),


-- Alert 2: Bob
(2, 'new_country', 30,
 'Login detected from a country different from the user''s usual location'),

(2, 'impossible_travel', 25,
 'Login locations changed from Canada to Germany within a short time period'),


-- Alert 3: Charlie
(3, 'vpn_suspected', 40,
 'Login originated from an IP address associated with possible VPN or proxy usage'),


-- Alert 4: Ethan
(4, 'multiple_failed_logins', 40,
 'Multiple failed login attempts occurred shortly before a successful login'),

(4, 'new_device', 25,
 'Successful login occurred from an unfamiliar device'),


-- Alert 5: Fatima
(5, 'new_device', 30,
 'Login detected from an unfamiliar device');