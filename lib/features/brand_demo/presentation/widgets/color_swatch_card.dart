import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class ColorSwatchCard extends StatelessWidget {
  const ColorSwatchCard({
    required this.label,
    required this.color,
    required this.onColor,
    super.key,
    this.hexHint,
  });

  final String label;
  final Color color;
  final Color onColor;
  final String? hexHint;

  String get _hex {
    if (hexHint != null) return hexHint!;
    final value = color.toARGB32().toRadixString(16).padLeft(8, '0').toUpperCase();
    return '#${value.substring(2)}';
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      color: color,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () async {
          await Clipboard.setData(ClipboardData(text: _hex));
          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Copied $_hex')),
            );
          }
        },
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      color: onColor,
                    ),
              ),
              const SizedBox(height: 4),
              Text(
                _hex,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: onColor.withValues(alpha: 0.85),
                      fontFamily: 'monospace',
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
