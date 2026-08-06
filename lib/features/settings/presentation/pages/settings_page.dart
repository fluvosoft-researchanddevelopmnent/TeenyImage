import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../cubit/theme_cubit.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        children: [
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Text(
              'Appearance',
              style: Theme.of(context).textTheme.titleMedium,
            ),
          ),
          BlocBuilder<ThemeCubit, ThemeModeState>(
            builder: (context, state) {
              return Column(
                children: [
                  _ThemeTile(
                    title: 'System',
                    subtitle: 'Follow device setting',
                    selected: state.mode == ThemeMode.system,
                    onTap: () => context
                        .read<ThemeCubit>()
                        .setThemeMode(ThemeMode.system),
                  ),
                  _ThemeTile(
                    title: 'Light',
                    selected: state.mode == ThemeMode.light,
                    onTap: () => context
                        .read<ThemeCubit>()
                        .setThemeMode(ThemeMode.light),
                  ),
                  _ThemeTile(
                    title: 'Dark',
                    selected: state.mode == ThemeMode.dark,
                    onTap: () => context
                        .read<ThemeCubit>()
                        .setThemeMode(ThemeMode.dark),
                  ),
                ],
              );
            },
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.info_outline),
            title: const Text('About TeenyPDF'),
            subtitle: const Text(
              'PDF tools app built with Flutter',
            ),
            onTap: () {
              showAboutDialog(
                context: context,
                applicationName: 'TeenyPDF',
                applicationVersion: '1.0.0',
                applicationLegalese: 'FluvoSoft Softwares',
              );
            },
          ),
        ],
      ),
    );
  }
}

class _ThemeTile extends StatelessWidget {
  const _ThemeTile({
    required this.title,
    required this.selected,
    required this.onTap,
    this.subtitle,
  });

  final String title;
  final String? subtitle;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text(title),
      subtitle: subtitle != null ? Text(subtitle!) : null,
      trailing: selected
          ? Icon(
              Icons.check_circle,
              color: Theme.of(context).colorScheme.primary,
            )
          : Icon(
              Icons.circle_outlined,
              color: Theme.of(context).colorScheme.outline,
            ),
      onTap: onTap,
    );
  }
}
