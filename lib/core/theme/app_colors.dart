import 'package:flutter/material.dart';

import 'brand_colors.dart';

/// Material [ColorScheme] built from [BrandColors].
class AppColors {
  AppColors._();

  static ColorScheme light = const ColorScheme(
    brightness: Brightness.light,
    primary: Color(BrandColors.primary),
    onPrimary: Color(BrandColors.onPrimary),
    primaryContainer: Color(BrandColors.primaryLight),
    onPrimaryContainer: Color(BrandColors.primaryDark),
    secondary: Color(BrandColors.secondary),
    onSecondary: Color(BrandColors.onSecondary),
    secondaryContainer: Color(BrandColors.secondaryLight),
    onSecondaryContainer: Color(BrandColors.secondaryDark),
    tertiary: Color(BrandColors.info),
    onTertiary: Colors.white,
    error: Color(BrandColors.error),
    onError: Colors.white,
    surface: Color(BrandColors.surfaceLight),
    onSurface: Color(BrandColors.textPrimaryLight),
    onSurfaceVariant: Color(BrandColors.textSecondaryLight),
    outline: Color(BrandColors.outlineLight),
    outlineVariant: Color(BrandColors.outlineLight),
  );

  static ColorScheme dark = const ColorScheme(
    brightness: Brightness.dark,
    primary: Color(BrandColors.primaryLight),
    onPrimary: Color(BrandColors.primaryDark),
    primaryContainer: Color(BrandColors.primaryDark),
    onPrimaryContainer: Color(BrandColors.primaryLight),
    secondary: Color(BrandColors.secondaryLight),
    onSecondary: Color(BrandColors.secondaryDark),
    secondaryContainer: Color(BrandColors.secondaryDark),
    onSecondaryContainer: Color(BrandColors.secondaryLight),
    tertiary: Color(BrandColors.info),
    onTertiary: Colors.white,
    error: Color(0xFFEF9A9A),
    onError: Color(0xFF4E0000),
    surface: Color(BrandColors.surfaceDark),
    onSurface: Color(BrandColors.textPrimaryDark),
    onSurfaceVariant: Color(BrandColors.textSecondaryDark),
    outline: Color(BrandColors.outlineDark),
    outlineVariant: Color(BrandColors.outlineDark),
  );

  static const Color success = Color(BrandColors.success);
  static const Color warning = Color(BrandColors.warning);
  static const Color info = Color(BrandColors.info);

  static Color scaffoldLight = const Color(BrandColors.backgroundLight);
  static Color scaffoldDark = const Color(BrandColors.backgroundDark);
}
