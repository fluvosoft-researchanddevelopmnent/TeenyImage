import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:teenypdf/app.dart';
import 'package:teenypdf/injection_container.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() async {
    SharedPreferences.setMockInitialValues({});
    await initDependencies();
  });

  testWidgets('Home page loads template title', (tester) async {
    await tester.pumpWidget(const App());
    await tester.pump(); // start frame
    await tester.pump(const Duration(milliseconds: 700)); // mock latency

    expect(find.textContaining('TeenyPDF'), findsWidgets);
    expect(find.text('Getting started'), findsOneWidget);
  });
}
