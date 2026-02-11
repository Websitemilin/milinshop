import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:riverpod/riverpod.dart';
import '../constants/api_constants.dart';

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: ApiConstants.baseUrl,
    connectTimeout: const Duration(seconds: 30),
    receiveTimeout: const Duration(seconds: 30),
  ));

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        final storage = const FlutterSecureStorage();
        final token = await storage.read(key: 'accessToken');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          // Handle token refresh
          final storage = const FlutterSecureStorage();
          final refreshToken = await storage.read(key: 'refreshToken');
          if (refreshToken != null) {
            try {
              final response = await Dio().post(
                '${ApiConstants.baseUrl}${ApiConstants.refresh}',
                data: {'refreshToken': refreshToken},
              );
              await storage.write(
                key: 'accessToken',
                value: response.data['accessToken'],
              );
              await storage.write(
                key: 'refreshToken',
                value: response.data['refreshToken'],
              );
              return handler.resolve(await dio.request(
                error.requestOptions.path,
                options: error.requestOptions,
              ));
            } catch (e) {
              await storage.deleteAll();
              return handler.next(error);
            }
          }
        }
        return handler.next(error);
      },
    ),
  );

  return dio;
});

final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage();
});
