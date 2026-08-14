/// Shared form validators for junior-friendly reuse.
class Validators {
  Validators._();

  static String? required(String? value, {String field = 'This field'}) {
    if (value == null || value.trim().isEmpty) {
      return '$field is required';
    }
    return null;
  }

  static String? email(String? value) {
    final requiredError = required(value, field: 'Email');
    if (requiredError != null) return requiredError;

    final emailRegex = RegExp(r'^[\w\.\-]+@([\w\-]+\.)+[\w\-]{2,}$');
    if (!emailRegex.hasMatch(value!.trim())) {
      return 'Enter a valid email';
    }
    return null;
  }

  static String? minLength(String? value, int min, {String field = 'Value'}) {
    final requiredError = required(value, field: field);
    if (requiredError != null) return requiredError;
    if (value!.trim().length < min) {
      return '$field must be at least $min characters';
    }
    return null;
  }
}
