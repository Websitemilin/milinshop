// User types
export enum UserRole {
  ADMIN = 'ADMIN',
  VENDOR = 'VENDOR',
  USER = 'USER',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  userId: string;
  bio?: string;
  address?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  preferences?: Record<string, unknown>;
}

// Category types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Product types
export enum ProductStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt?: string;
  order: number;
  createdAt: Date;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  dailyPrice: number;
  depositPrice: number;
  stock: number;
  status: ProductStatus;
  images: ProductImage[];
  colors?: string[];
  sizes?: string[];
  material?: string;
  condition?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// Cart types
export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  rentalFromDate: Date;
  rentalToDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Order types
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  dailyPrice: number;
  depositPrice: number;
  rentalFromDate: Date;
  rentalToDate: Date;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deposit: number;
  total: number;
  status: OrderStatus;
  deliveryAddress?: string;
  notes?: string;
  paymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Payment types
export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId: string;
  stripeChargeId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// Auth types
export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Analytics types
export interface AnalyticsSnapshot {
  date: Date;
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  newUsers: number;
  averageOrderValue: number;
  conversionRate: number;
}

export type Nullable<T> = T | null;
