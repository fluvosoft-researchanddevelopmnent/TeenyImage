import 'package:flutter/material.dart';

import '../../domain/entities/home_item.dart';

class HomeItemCard extends StatelessWidget {
  const HomeItemCard({required this.item, super.key, this.onTap});

  final HomeItem item;
  final VoidCallback? onTap;

  IconData get _icon => switch (item.iconName) {
        'architecture' => Icons.account_tree_outlined,
        'widgets' => Icons.widgets_outlined,
        'palette' => Icons.palette_outlined,
        'folder' => Icons.folder_copy_outlined,
        'bolt' => Icons.bolt_outlined,
        _ => Icons.info_outline,
      };

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final text = Theme.of(context).textTheme;

    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: colors.primaryContainer.withValues(alpha: 0.45),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(_icon, color: colors.primary),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item.title, style: text.titleMedium),
                    const SizedBox(height: 4),
                    Text(item.subtitle, style: text.bodySmall),
                  ],
                ),
              ),
              Icon(Icons.chevron_right, color: colors.onSurfaceVariant),
            ],
          ),
        ),
      ),
    );
  }
}
