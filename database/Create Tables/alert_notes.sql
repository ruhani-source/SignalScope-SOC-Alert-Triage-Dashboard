USE soc_triage;

CREATE TABLE alert_notes (
    note_id INT AUTO_INCREMENT PRIMARY KEY,
    alert_id INT NOT NULL,
    note_text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (alert_id)
        REFERENCES alerts(alert_id)
);