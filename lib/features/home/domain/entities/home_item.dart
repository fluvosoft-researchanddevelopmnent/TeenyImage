import 'package:equatable/equatable.dart';

/// Pure domain entity — no Flutter / JSON dependencies.
class HomeItem extends Equatable {
  const HomeItem({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.iconName,
  });

  final int id;
  final String title;
  final String subtitle;
  final String iconName;

  @override
  List<Object?> get props => [id, title, subtitle, iconName];
}
