import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../../core/constants/app_constants.dart';

class ThemeCubit extends Cubit<ThemeModeState> {
  ThemeCubit(this._prefs) : super(ThemeModeState(_read(_prefs)));

  final SharedPreferences _prefs;

  static ThemeMode _read(SharedPreferences prefs) {
    final raw = prefs.getString(AppConstants.themePreferenceKey);
    return switch (raw) {
      'light' => ThemeMode.light,
      'dark' => ThemeMode.dark,
      _ => ThemeMode.system,
    };
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    final value = switch (mode) {
      ThemeMode.light => 'light',
      ThemeMode.dark => 'dark',
      ThemeMode.system => 'system',
    };
    await _prefs.setString(AppConstants.themePreferenceKey, value);
    emit(ThemeModeState(mode));
  }

  void cycle() {
    final next = switch (state.mode) {
      ThemeMode.system => ThemeMode.light,
      ThemeMode.light => ThemeMode.dark,
      ThemeMode.dark => ThemeMode.system,
    };
    setThemeMode(next);
  }
}

class ThemeModeState extends Equatable {
  const ThemeModeState(this.mode);

  final ThemeMode mode;

  @override
  List<Object?> get props => [mode];
}
