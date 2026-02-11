import { z } from 'zod';

// Common schemas
export const IdSchema = z.string().uuid('Invalid ID format');
export const EmailSchema = z.string().email('Invalid email format');
export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const PhoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .optional();

// Auth schemas
export const RegisterSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: PhoneSchema,
});

export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Product schemas
export const CreateProductSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  categoryId: IdSchema,
  dailyPrice: z.number().positive('Daily price must be positive'),
  depositPrice: z.number().nonnegative('Deposit price must be non-negative'),
  stock: z.number().int().min(0, 'Stock must be non-negative'),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  material: z.string().optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'ACCEPTABLE']).optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const ProductQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  categoryId: IdSchema.optional(),
  search: z.string().optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
  sortBy: z.enum(['price', 'newest', 'rating']).default('newest'),
});

// Category schemas
export const CreateCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  parentId: IdSchema.optional(),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

// Cart schemas
export const AddToCartSchema = z.object({
  productId: IdSchema,
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  rentalFromDate: z.string().datetime('Invalid date format'),
  rentalToDate: z.string().datetime('Invalid date format'),
});

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().min(1),
  rentalFromDate: z.string().datetime().optional(),
  rentalToDate: z.string().datetime().optional(),
});

// Order schemas
export const CreateOrderSchema = z.object({
  items: z.array(AddToCartSchema).min(1, 'At least one item is required'),
  deliveryAddress: z.string().optional(),
  notes: z.string().optional(),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'RETURNED',
    'CANCELLED',
    'REFUNDED',
  ]),
});

// Payment schemas
export const CreatePaymentSchema = z.object({
  orderId: IdSchema,
  paymentMethodId: z.string(),
});

export const WebhookSchema = z.object({
  type: z.string(),
  data: z.record(z.unknown()),
});

// User update schema
export const UpdateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: PhoneSchema,
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
});

// Admin schemas
export const AdminQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(50),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

// Type inference helpers
export type Register = z.infer<typeof RegisterSchema>;
export type Login = z.infer<typeof LoginSchema>;
export type CreateProduct = z.infer<typeof CreateProductSchema>;
export type AddToCart = z.infer<typeof AddToCartSchema>;
export type CreateOrder = z.infer<typeof CreateOrderSchema>;
