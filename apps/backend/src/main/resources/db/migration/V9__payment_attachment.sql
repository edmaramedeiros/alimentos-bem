ALTER TABLE payment ADD COLUMN attachment_data BYTEA;
ALTER TABLE payment ADD COLUMN attachment_file_name VARCHAR(255);
ALTER TABLE payment ADD COLUMN attachment_mime_type VARCHAR(100);
