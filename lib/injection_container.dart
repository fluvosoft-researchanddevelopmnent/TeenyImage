import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:get_it/get_it.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'core/network/api_client.dart';
import 'core/network/network_info.dart';
import 'features/home/data/datasources/home_local_datasource.dart';
import 'features/home/data/repositories/home_repository_impl.dart';
import 'features/home/domain/repositories/home_repository.dart';
import 'features/home/domain/usecases/get_home_items.dart';
import 'features/home/presentation/bloc/home_bloc.dart';
import 'features/settings/presentation/cubit/theme_cubit.dart';

final sl = GetIt.instance;

Future<void> initDependencies() async {
  // ── External ───────────────────────────────────────────────
  final prefs = await SharedPreferences.getInstance();
  sl
    ..registerLazySingleton<SharedPreferences>(() => prefs)
    ..registerLazySingleton(Connectivity.new)
    ..registerLazySingleton(ApiClient.new)
    ..registerLazySingleton<NetworkInfo>(
      () => NetworkInfoImpl(sl()),
    )

    // ── Features: Home ───────────────────────────────────────
    ..registerLazySingleton<HomeLocalDataSource>(
      HomeLocalDataSourceImpl.new,
    )
    ..registerLazySingleton<HomeRepository>(
      () => HomeRepositoryImpl(sl()),
    )
    ..registerLazySingleton(() => GetHomeItems(sl()))
    ..registerFactory(() => HomeBloc(sl()))

    // ── Features: Settings ───────────────────────────────────
    ..registerLazySingleton(() => ThemeCubit(sl()));
}
