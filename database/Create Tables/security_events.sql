CREATE TABLE security_events (
event_id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT NOT NULL,
event_type VARCHAR(50) NOT NULL,
event_timestamp DATETIME NOT NULL,
location VARCHAR(100),
ip_address VARCHAR(45),
device VARCHAR(100),
login_status VARCHAR(20),
vpn_suspected BOOLEAN DEFAULT FALSE,

FOREIGN KEY (user_id)
  REFERENCES users(user_id)
  );