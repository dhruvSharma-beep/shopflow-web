-- Migration: add indexes for product search and order lookups
-- Fixes slow queries on /api/products and /api/orders (p99 was 800ms+)

-- Product search: full-text index on name + description
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_search
  ON products USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Orders by user (dashboard + order history)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_created
  ON orders(user_id, created_at DESC);

-- Cart items by session (checkout flow)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cart_items_session
  ON cart_items(session_id) WHERE deleted_at IS NULL;

-- Products by category + price (filter sidebar)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_price
  ON products(category_id, price) WHERE stock > 0 AND deleted_at IS NULL;