import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../entities/home_item.dart';
import '../repositories/home_repository.dart';

class GetHomeItems extends UseCase<List<HomeItem>, NoParams> {
  GetHomeItems(this._repository);

  final HomeRepository _repository;

  @override
  Future<Either<Failure, List<HomeItem>>> call(NoParams params) {
    return _repository.getItems();
  }
}
