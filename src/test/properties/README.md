# Property-Based Tests for Paper Diary Notebook

## Overview

This directory contains property-based tests for the paper diary notebook feature. These tests verify universal correctness properties that should hold across all valid inputs and states.

## Test Files

### migration.property.test.ts

Tests for database migration functionality:

- **Property 26: Migration Data Preservation** - Verifies that all diary entry data is preserved during migration
- **Property 9: Referential Integrity** - Verifies that foreign key constraints are properly enforced

## Running the Tests

### Prerequisites

1. **Supabase Configuration**: Tests require a configured Supabase instance
   - Copy `.env.example` to `.env`
   - Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

2. **Database Migration**: Execute the migration script first
   ```bash
   # In Supabase SQL Editor, run:
   sql/add_paper_diary_notebook.sql
   ```

3. **Authentication**: Some tests require an authenticated user
   - Sign up/login to your Supabase instance
   - Tests will use the current authenticated user

### Run All Tests

```bash
npm test
```

### Run Property Tests Only

```bash
npm test -- src/test/properties/
```

### Run Migration Tests Specifically

```bash
npm test -- src/test/properties/migration.property.test.ts
```

### Run with UI

```bash
npm run test:ui
```

### Run Once (CI Mode)

```bash
npm run test:run
```

## Test Configuration

### Number of Runs

Property tests use different run counts based on test complexity:

- **Database operations**: 10 runs (slower, involves I/O)
- **Constraint validation**: 20 runs (faster, simple checks)

You can adjust these in the test files by modifying the `numRuns` parameter:

```typescript
fc.assert(
  fc.asyncProperty(/* ... */),
  { numRuns: 100 } // Increase for more thorough testing
);
```

### Timeouts

Database tests have extended timeouts (60 seconds) to account for network latency and database operations.

## Test Behavior

### Skipping Tests

Tests automatically skip if:
- Supabase is not configured (no URL or API key)
- No authenticated user is available
- Database migration has not been run

You'll see warnings in the console when tests are skipped.

### Test Data Cleanup

Tests create temporary data and clean it up after each test run. However, if a test fails, some test data may remain in the database.

To manually clean up test data:

```sql
-- Delete test notebooks
DELETE FROM notebooks WHERE name LIKE '%Test%';

-- Delete test diary entries (will cascade from notebooks)
```

## Understanding Property-Based Testing

### What is Property-Based Testing?

Instead of testing specific examples, property-based testing verifies that certain properties hold true for all valid inputs. The testing library (fast-check) generates hundreds of random inputs to find edge cases.

### Example

Traditional test:
```typescript
it('should preserve title during migration', () => {
  const entry = { title: 'My Diary', content: 'Hello' };
  const migrated = migrate(entry);
  expect(migrated.title).toBe('My Diary');
});
```

Property-based test:
```typescript
it('should preserve title during migration', () => {
  fc.assert(
    fc.property(
      fc.string(), // Generate random strings
      fc.string(),
      (title, content) => {
        const entry = { title, content };
        const migrated = migrate(entry);
        return migrated.title === title; // Property: title is preserved
      }
    )
  );
});
```

The property test will try hundreds of different title/content combinations, including edge cases like empty strings, very long strings, special characters, etc.

## Debugging Failed Tests

### View Counterexamples

When a property test fails, fast-check provides a counterexample:

```
Property failed after 42 runs
Counterexample: ["", "very long content..."]
```

This tells you the exact input that caused the failure.

### Reproduce Failures

Fast-check uses seeds for reproducibility. If a test fails, you can reproduce it:

```typescript
fc.assert(
  fc.property(/* ... */),
  { seed: 1234567890 } // Use the seed from the failure
);
```

### Enable Verbose Output

```bash
npm test -- --reporter=verbose
```

## Integration with CI/CD

These tests are suitable for CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Property Tests
  run: npm run test:run
  env:
    VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

## Best Practices

1. **Keep tests isolated**: Each test should clean up its own data
2. **Use meaningful property names**: Follow the design document property numbering
3. **Document requirements**: Link each test to its requirement validation
4. **Handle async properly**: Use `fc.asyncProperty` for database operations
5. **Set appropriate timeouts**: Database tests need longer timeouts
6. **Test both success and failure cases**: Verify constraints are enforced

## Troubleshooting

### Tests are skipped

**Cause**: Supabase not configured or user not authenticated

**Solution**: 
1. Check `.env` file has correct Supabase credentials
2. Ensure you're logged in to the application
3. Verify database migration has been run

### Tests timeout

**Cause**: Database operations taking too long

**Solution**:
1. Check network connection to Supabase
2. Increase timeout in test configuration
3. Reduce `numRuns` for faster execution

### Foreign key constraint errors

**Cause**: Database migration not run or incomplete

**Solution**:
1. Run `sql/verify_paper_diary_notebook.sql` to check migration status
2. Re-run `sql/add_paper_diary_notebook.sql` if needed

### Test data not cleaned up

**Cause**: Test failed before cleanup code ran

**Solution**:
1. Manually delete test data using SQL queries above
2. Consider using database transactions for better cleanup

## Related Documentation

- [Design Document](../../../.kiro/specs/paper-diary-notebook/design.md) - Correctness properties
- [Requirements](../../../.kiro/specs/paper-diary-notebook/requirements.md) - Feature requirements
- [Tasks](../../../.kiro/specs/paper-diary-notebook/tasks.md) - Implementation tasks
- [Migration Guide](../../../sql/QUICK_START_PAPER_DIARY_NOTEBOOK.md) - Database setup

## Contributing

When adding new property tests:

1. Reference the property number from the design document
2. Document which requirements are validated
3. Use descriptive test names
4. Include cleanup code
5. Set appropriate `numRuns` and timeouts
6. Add comments explaining the property being tested
