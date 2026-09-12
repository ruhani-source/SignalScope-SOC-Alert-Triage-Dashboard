CREATE TABLE alert_indicators (
indicator_id INT AUTO_INCREMENT PRIMARY KEY,
alert_id INT NOT NULL,
indicator_type VARCHAR(100) NOT NULL,
weight INT NOT NULL,
description VARCHAR(255),

FOREIGN KEY (alert_id)
 REFERENCES alerts(alert_id)
 
 );