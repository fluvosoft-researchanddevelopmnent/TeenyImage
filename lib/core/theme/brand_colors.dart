/// Central brand palette.
///
/// Juniors: change these hex values to match your product brand.
/// Everything else (ThemeData, widgets, demos) reads from here.
class BrandColors {
  BrandColors._();

  // ── Primary brand ──────────────────────────────────────────
  static const int primary = 0xFF0F6E56;
  static const int primaryLight = 0xFF3D9B7A;
  static const int primaryDark = 0xFF0A4F3C;
  static const int onPrimary = 0xFFFFFFFF;

  // ── Secondary / accent ─────────────────────────────────────
  static const int secondary = 0xFFE8A838;
  static const int secondaryLight = 0xFFF0C56E;
  static const int secondaryDark = 0xFFC4891F;
  static const int onSecondary = 0xFF1A1A1A;

  // ── Semantic ───────────────────────────────────────────────
  static const int success = 0xFF2E7D32;
  static const int warning = 0xFFF9A825;
  static const int error = 0xFFC62828;
  static const int info = 0xFF1565C0;

  // ── Neutrals (light) ───────────────────────────────────────
  static const int backgroundLight = 0xFFF7F9F8;
  static const int surfaceLight = 0xFFFFFFFF;
  static const int textPrimaryLight = 0xFF1B1F1D;
  static const int textSecondaryLight = 0xFF5C6B64;
  static const int outlineLight = 0xFFD0D8D4;

  // ── Neutrals (dark) ────────────────────────────────────────
  static const int backgroundDark = 0xFF0E1411;
  static const int surfaceDark = 0xFF1A2220;
  static const int textPrimaryDark = 0xFFF2F5F3;
  static const int textSecondaryDark = 0xFFA3B0A9;
  static const int outlineDark = 0xFF2E3A35;
}
