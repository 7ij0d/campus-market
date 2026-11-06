const express = require('express');
const { Pool } = require('pg');
const fs = require('node:fs');
const path = require('node:path');

const app = express();
const PORT = process.env.PORT || 3500;

const pool = new Pool({
  host: process.env.PGHOST || '127.0.0.1',
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'kuro_cloud',
  max: 20,
});

// Enable CORS for GitHub Pages (https://7ij0d.github.io) and Localhost
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-actor-id, x-actor-role');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

app.use(express.json({ limit: '25mb' }));

// Initialize PostgreSQL Tables for CampusMarket on Libyan Spider (`kuro_cloud`)
async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS cm_kv_collections (
        collection_key VARCHAR(100) PRIMARY KEY,
        payload JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS cm_stores (
        id VARCHAR(120) PRIMARY KEY,
        owner_id VARCHAR(120) NOT NULL,
        name_en VARCHAR(200) NOT NULL,
        name_ar VARCHAR(200) NOT NULL,
        slug VARCHAR(200) NOT NULL,
        activity_type_ar VARCHAR(200) NOT NULL,
        description_ar TEXT NOT NULL,
        category_id VARCHAR(120),
        logo_url TEXT,
        cover_url TEXT,
        icon_bg_color VARCHAR(50),
        icon_type VARCHAR(50),
        location_inside_campus VARCHAR(255),
        working_hours VARCHAR(100),
        is_open BOOLEAN DEFAULT TRUE,
        supports_pickup BOOLEAN DEFAULT TRUE,
        supports_delivery BOOLEAN DEFAULT TRUE,
        delivery_fee_lyd NUMERIC(10,2) DEFAULT 0,
        contact_phone VARCHAR(50),
        status VARCHAR(50) DEFAULT 'active',
        is_demo BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS cm_products (
        id VARCHAR(120) PRIMARY KEY,
        store_id VARCHAR(120) NOT NULL,
        category_id VARCHAR(120),
        store_category_id VARCHAR(120),
        name_ar VARCHAR(255) NOT NULL,
        name_en VARCHAR(255),
        description_ar TEXT,
        price_lyd NUMERIC(10,2) NOT NULL,
        old_price_lyd NUMERIC(10,2),
        images JSONB DEFAULT '[]'::jsonb,
        variant_groups JSONB DEFAULT '[]'::jsonb,
        stock_quantity INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        is_available_for_sale BOOLEAN DEFAULT TRUE,
        sort_order INT DEFAULT 0,
        is_demo BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS cm_orders (
        id VARCHAR(120) PRIMARY KEY,
        order_number VARCHAR(60) NOT NULL,
        customer_id VARCHAR(120) NOT NULL,
        customer_name_ar VARCHAR(200),
        customer_phone VARCHAR(60),
        store_id VARCHAR(120) NOT NULL,
        store_name_snapshot VARCHAR(200) NOT NULL,
        status VARCHAR(60) NOT NULL,
        rejection_reason TEXT,
        fulfillment_method VARCHAR(60) NOT NULL,
        campus_location_ar VARCHAR(255),
        pickup_point_ar VARCHAR(255),
        customer_note TEXT,
        items JSONB NOT NULL DEFAULT '[]'::jsonb,
        subtotal_lyd NUMERIC(10,2) NOT NULL,
        discount_total_lyd NUMERIC(10,2) DEFAULT 0,
        delivery_fee_lyd NUMERIC(10,2) DEFAULT 0,
        platform_commission_lyd NUMERIC(10,2) DEFAULT 0,
        total_lyd NUMERIC(10,2) NOT NULL,
        status_history JSONB NOT NULL DEFAULT '[]'::jsonb,
        is_demo BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS cm_reviews (
        id VARCHAR(120) PRIMARY KEY,
        order_id VARCHAR(120) NOT NULL,
        store_id VARCHAR(120) NOT NULL,
        product_id VARCHAR(120),
        user_id VARCHAR(120) NOT NULL,
        user_name_ar VARCHAR(200) NOT NULL,
        rating INT NOT NULL,
        comment TEXT,
        is_flagged BOOLEAN DEFAULT FALSE,
        is_approved BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('[CampusMarket Cloud] PostgreSQL tables verified on Libyan Spider kuro_cloud.');
  } finally {
    client.release();
  }
}

// Health Check Endpoint
const router = express.Router();

router.get('/api/health', async (req, res) => {
  try {
    const dbRes = await pool.query('SELECT NOW() as server_time, current_database() as db_name');
    res.json({
      ok: true,
      service: 'CampusMarket Libyan Spider Cloud API',
      database: dbRes.rows[0].db_name,
      server_time: dbRes.rows[0].server_time,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get Full Platform State from PostgreSQL
router.get('/api/state', async (req, res) => {
  try {
    const kvRes = await pool.query('SELECT collection_key, payload FROM cm_kv_collections');
    const stateMap = {};
    for (const row of kvRes.rows) {
      stateMap[row.collection_key] = row.payload;
    }

    const storesRes = await pool.query('SELECT * FROM cm_stores ORDER BY created_at ASC');
    const productsRes = await pool.query('SELECT * FROM cm_products ORDER BY sort_order ASC, created_at DESC');
    const ordersRes = await pool.query('SELECT * FROM cm_orders ORDER BY created_at DESC');
    const reviewsRes = await pool.query('SELECT * FROM cm_reviews ORDER BY created_at DESC');

    res.json({
      ok: true,
      hasSeededStores: storesRes.rows.length > 0,
      stores: storesRes.rows.map((r) => ({
        ...r,
        delivery_fee_lyd: Number(r.delivery_fee_lyd),
      })),
      products: productsRes.rows.map((r) => ({
        ...r,
        price_lyd: Number(r.price_lyd),
        old_price_lyd: r.old_price_lyd !== null ? Number(r.old_price_lyd) : undefined,
        stock_quantity: Number(r.stock_quantity),
        sort_order: Number(r.sort_order),
      })),
      orders: ordersRes.rows.map((r) => ({
        ...r,
        subtotal_lyd: Number(r.subtotal_lyd),
        discount_total_lyd: Number(r.discount_total_lyd),
        delivery_fee_lyd: Number(r.delivery_fee_lyd),
        platform_commission_lyd: Number(r.platform_commission_lyd),
        total_lyd: Number(r.total_lyd),
      })),
      reviews: reviewsRes.rows.map((r) => ({
        ...r,
        rating: Number(r.rating),
      })),
      collections: stateMap,
    });
  } catch (err) {
    console.error('[GET /api/state Error]:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Sync / Upsert Full Platform State to PostgreSQL
router.post('/api/sync', async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      stores,
      products,
      orders,
      reviews,
      collections,
    } = req.body;

    await client.query('BEGIN');

    // Sync Relational Stores
    if (Array.isArray(stores)) {
      await client.query('DELETE FROM cm_stores');
      for (const s of stores) {
        await client.query(
          `INSERT INTO cm_stores (
            id, owner_id, name_en, name_ar, slug, activity_type_ar, description_ar,
            category_id, logo_url, cover_url, icon_bg_color, icon_type,
            location_inside_campus, working_hours, is_open, supports_pickup,
            supports_delivery, delivery_fee_lyd, contact_phone, status, is_demo, created_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)`,
          [
            s.id,
            s.owner_id,
            s.name_en,
            s.name_ar,
            s.slug,
            s.activity_type_ar,
            s.description_ar,
            s.category_id,
            s.logo_url,
            s.cover_url,
            s.icon_bg_color,
            s.icon_type,
            s.location_inside_campus,
            s.working_hours || null,
            Boolean(s.is_open),
            Boolean(s.supports_pickup),
            Boolean(s.supports_delivery),
            Number(s.delivery_fee_lyd || 0),
            s.contact_phone || '',
            s.status || 'active',
            Boolean(s.is_demo),
            s.created_at || new Date().toISOString(),
          ]
        );
      }
    }

    // Sync Relational Products
    if (Array.isArray(products)) {
      await client.query('DELETE FROM cm_products');
      for (const p of products) {
        await client.query(
          `INSERT INTO cm_products (
            id, store_id, category_id, store_category_id, name_ar, name_en,
            description_ar, price_lyd, old_price_lyd, images, variant_groups,
            stock_quantity, is_active, is_available_for_sale, sort_order, is_demo, created_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
          [
            p.id,
            p.store_id,
            p.category_id,
            p.store_category_id || null,
            p.name_ar,
            p.name_en || '',
            p.description_ar,
            Number(p.price_lyd || 0),
            p.old_price_lyd !== undefined && p.old_price_lyd !== null ? Number(p.old_price_lyd) : null,
            JSON.stringify(p.images || []),
            JSON.stringify(p.variant_groups || []),
            Number(p.stock_quantity || 0),
            Boolean(p.is_active),
            Boolean(p.is_available_for_sale),
            Number(p.sort_order || 0),
            Boolean(p.is_demo),
            p.created_at || new Date().toISOString(),
          ]
        );
      }
    }

    // Sync Relational Orders
    if (Array.isArray(orders)) {
      await client.query('DELETE FROM cm_orders');
      for (const o of orders) {
        await client.query(
          `INSERT INTO cm_orders (
            id, order_number, customer_id, customer_name_ar, customer_phone,
            store_id, store_name_snapshot, status, rejection_reason,
            fulfillment_method, campus_location_ar, pickup_point_ar, customer_note,
            items, subtotal_lyd, discount_total_lyd, delivery_fee_lyd,
            platform_commission_lyd, total_lyd, status_history, is_demo, created_at, updated_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)`,
          [
            o.id,
            o.order_number,
            o.customer_id,
            o.customer_name_ar,
            o.customer_phone,
            o.store_id,
            o.store_name_snapshot,
            o.status,
            o.rejection_reason || null,
            o.fulfillment_method,
            o.campus_location_ar,
            o.pickup_point_ar || null,
            o.customer_note || null,
            JSON.stringify(o.items || []),
            Number(o.subtotal_lyd || 0),
            Number(o.discount_total_lyd || 0),
            Number(o.delivery_fee_lyd || 0),
            Number(o.platform_commission_lyd || 0),
            Number(o.total_lyd || 0),
            JSON.stringify(o.status_history || []),
            Boolean(o.is_demo),
            o.created_at || new Date().toISOString(),
            o.updated_at || new Date().toISOString(),
          ]
        );
      }
    }

    // Sync Relational Reviews
    if (Array.isArray(reviews)) {
      await client.query('DELETE FROM cm_reviews');
      for (const r of reviews) {
        await client.query(
          `INSERT INTO cm_reviews (
            id, order_id, store_id, product_id, user_id, user_name_ar,
            rating, comment, is_flagged, is_approved, created_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [
            r.id,
            r.order_id,
            r.store_id,
            r.product_id || null,
            r.user_id,
            r.user_name_ar,
            Number(r.rating || 5),
            r.comment || '',
            Boolean(r.is_flagged),
            Boolean(r.is_approved),
            r.created_at || new Date().toISOString(),
          ]
        );
      }
    }

    // Sync Additional Collections (users, categories, storeCategories, banners, notifications, invitations, platformSettings, subscriptions, auditLogs, cartsByUser, favoritesByUser)
    if (collections && typeof collections === 'object') {
      for (const [key, val] of Object.entries(collections)) {
        await client.query(
          `INSERT INTO cm_kv_collections (collection_key, payload, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (collection_key) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
          [key, JSON.stringify(val)]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ ok: true, synced_at: new Date().toISOString() });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[POST /api/sync Error]:', err);
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    client.release();
  }
});

// Mount under both `/campus-market` and `/` so reverse_proxy works seamlessly
app.use('/campus-market', router);
app.use('/', router);

initDatabase()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[CampusMarket Cloud] Listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize CampusMarket database:', err);
    process.exit(1);
  });
