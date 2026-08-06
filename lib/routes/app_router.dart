import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../features/brand_demo/presentation/pages/brand_demo_page.dart';
import '../features/home/presentation/pages/home_page.dart';
import '../features/settings/presentation/pages/settings_page.dart';
import 'route_names.dart';

final GoRouter appRouter = GoRouter(
  initialLocation: RouteNames.home,
  routes: [
    GoRoute(
      path: RouteNames.home,
      name: 'home',
      builder: (context, state) => const HomePage(),
    ),
    GoRoute(
      path: RouteNames.brandDemo,
      name: 'brandDemo',
      builder: (context, state) => const BrandDemoPage(),
    ),
    GoRoute(
      path: RouteNames.settings,
      name: 'settings',
      builder: (context, state) => const SettingsPage(),
    ),
  ],
  errorBuilder: (context, state) => Scaffold(
    appBar: AppBar(title: const Text('Not found')),
    body: Center(child: Text(state.error?.toString() ?? 'Page not found')),
  ),
);
