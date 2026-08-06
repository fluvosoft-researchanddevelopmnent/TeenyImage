/// App-wide constants. Change these when starting a new product.
class AppConstants {
  AppConstants._();

  static const String appName = 'TeenyPDF';
  static const String appVersion = '1.0.0';

  /// Replace with your API base URL per environment.
  static const String apiBaseUrl = 'https://jsonplaceholder.typicode.com';

  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);

  static const String themePreferenceKey = 'app_theme_mode';
}
