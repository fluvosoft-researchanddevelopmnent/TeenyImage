import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../entities/home_item.dart';

abstract class HomeRepository {
  Future<Either<Failure, List<HomeItem>>> getItems();
}
