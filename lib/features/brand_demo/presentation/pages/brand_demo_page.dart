import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/brand_colors.dart';
import '../widgets/color_swatch_card.dart';
import '../widgets/component_showcase.dart';

class BrandDemoPage extends StatelessWidget {
  const BrandDemoPage({super.key});

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final text = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Brand & theme demo')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
        children: [
          Text('Brand colours', style: text.headlineSmall),
          const SizedBox(height: 4),
          Text(
            'Edit lib/core/theme/brand_colors.dart — tap a swatch to copy its hex.',
            style: text.bodyMedium?.copyWith(color: scheme.onSurfaceVariant),
          ),
          const SizedBox(height: 16),
          ColorSwatchCard(
            label: 'Primary',
            color: scheme.primary,
            onColor: scheme.onPrimary,
            hexHint: _hex(BrandColors.primary),
          ),
          const SizedBox(height: 10),
          ColorSwatchCard(
            label: 'Primary light',
            color: const Color(BrandColors.primaryLight),
            onColor: Colors.white,
            hexHint: _hex(BrandColors.primaryLight),
          ),
          const SizedBox(height: 10),
          ColorSwatchCard(
            label: 'Secondary / accent',
            color: scheme.secondary,
            onColor: scheme.onSecondary,
            hexHint: _hex(BrandColors.secondary),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: ColorSwatchCard(
                  label: 'Success',
                  color: AppColors.success,
                  onColor: Colors.white,
                  hexHint: _hex(BrandColors.success),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: ColorSwatchCard(
                  label: 'Warning',
                  color: AppColors.warning,
                  onColor: Colors.black87,
                  hexHint: _hex(BrandColors.warning),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: ColorSwatchCard(
                  label: 'Error',
                  color: scheme.error,
                  onColor: scheme.onError,
                  hexHint: _hex(BrandColors.error),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: ColorSwatchCard(
                  label: 'Info',
                  color: AppColors.info,
                  onColor: Colors.white,
                  hexHint: _hex(BrandColors.info),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ColorSwatchCard(
            label: 'Surface',
            color: scheme.surface,
            onColor: scheme.onSurface,
          ),
          const SizedBox(height: 32),
          Text('Typography', style: text.headlineSmall),
          const SizedBox(height: 12),
          Text('Display small', style: text.displaySmall),
          Text('Headline medium', style: text.headlineMedium),
          Text('Title large', style: text.titleLarge),
          Text('Body large — readable paragraph text for forms and content.',
              style: text.bodyLarge),
          Text('Body small / captions and helper text', style: text.bodySmall),
          const SizedBox(height: 32),
          const ComponentShowcase(),
        ],
      ),
    );
  }

  static String _hex(int value) {
    final s = value.toRadixString(16).padLeft(8, '0').toUpperCase();
    return '#${s.substring(2)}';
  }
}
