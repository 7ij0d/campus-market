-- =============================================================================
-- CampusMarket — University Marketplace Platform (Full PostgreSQL + RLS Schema)
-- Currency: LYD (الدينار الليبي) | Primary Locale: ar-LY (RTL)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Roles & Permissions
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL, -- 'customer', 'merchant', 'admin', 'super_admin'
    display_name_ar VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL,
    description_ar TEXT NOT NULL,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE
);

-- 2. Locations (Faculties / Campus Pickup Points)
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ar VARCHAR(150) NOT NULL,
    name_en VARCHAR(150),
    campus_name_ar VARCHAR(150) NOT NULL DEFAULT 'الحرم الجامعي الرئيسي',
    pickup_points JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Users & Profiles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(30),
    password_hash TEXT,
    role VARCHAR(30) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'merchant', 'admin', 'super_admin')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    avatar_url TEXT,
    faculty_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    student_id_number VARCHAR(50),
    marketing_notifications BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Platform Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon_name VARCHAR(60) NOT NULL,
    color_bg VARCHAR(30) DEFAULT '#F3E8FF',
    color_text VARCHAR(30) DEFAULT '#6D28D9',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Stores & Merchant Invitations
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    name_en VARCHAR(150) NOT NULL,
    name_ar VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    activity_type_ar VARCHAR(120) NOT NULL,
    description_ar TEXT NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    logo_url TEXT NOT NULL,
    cover_url TEXT NOT NULL,
    icon_bg_color VARCHAR(30) DEFAULT '#4A3525',
    location_inside_campus VARCHAR(200) NOT NULL DEFAULT 'داخل الكلية',
    working_hours VARCHAR(100), -- e.g. '08:00 - 18:00'
    is_open BOOLEAN DEFAULT TRUE,
    supports_pickup BOOLEAN DEFAULT TRUE,
    supports_delivery BOOLEAN DEFAULT TRUE,
    delivery_fee_lyd NUMERIC(10, 2) DEFAULT 0.00,
    contact_phone VARCHAR(30),
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended', 'rejected')),
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE store_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    member_role VARCHAR(50) DEFAULT 'owner' CHECK (member_role IN ('owner', 'manager', 'staff')),
    permissions JSONB DEFAULT '["manage_products", "manage_orders", "manage_store"]'::jsonb,
    UNIQUE(store_id, user_id)
);

CREATE TABLE store_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token VARCHAR(120) UNIQUE NOT NULL,
    invited_email VARCHAR(255),
    proposed_store_name VARCHAR(150) NOT NULL,
    category_id UUID REFERENCES categories(id),
    created_by_admin_id UUID REFERENCES users(id),
    is_used BOOLEAN DEFAULT FALSE,
    used_by_user_id UUID REFERENCES users(id),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Store Internal Categories
CREATE TABLE store_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    name_ar VARCHAR(100) NOT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- 7. Products, Images, Variants & Inventory
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    store_category_id UUID REFERENCES store_categories(id) ON DELETE SET NULL,
    name_ar VARCHAR(200) NOT NULL,
    name_en VARCHAR(200),
    description_ar TEXT NOT NULL,
    price_lyd NUMERIC(10, 2) NOT NULL CHECK (price_lyd >= 0),
    old_price_lyd NUMERIC(10, 2) CHECK (old_price_lyd IS NULL OR old_price_lyd > price_lyd),
    discount_percent INT GENERATED ALWAYS AS (
        CASE
            WHEN old_price_lyd IS NOT NULL AND old_price_lyd > price_lyd AND old_price_lyd > 0
            THEN ROUND(((old_price_lyd - price_lyd) / old_price_lyd) * 100)::INT
            ELSE NULL
        END
    ) STORED,
    primary_image_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_available_for_sale BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    sort_order INT DEFAULT 0
);

CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_type VARCHAR(50) NOT NULL, -- 'color', 'size', 'number', 'option'
    variant_label_ar VARCHAR(100) NOT NULL,
    price_modifier_lyd NUMERIC(10, 2) DEFAULT 0.00,
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    sku VARCHAR(100),
    is_available BOOLEAN DEFAULT TRUE
);

CREATE TABLE inventory (
    product_id UUID PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    quantity_available INT NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
    low_stock_threshold INT DEFAULT 5,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    change_amount INT NOT NULL,
    reason VARCHAR(100) NOT NULL, -- 'order_placed', 'order_cancelled', 'manual_adjustment', 'restock'
    reference_order_id UUID,
    actor_user_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Delivery Options per Store
CREATE TABLE delivery_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    method_type VARCHAR(30) NOT NULL CHECK (method_type IN ('pickup', 'campus_delivery')),
    label_ar VARCHAR(100) NOT NULL,
    fee_lyd NUMERIC(10, 2) DEFAULT 0.00,
    estimated_minutes INT DEFAULT 15,
    is_enabled BOOLEAN DEFAULT TRUE
);

-- 9. Shopping Carts
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    selected_options JSONB DEFAULT '{}'::jsonb,
    quantity INT NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Orders, Snapshots & Status History
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(40) UNIQUE NOT NULL,
    customer_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    store_id UUID REFERENCES stores(id) ON DELETE RESTRICT,
    store_name_snapshot VARCHAR(150) NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'pending_review' CHECK (
        status IN (
            'pending_review',
            'accepted',
            'preparing',
            'ready_for_pickup',
            'out_for_delivery',
            'completed',
            'rejected',
            'cancelled'
        )
    ),
    rejection_reason TEXT,
    fulfillment_method VARCHAR(30) NOT NULL CHECK (fulfillment_method IN ('pickup', 'campus_delivery')),
    campus_location_ar VARCHAR(200) NOT NULL,
    customer_note TEXT,
    subtotal_lyd NUMERIC(10, 2) NOT NULL,
    discount_total_lyd NUMERIC(10, 2) DEFAULT 0.00,
    delivery_fee_lyd NUMERIC(10, 2) DEFAULT 0.00,
    platform_commission_lyd NUMERIC(10, 2) DEFAULT 0.00,
    total_lyd NUMERIC(10, 2) NOT NULL,
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Preserves product snapshot at time of order so historical orders never mutate
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name_snapshot VARCHAR(200) NOT NULL,
    product_image_snapshot TEXT NOT NULL,
    unit_price_snapshot_lyd NUMERIC(10, 2) NOT NULL,
    old_price_snapshot_lyd NUMERIC(10, 2),
    selected_options_snapshot JSONB DEFAULT '{}'::jsonb,
    quantity INT NOT NULL CHECK (quantity > 0),
    line_total_lyd NUMERIC(10, 2) NOT NULL
);

CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(40) NOT NULL,
    actor_user_id UUID REFERENCES users(id),
    actor_role VARCHAR(40) NOT NULL,
    actor_name_ar VARCHAR(150) NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'cash_on_delivery', -- 'cash_on_delivery', 'campus_wallet', 'lypay'
    amount_lyd NUMERIC(10, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'refunded')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Ratings & Reviews (Only verified completed orders)
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_name_ar VARCHAR(150) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    is_flagged BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(order_id, store_id, user_id)
);

-- 12. Wishlist / Favorites
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title_ar VARCHAR(200) NOT NULL,
    message_ar TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- 'order_update', 'offer', 'admin_announcement', 'merchant_order'
    related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Banners & Promotional Offers
CREATE TABLE banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_ar VARCHAR(150) NOT NULL,
    subtitle_ar VARCHAR(255) NOT NULL,
    cta_text_ar VARCHAR(60) DEFAULT 'تسوق الآن',
    target_link VARCHAR(255) DEFAULT '/stores',
    image_url TEXT NOT NULL,
    bg_gradient VARCHAR(200) DEFAULT 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 50%, #A78BFA 100%)',
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    discount_percent INT NOT NULL CHECK (discount_percent BETWEEN 1 AND 95),
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    ends_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Platform Financial Settings, Subscriptions & Commissions
CREATE TABLE platform_settings (
    id INT PRIMARY KEY DEFAULT 1,
    revenue_model VARCHAR(40) NOT NULL DEFAULT 'hybrid' CHECK (revenue_model IN ('commission', 'subscription', 'hybrid')),
    commission_rate_percent NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
    monthly_subscription_lyd NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
    currency_code VARCHAR(10) DEFAULT 'LYD',
    currency_symbol_ar VARCHAR(10) DEFAULT 'د.ل',
    allow_demo_data BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    plan_name_ar VARCHAR(100) NOT NULL DEFAULT 'الباقة الجامعية للتجار',
    amount_lyd NUMERIC(10, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    order_total_lyd NUMERIC(10, 2) NOT NULL,
    commission_percent NUMERIC(5, 2) NOT NULL,
    commission_amount_lyd NUMERIC(10, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'collected' CHECK (status IN ('pending', 'collected', 'waived')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_role VARCHAR(40) NOT NULL,
    action VARCHAR(120) NOT NULL,
    entity_type VARCHAR(60) NOT NULL,
    entity_id VARCHAR(100),
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Public read access for active stores & available products
CREATE POLICY "Public can view active stores" ON stores
    FOR SELECT USING (status = 'active');

CREATE POLICY "Merchants can manage their own store" ON stores
    FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Public can view active products" ON products
    FOR SELECT USING (is_active = TRUE);

-- Customers can only see their own orders; Merchants only see orders for their store
CREATE POLICY "Customers view own orders" ON orders
    FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Merchants view own store orders" ON orders
    FOR SELECT USING (
        store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
    );
