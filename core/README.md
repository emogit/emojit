# emojit-core
Core code for Emojit.

# Build
```bash
yarn build
```

# Lint
```bash
yarn lint
```

Correct:
```bash
yarn lint-fix
```

# Test
Run all tests except integration tests (calls the back end service):
```bash
yarn test --invert --fgrep Integration
```

Run all tests:
```bash
yarn test
```
