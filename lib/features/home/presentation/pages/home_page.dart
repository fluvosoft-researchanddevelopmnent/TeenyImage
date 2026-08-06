import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../../injection_container.dart';
import '../../../../routes/route_names.dart';
import '../bloc/home_bloc.dart';
import '../widgets/home_item_card.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<HomeBloc>()..add(const HomeStarted()),
      child: const _HomeView(),
    );
  }
}

class _HomeView extends StatelessWidget {
  const _HomeView();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(AppConstants.appName),
        actions: [
          IconButton(
            tooltip: 'Brand demo',
            icon: const Icon(Icons.palette_outlined),
            onPressed: () => context.push(RouteNames.brandDemo),
          ),
          IconButton(
            tooltip: 'Settings',
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => context.push(RouteNames.settings),
          ),
        ],
      ),
      body: BlocBuilder<HomeBloc, HomeState>(
        builder: (context, state) {
          if (state is HomeLoading || state is HomeInitial) {
            return const AppLoading(message: 'Loading features…');
          }
          if (state is HomeError) {
            return AppErrorView(
              message: state.message,
              onRetry: () =>
                  context.read<HomeBloc>().add(const HomeRefreshed()),
            );
          }
          if (state is HomeLoaded) {
            return RefreshIndicator(
              onRefresh: () async {
                context.read<HomeBloc>().add(const HomeRefreshed());
                await context.read<HomeBloc>().stream.firstWhere(
                      (s) => s is HomeLoaded || s is HomeError,
                    );
              },
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                children: [
                  Text(
                    'Getting started',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'This list is loaded through Clean Architecture '
                    '(use case → repository → data source).',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                  ),
                  const SizedBox(height: 20),
                  ...state.items.map(
                    (item) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: HomeItemCard(
                        item: item,
                        onTap: () {
                          if (item.iconName == 'palette') {
                            context.push(RouteNames.brandDemo);
                          } else {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('${item.title} selected')),
                            );
                          }
                        },
                      ),
                    ),
                  ),
                ],
              ),
            );
          }
          return const SizedBox.shrink();
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push(RouteNames.brandDemo),
        icon: const Icon(Icons.color_lens_outlined),
        label: const Text('Brand demo'),
      ),
    );
  }
}
