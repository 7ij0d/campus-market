export type UserRole = 'customer' | 'merchant' | 'admin' | 'super_admin';

export interface CampusLocation {
  id: string;
  name_ar: string;
  campus_name_ar: string;
  pickup_points: string[];
  is_active: boolean;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  faculty_location_id: string;
  student_id_number?: string;
  is_active: boolean;
  store_id?: string; // If role === 'merchant'
  permissions?: string[];
  created_at: string;
}

export interface Category {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  icon_name: string;
  color_bg: string;
  color_text: string;
  sort_order: number;
  is_active: boolean;
}

export interface StoreCategory {
  id: string;
  store_id: string;
  name_ar: string;
  sort_order: number;
}

export interface Store {
  id: string;
  owner_id: string;
  name_en: string;
  name_ar: string;
  slug: string;
  activity_type_ar: string;
  description_ar: string;
  category_id: string;
  logo_url: string;
  cover_url: string;
  icon_bg_color: string;
  icon_type: 'coffee' | 'printer' | 'book' | 'hoodie' | 'laptop' | 'utensils' | 'sparkles';
  location_inside_campus: string;
  working_hours?: string;
  is_open: boolean;
  supports_pickup: boolean;
  supports_delivery: boolean;
  delivery_fee_lyd: number;
  contact_phone: string;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  is_demo: boolean;
  created_at: string;
}

export interface ProductVariantOption {
  id: string;
  label_ar: string;
  price_modifier_lyd: number;
  stock_quantity: number;
}

export interface ProductVariantGroup {
  id: string;
  name_ar: string; // e.g., 'المقاس', 'اللون', 'الحجم'
  type: 'size' | 'color' | 'number' | 'option';
  options: ProductVariantOption[];
}

export interface Product {
  id: string;
  store_id: string;
  category_id: string;
  store_category_id?: string;
  name_ar: string;
  name_en?: string;
  description_ar: string;
  price_lyd: number;
  old_price_lyd?: number;
  images: string[];
  variant_groups: ProductVariantGroup[];
  stock_quantity: number;
  is_active: boolean;
  is_available_for_sale: boolean;
  sort_order: number;
  is_demo: boolean;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  store_id: string;
  quantity: number;
  selected_options: Record<string, string>; // group_name -> option_label
  selected_option_ids: Record<string, string>; // group_id -> option_id
}

export type OrderStatus =
  | 'pending_review'
  | 'accepted'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'completed'
  | 'rejected'
  | 'cancelled';

export interface OrderItemSnapshot {
  id: string;
  product_id: string;
  product_name_snapshot: string;
  product_image_snapshot: string;
  unit_price_snapshot_lyd: number;
  old_price_snapshot_lyd?: number;
  selected_options_snapshot: Record<string, string>;
  quantity: number;
  line_total_lyd: number;
}

export interface OrderStatusHistoryEntry {
  id: string;
  status: OrderStatus;
  actor_user_id: string;
  actor_role: UserRole;
  actor_name_ar: string;
  note?: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name_ar: string;
  customer_phone: string;
  store_id: string;
  store_name_snapshot: string;
  status: OrderStatus;
  rejection_reason?: string;
  fulfillment_method: 'pickup' | 'campus_delivery';
  campus_location_ar: string;
  pickup_point_ar?: string;
  customer_note?: string;
  items: OrderItemSnapshot[];
  subtotal_lyd: number;
  discount_total_lyd: number;
  delivery_fee_lyd: number;
  platform_commission_lyd: number;
  total_lyd: number;
  status_history: OrderStatusHistoryEntry[];
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  order_id: string;
  store_id: string;
  product_id?: string;
  user_id: string;
  user_name_ar: string;
  rating: number;
  comment: string;
  is_flagged: boolean;
  is_approved: boolean;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title_ar: string;
  message_ar: string;
  type: 'order_update' | 'offer' | 'admin_announcement' | 'merchant_order';
  related_order_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface Banner {
  id: string;
  title_ar: string;
  subtitle_ar: string;
  tags_ar: string;
  cta_text_ar: string;
  target_link: string;
  image_url: string;
  start_date: string;
  end_date?: string;
  sort_order: number;
  is_active: boolean;
}

export interface StoreInvitation {
  id: string;
  token: string;
  invited_email: string;
  proposed_store_name: string;
  category_id: string;
  created_by_admin_id: string;
  is_used: boolean;
  used_by_user_id?: string;
  expires_at: string;
  created_at: string;
}

export interface PlatformSettings {
  revenue_model: 'commission' | 'subscription' | 'hybrid';
  commission_rate_percent: number;
  monthly_subscription_lyd: number;
  currency_symbol_ar: string;
  allow_demo_data: boolean;
}

export interface StoreSubscription {
  id: string;
  store_id: string;
  plan_name_ar: string;
  amount_lyd: number;
  status: 'active' | 'expired' | 'cancelled';
  period_start: string;
  period_end: string;
}

export interface AuditLog {
  id: string;
  actor_user_id: string;
  actor_name_ar: string;
  actor_role: UserRole;
  action: string;
  entity_type: string;
  entity_id?: string;
  details: string;
  created_at: string;
}
