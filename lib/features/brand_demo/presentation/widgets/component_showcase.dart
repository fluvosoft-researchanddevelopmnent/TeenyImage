import 'package:flutter/material.dart';

import '../../../../core/utils/validators.dart';
import '../../../../core/widgets/widgets.dart';

/// Live preview of shared components under the current brand theme.
class ComponentShowcase extends StatefulWidget {
  const ComponentShowcase({super.key});

  @override
  State<ComponentShowcase> createState() => _ComponentShowcaseState();
}

class _ComponentShowcaseState extends State<ComponentShowcase> {
  final _formKey = GlobalKey<FormState>();
  bool _loading = false;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Components', style: text.headlineSmall),
        const SizedBox(height: 4),
        Text(
          'These widgets live in lib/core/widgets and follow BrandColors.',
          style: text.bodyMedium?.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 20),
        Form(
          key: _formKey,
          child: Column(
            children: [
              AppTextField(
                label: 'Email',
                hint: 'you@company.com',
                prefixIcon: Icons.email_outlined,
                keyboardType: TextInputType.emailAddress,
                validator: Validators.email,
              ),
              const SizedBox(height: 12),
              AppTextField(
                label: 'Password',
                obscureText: true,
                prefixIcon: Icons.lock_outline,
                validator: (v) => Validators.minLength(v, 6, field: 'Password'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        AppButton(
          label: 'Filled button',
          icon: Icons.check,
          isLoading: _loading,
          onPressed: () async {
            if (!(_formKey.currentState?.validate() ?? false)) return;
            setState(() => _loading = true);
            await Future<void>.delayed(const Duration(milliseconds: 900));
            if (!mounted) return;
            setState(() => _loading = false);
            if (!context.mounted) return;
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Form looks good')),
            );
          },
        ),
        const SizedBox(height: 12),
        AppButton(
          label: 'Outlined button',
          variant: AppButtonVariant.outlined,
          icon: Icons.layers_outlined,
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Swap BrandColors to restyle every button'),
              ),
            );
          },
        ),
        const SizedBox(height: 8),
        AppButton(
          label: 'Text button',
          variant: AppButtonVariant.text,
          expand: false,
          onPressed: () {},
        ),
        const SizedBox(height: 24),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            Chip(
              avatar: Icon(
                Icons.check_circle,
                color: Theme.of(context).colorScheme.primary,
                size: 18,
              ),
              label: const Text('Primary chip'),
            ),
            Chip(
              avatar: Icon(
                Icons.star,
                color: Theme.of(context).colorScheme.secondary,
                size: 18,
              ),
              label: const Text('Accent chip'),
            ),
            const Chip(label: Text('Neutral')),
          ],
        ),
      ],
    );
  }
}
