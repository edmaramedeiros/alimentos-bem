ALTER TABLE product ADD COLUMN category VARCHAR(60);

CREATE INDEX idx_product_category ON product (category);
