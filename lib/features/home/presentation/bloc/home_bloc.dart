import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/usecases/usecase.dart';
import '../../domain/entities/home_item.dart';
import '../../domain/usecases/get_home_items.dart';

part 'home_event.dart';
part 'home_state.dart';

class HomeBloc extends Bloc<HomeEvent, HomeState> {
  HomeBloc(this._getHomeItems) : super(const HomeInitial()) {
    on<HomeStarted>(_onStarted);
    on<HomeRefreshed>(_onRefreshed);
  }

  final GetHomeItems _getHomeItems;

  Future<void> _onStarted(
    HomeStarted event,
    Emitter<HomeState> emit,
  ) async {
    await _load(emit);
  }

  Future<void> _onRefreshed(
    HomeRefreshed event,
    Emitter<HomeState> emit,
  ) async {
    await _load(emit);
  }

  Future<void> _load(Emitter<HomeState> emit) async {
    emit(const HomeLoading());
    final result = await _getHomeItems(const NoParams());
    result.fold(
      (failure) => emit(HomeError(failure.message)),
      (items) => emit(HomeLoaded(items)),
    );
  }
}
