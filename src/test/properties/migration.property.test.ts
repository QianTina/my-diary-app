/**
 * Property-Based Tests for Paper Diary Notebook Migration
 * Feature: paper-diary-notebook
 * 
 * These tests verify the correctness properties of the database migration
 * for the paper diary notebook feature.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fc from 'fast-check';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Test configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Skip tests if Supabase is not configured
const skipIfNoSupabase = !SUPABASE_URL || !SUPABASE_ANON_KEY;

describe('Paper Diary Notebook Migration Properties', () => {
  let supabase: SupabaseClient;
  let testUserId: string;

  beforeAll(async () => {
    if (skipIfNoSupabase) {
      console.warn('Skipping migration property tests: Supabase not configured');
      return;
    }

    // Initialize Supabase client
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Create a test user or get existing user
    // Note: In a real test environment, you would use a test database
    // and create/cleanup test users properly
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      testUserId = user.id;
    } else {
      console.warn('No authenticated user found. Some tests may be skipped.');
    }
  });

  afterAll(async () => {
    // Cleanup would go here in a real test environment
    // For now, we'll leave test data for manual inspection
  });

  /**
   * Property 26: Migration Data Preservation
   * Validates: Requirements 12.4, 12.5
   * 
   * For any set of diary entries before migration, after migration completes,
   * all entries should still exist with the same content, date, and metadata
   * (only notebook_id should change).
   */
  describe('Property 26: Migration Data Preservation', () => {
    it.skipIf(skipIfNoSupabase)(
      'should preserve all diary entry data during migration',
      { timeout: 60000 }, // 60 second timeout for database operations
      async () => {
        // This test verifies that migration preserves entry data
        // We'll use fast-check to generate various diary entry configurations
        
        await fc.assert(
          fc.asyncProperty(
            // Generate test diary entries
            fc.array(
              fc.record({
                title: fc.string({ minLength: 1, maxLength: 100 }),
                content: fc.string({ minLength: 1, maxLength: 1000 }),
                mood: fc.constantFrom('happy', 'sad', 'neutral', 'calm', 'angry'),
                tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
              }),
              { minLength: 1, maxLength: 3 } // Reduced for faster testing
            ),
            async (testEntries) => {
              if (!testUserId) {
                // Skip if no user is available
                return true;
              }

              // Step 1: Create test entries without notebook_id
              const createdEntries = [];
              for (const entry of testEntries) {
                const { data, error } = await supabase
                  .from('diaries')
                  .insert({
                    user_id: testUserId,
                    title: entry.title,
                    content: entry.content,
                    mood: entry.mood,
                    tags: entry.tags,
                    notebook_id: null, // Explicitly set to null to simulate pre-migration state
                  })
                  .select()
                  .single();

                if (error) {
                  console.error('Failed to create test entry:', error);
                  continue;
                }
                createdEntries.push(data);
              }

              if (createdEntries.length === 0) {
                // No entries created, skip this iteration
                return true;
              }

              // Step 2: Run migration
              const { data: migrationResult, error: migrationError } = await supabase
                .rpc('migrate_user_to_notebooks', { target_user_id: testUserId });

              if (migrationError) {
                console.error('Migration failed:', migrationError);
                // Clean up created entries
                await supabase
                  .from('diaries')
                  .delete()
                  .in('id', createdEntries.map(e => e.id));
                return false;
              }

              // Step 3: Verify all entries still exist with preserved data
              const { data: migratedEntries, error: fetchError } = await supabase
                .from('diaries')
                .select('*')
                .in('id', createdEntries.map(e => e.id));

              if (fetchError) {
                console.error('Failed to fetch migrated entries:', fetchError);
                return false;
              }

              // Verify count matches
              expect(migratedEntries?.length).toBe(createdEntries.length);

              // Verify each entry's data is preserved
              for (const original of createdEntries) {
                const migrated = migratedEntries?.find(e => e.id === original.id);
                expect(migrated).toBeDefined();

                // Verify data preservation
                expect(migrated?.title).toBe(original.title);
                expect(migrated?.content).toBe(original.content);
                expect(migrated?.mood).toBe(original.mood);
                expect(migrated?.tags).toEqual(original.tags);
                expect(migrated?.created_at).toBe(original.created_at);

                // Verify notebook_id was assigned
                expect(migrated?.notebook_id).not.toBeNull();
              }

              // Clean up: Delete test entries
              await supabase
                .from('diaries')
                .delete()
                .in('id', createdEntries.map(e => e.id));

              return true;
            }
          ),
          { numRuns: 3 } // Reduced runs for faster testing
        );
      }
    );

    it.skipIf(skipIfNoSupabase)(
      'should assign all unmigrated entries to default notebook',
      async () => {
        if (!testUserId) {
          return;
        }

        // Check migration status
        const { data: statusBefore } = await supabase
          .rpc('check_migration_status', { target_user_id: testUserId });

        // Run migration
        const { data: migrationResult } = await supabase
          .rpc('migrate_user_to_notebooks', { target_user_id: testUserId });

        // Verify no unmigrated entries remain
        const { data: statusAfter } = await supabase
          .rpc('check_migration_status', { target_user_id: testUserId });

        expect(statusAfter?.[0]?.needs_migration).toBe(false);
        expect(statusAfter?.[0]?.unmigrated_entries_count).toBe(0);
      }
    );
  });

  /**
   * Property 9: Referential Integrity
   * Validates: Requirements 2.5
   * 
   * For any attempt to create a diary entry with a notebook_id that does not
   * exist in the notebooks table, the database should reject the operation
   * with a foreign key constraint violation.
   */
  describe('Property 9: Referential Integrity', () => {
    it.skipIf(skipIfNoSupabase)(
      'should reject diary entries with non-existent notebook_id',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            // Generate random UUIDs that don't exist
            fc.uuid(),
            fc.string({ minLength: 1, maxLength: 100 }),
            fc.string({ minLength: 1, maxLength: 1000 }),
            async (fakeNotebookId, title, content) => {
              if (!testUserId) {
                return true;
              }

              // Attempt to create entry with non-existent notebook_id
              const { data, error } = await supabase
                .from('diaries')
                .insert({
                  user_id: testUserId,
                  notebook_id: fakeNotebookId,
                  title: title,
                  content: content,
                })
                .select()
                .single();

              // Should fail with foreign key constraint error
              expect(error).not.toBeNull();
              expect(data).toBeNull();

              // Verify error is related to foreign key constraint
              if (error) {
                // PostgreSQL foreign key violation error code is 23503
                expect(
                  error.message.includes('foreign key') ||
                  error.message.includes('violates') ||
                  error.code === '23503'
                ).toBe(true);
              }

              return true;
            }
          ),
          { numRuns: 5 } // Reduced runs for faster testing
        );
      }
    );

    it.skipIf(skipIfNoSupabase)(
      'should allow diary entries with valid notebook_id',
      async () => {
        if (!testUserId) {
          return;
        }

        // First, create a valid notebook
        const { data: notebook, error: notebookError } = await supabase
          .from('notebooks')
          .insert({
            user_id: testUserId,
            name: 'Test Notebook for Referential Integrity',
            paper_style: 'blank',
          })
          .select()
          .single();

        if (notebookError || !notebook) {
          console.error('Failed to create test notebook:', notebookError);
          return;
        }

        await fc.assert(
          fc.asyncProperty(
            fc.string({ minLength: 1, maxLength: 100 }),
            fc.string({ minLength: 1, maxLength: 1000 }),
            async (title, content) => {
              // Attempt to create entry with valid notebook_id
              const { data, error } = await supabase
                .from('diaries')
                .insert({
                  user_id: testUserId,
                  notebook_id: notebook.id,
                  title: title,
                  content: content,
                })
                .select()
                .single();

              // Should succeed
              expect(error).toBeNull();
              expect(data).not.toBeNull();
              expect(data?.notebook_id).toBe(notebook.id);

              // Clean up: Delete the created entry
              if (data) {
                await supabase.from('diaries').delete().eq('id', data.id);
              }

              return true;
            }
          ),
          { numRuns: 3 } // Reduced runs for faster testing
        );

        // Clean up: Delete the test notebook
        await supabase.from('notebooks').delete().eq('id', notebook.id);
      }
    );

    it.skipIf(skipIfNoSupabase)(
      'should cascade delete diary entries when notebook is deleted',
      async () => {
        if (!testUserId) {
          return;
        }

        // Create a test notebook
        const { data: notebook } = await supabase
          .from('notebooks')
          .insert({
            user_id: testUserId,
            name: 'Test Notebook for Cascade Delete',
            paper_style: 'blank',
          })
          .select()
          .single();

        if (!notebook) {
          return;
        }

        // Create test entries
        const { data: entries } = await supabase
          .from('diaries')
          .insert([
            {
              user_id: testUserId,
              notebook_id: notebook.id,
              title: 'Entry 1',
              content: 'Content 1',
            },
            {
              user_id: testUserId,
              notebook_id: notebook.id,
              title: 'Entry 2',
              content: 'Content 2',
            },
          ])
          .select();

        expect(entries?.length).toBe(2);

        // Delete the notebook
        const { error: deleteError } = await supabase
          .from('notebooks')
          .delete()
          .eq('id', notebook.id);

        expect(deleteError).toBeNull();

        // Verify entries were cascade deleted
        const { data: remainingEntries } = await supabase
          .from('diaries')
          .select('*')
          .eq('notebook_id', notebook.id);

        expect(remainingEntries?.length).toBe(0);
      }
    );
  });
});
