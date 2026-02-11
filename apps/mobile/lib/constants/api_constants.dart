class ApiConstants {
  static const String baseUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://localhost:3000/api',
  );

  // Auth endpoints
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String refresh = '/auth/refresh';
  static const String me = '/auth/me';

  // Products endpoints
  static const String products = '/products';
  static String product(String id) => '/products/$id';

  // Cart endpoints
  static const String cart = '/cart';
  static String cartItem(String id) => '/cart/items/$id';

  // Orders endpoints
  static const String orders = '/orders';
  static const String myOrders = '/orders/my';
  static String order(String id) => '/orders/$id';
  static String updateOrderStatus(String id) => '/orders/$id/status';

  // Payments endpoints
  static const String createPaymentIntent = '/payments/create-intent';

  // Users endpoints
  static const String profile = '/users/me';

  // Analytics endpoints
  static const String dashboard = '/analytics/dashboard';
}
