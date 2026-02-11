import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'router.dart';

void main() {
  runApp(
    const ProviderScope(
      child: LuxeRentalApp(),
    ),
  );
}

class LuxeRentalApp extends ConsumerWidget {
  const LuxeRentalApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'LUXE Rental',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFC4A878),
          brightness: Brightness.light,
        ),
        fontFamily: 'Poppins',
      ),
      routerConfig: router,
    );
  }
}
