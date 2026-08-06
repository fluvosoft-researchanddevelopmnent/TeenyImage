import '../models/home_item_model.dart';

/// Local / mock data source — swap for remote when you have an API.
abstract class HomeLocalDataSource {
  Future<List<HomeItemModel>> getItems();
}

class HomeLocalDataSourceImpl implements HomeLocalDataSource {
  @override
  Future<List<HomeItemModel>> getItems() async {
    // Simulate latency so juniors can see loading states.
    await Future<void>.delayed(const Duration(milliseconds: 600));

    return const [
      HomeItemModel(
        id: 1,
        title: 'Clean Architecture',
        subtitle: 'Domain → Data → Presentation layers',
        iconName: 'architecture',
      ),
      HomeItemModel(
        id: 2,
        title: 'Reusable Widgets',
        subtitle: 'AppButton, AppTextField, AppErrorView…',
        iconName: 'widgets',
      ),
      HomeItemModel(
        id: 3,
        title: 'Brand Theme',
        subtitle: 'Edit BrandColors and the whole app updates',
        iconName: 'palette',
      ),
      HomeItemModel(
        id: 4,
        title: 'Feature Modules',
        subtitle: 'Copy a feature folder to start a new one',
        iconName: 'folder',
      ),
      HomeItemModel(
        id: 5,
        title: 'BLoC + GetIt',
        subtitle: 'State management and dependency injection',
        iconName: 'bolt',
      ),
    ];
  }
}
