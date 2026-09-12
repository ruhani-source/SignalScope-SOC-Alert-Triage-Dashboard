CREATE TABLE alerts (
alert_id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT NOT NULL, 
event_id INT NOT NULL,
risk_score INT NOT NULL,
severity VARCHAR(20) NOT NULL,
status VARCHAR(30) NOT NULL DEFAULT 'Open',
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (user_id)
 REFERENCES users(user_id),
 
FOREIGN KEY (event_id)
 REFERENCES security_events (event_id)
 );