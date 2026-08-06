import '../../domain/entities/home_item.dart';

class HomeItemModel extends HomeItem {
  const HomeItemModel({
    required super.id,
    required super.title,
    required super.subtitle,
    required super.iconName,
  });

  factory HomeItemModel.fromJson(Map<String, dynamic> json) {
    return HomeItemModel(
      id: json['id'] as int,
      title: json['title'] as String,
      subtitle: json['subtitle'] as String,
      iconName: json['iconName'] as String? ?? 'info',
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'subtitle': subtitle,
        'iconName': iconName,
      };
}
