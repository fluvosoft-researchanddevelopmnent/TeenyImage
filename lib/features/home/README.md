# Feature: home

Reference feature that demonstrates the full Clean Architecture path.

```
UI (HomePage)
  → HomeBloc
    → GetHomeItems (use case)
      → HomeRepository (contract)
        → HomeRepositoryImpl
          → HomeLocalDataSource (mock)
```

Replace `HomeLocalDataSource` with a remote source using `ApiClient` when you have an API.
