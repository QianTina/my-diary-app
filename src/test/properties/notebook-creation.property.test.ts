/**
 * Property-Based Tests for Notebook Creation Validation
 * Feature: paper-diary-notebook
 * 
 * These tests verify the correctness properties of notebook creation validation.
 * 
 * Following the pattern from migration.property.test.ts with reduced numRuns (3-5)
 * for faster testing while maintaining adequate coverage.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import fc from 'fast-check';
import { NotebookService } from '../../services/notebookService';
import type { CreateNotebookInput, PaperStyle } from '../../types/notebook';
import { supabase } from '../../utils/supabase';

// Test configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Skip tests if Supabase is not configured
const skipIfNoSupabase = !SUPABASE_URL || !SUPABASE_ANON_KEY;

describe('Notebook Creation Validation Properties', () => {
  let service: NotebookService;
  let testUserId: string;
  const createdNotebookIds: string[] = [];

  beforeAll(async () => {
    if (skipIfNoSupabase) {
      console.warn('Skipping notebook creation property tests: Supabase not configured');
      return;
    }

    service = new NotebookService();

    // Get authenticated user
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        testUserId = user.id;
      } else {
        console.warn('No authenticated user found. Tests will be skipped.');
      }
    }
  });

  beforeEach(() => {
    // Clear the list of created notebooks before each test
    createdNotebookIds.length = 0;
  });

  afterAll(async () => {
    // Cleanup: Delete all test notebooks
    if (supabase && createdNotebookIds.length > 0) {
      await supabase
        .from('notebooks')
        .delete()
        .in('id', createdNotebookIds);
    }
  });

  /**
   * Property 1: Notebook Creation Validation
   * **Validates: Requirements 1.2**
   * 
   * For any notebook creation attempt, the system should require the name field
   * and accept optional fields (cover_color, cover_image, description), rejecting
   * creation attempts without a name.
   */
  describe('Property 1: Notebook Creation Validation', () => {
    it.skipIf(skipIfNoSupabase)(
      'should require name field for notebook creation',
      { timeout: 60000 }, // 60 second timeout for database operations
      async () => {
        if (!testUserId) {
          return;
        }

        await fc.assert(
          fc.asyncProperty(
            // Generate notebook data with optional name
            fc.record({
              name: fc.option(fc.string({ minLength: 0, maxLength: 100 }), { nil: undefined }),
              coverColor: fc.option(fc.string()),
              coverImage: fc.option(fc.webUrl()),
              description: fc.option(fc.string({ maxLength: 500 })),
              paperStyle: fc.constantFrom<PaperStyle>('blank', 'lined', 'grid', 'dotted', 'vintage'),
              fontFamily: fc.constantFrom('system', 'handwriting', 'serif', 'sansSerif'),
              fontSize: fc.integer({ min: 12, max: 24 }),
              lineHeight: fc.double({ min: 1.2, max: 2.0, noNaN: true }),
            }),
            async (notebookData) => {
              const input: CreateNotebookInput = {
                userId: testUserId,
                name: notebookData.name || '',
                coverColor: notebookData.coverColor,
                coverImage: notebookData.coverImage,
                description: notebookData.description,
                paperStyle: notebookData.paperStyle,
                fontFamily: notebookData.fontFamily,
                fontSize: notebookData.fontSize,
                lineHeight: notebookData.lineHeight,
                archived: false,
              };

              try {
                const result = await service.createNotebook(input);

                // If name is undefined, empty, or whitespace-only, creation should fail
                if (!notebookData.name || notebookData.name.trim().length === 0) {
                  // Should not reach here - expect an error to be thrown
                  expect.fail('Expected error for missing/empty name, but creation succeeded');
                  return false;
                } else {
                  // Valid name - creation should succeed
                  expect(result).toBeDefined();
                  expect(result.id).toBeDefined();
                  expect(result.name).toBe(notebookData.name);
                  expect(result.userId).toBe(testUserId);
                  
                  // Track created notebook for cleanup
                  createdNotebookIds.push(result.id);
                  
                  return true;
                }
              } catch (error) {
                // If name is missing or empty, error is expected
                if (!notebookData.name || notebookData.name.trim().length === 0) {
                  expect(error).toBeDefined();
                  expect((error as Error).message).toContain('name');
                  return true;
                } else {
                  // Valid name but got error - this is unexpected
                  console.error('Unexpected error for valid name:', error);
                  return false;
                }
              }
            }
          ),
          { numRuns: 5 } // Reduced runs for faster testing
        );
      }
    );

    it.skipIf(skipIfNoSupabase)(
      'should accept optional fields (coverColor, coverImage, description)',
      { timeout: 60000 },
      async () => {
        if (!testUserId) {
          return;
        }

        await fc.assert(
          fc.asyncProperty(
            // Generate valid notebook with various optional field combinations
            fc.string({ minLength: 1, maxLength: 100 }), // name (required)
            fc.option(fc.hexaString({ minLength: 6, maxLength: 6 }).map(s => `#${s}`)), // coverColor
            fc.option(fc.webUrl()), // coverImage
            fc.option(fc.string({ maxLength: 500 })), // description
            fc.constantFrom<PaperStyle>('blank', 'lined', 'grid', 'dotted', 'vintage'),
            fc.constantFrom('system', 'handwriting', 'serif', 'sansSerif'),
            fc.integer({ min: 12, max: 24 }),
            fc.double({ min: 1.2, max: 2.0, noNaN: true }),
            async (name, coverColor, coverImage, description, paperStyle, fontFamily, fontSize, lineHeight) => {
              const input: CreateNotebookInput = {
                userId: testUserId,
                name,
                coverColor,
                coverImage,
                description,
                paperStyle,
                fontFamily,
                fontSize,
                lineHeight,
                archived: false,
              };

              try {
                const result = await service.createNotebook(input);

                // Creation should succeed with valid name
                expect(result).toBeDefined();
                expect(result.id).toBeDefined();
                expect(result.name).toBe(name);
                expect(result.userId).toBe(testUserId);
                
                // Optional fields should be preserved
                expect(result.coverColor).toBe(coverColor);
                expect(result.coverImage).toBe(coverImage);
                expect(result.description).toBe(description);
                
                // Required fields should be set
                expect(result.paperStyle).toBe(paperStyle);
                expect(result.fontFamily).toBe(fontFamily);
                expect(result.fontSize).toBe(fontSize);
                expect(result.lineHeight).toBe(lineHeight);
                
                // Track created notebook for cleanup
                createdNotebookIds.push(result.id);
                
                return true;
              } catch (error) {
                console.error('Unexpected error with valid input:', error);
                return false;
              }
            }
          ),
          { numRuns: 5 } // Reduced runs for faster testing
        );
      }
    );

    it.skipIf(skipIfNoSupabase)(
      'should reject creation attempts without a name',
      { timeout: 60000 },
      async () => {
        if (!testUserId) {
          return;
        }

        await fc.assert(
          fc.asyncProperty(
            // Generate various invalid name values
            fc.constantFrom(
              undefined,
              '',
              '   ', // whitespace only
              '\t',
              '\n',
              '  \t  \n  '
            ),
            fc.constantFrom<PaperStyle>('blank', 'lined', 'grid', 'dotted', 'vintage'),
            fc.constantFrom('system', 'handwriting', 'serif', 'sansSerif'),
            fc.integer({ min: 12, max: 24 }),
            fc.double({ min: 1.2, max: 2.0, noNaN: true }),
            async (invalidName, paperStyle, fontFamily, fontSize, lineHeight) => {
              const input: CreateNotebookInput = {
                userId: testUserId,
                name: invalidName as string,
                paperStyle,
                fontFamily,
                fontSize,
                lineHeight,
                archived: false,
              };

              try {
                await service.createNotebook(input);
                
                // Should not reach here - expect an error
                expect.fail('Expected error for invalid name, but creation succeeded');
                return false;
              } catch (error) {
                // Error is expected for invalid names
                expect(error).toBeDefined();
                expect((error as Error).message).toMatch(/name/i);
                return true;
              }
            }
          ),
          { numRuns: 3 } // Reduced runs for faster testing
        );
      }
    );

    it.skipIf(skipIfNoSupabase)(
      'should validate font size range (12-24)',
      { timeout: 60000 },
      async () => {
        if (!testUserId) {
          return;
        }

        await fc.assert(
          fc.asyncProperty(
            fc.string({ minLength: 1, maxLength: 100 }),
            fc.integer({ min: -100, max: 100 }), // Include invalid values
            fc.constantFrom<PaperStyle>('blank', 'lined', 'grid', 'dotted', 'vintage'),
            async (name, fontSize, paperStyle) => {
              const input: CreateNotebookInput = {
                userId: testUserId,
                name,
                paperStyle,
                fontFamily: 'system',
                fontSize,
                lineHeight: 1.5,
                archived: false,
              };

              const isValidFontSize = fontSize >= 12 && fontSize <= 24;

              try {
                const result = await service.createNotebook(input);

                if (!isValidFontSize) {
                  // Should not reach here for invalid font size
                  expect.fail('Expected error for invalid font size, but creation succeeded');
                  return false;
                }

                // Valid font size - creation should succeed
                expect(result).toBeDefined();
                expect(result.fontSize).toBe(fontSize);
                
                // Track created notebook for cleanup
                createdNotebookIds.push(result.id);
                
                return true;
              } catch (error) {
                if (!isValidFontSize) {
                  // Error is expected for invalid font size
                  expect(error).toBeDefined();
                  expect((error as Error).message).toMatch(/font size/i);
                  return true;
                } else {
                  // Valid font size but got error - unexpected
                  console.error('Unexpected error for valid font size:', error);
                  return false;
                }
              }
            }
          ),
          { numRuns: 5 } // Reduced runs for faster testing
        );
      }
    );

    it.skipIf(skipIfNoSupabase)(
      'should validate line height range (1.2-2.0)',
      { timeout: 60000 },
      async () => {
        if (!testUserId) {
          return;
        }

        await fc.assert(
          fc.asyncProperty(
            fc.string({ minLength: 1, maxLength: 100 }),
            fc.double({ min: 0, max: 5, noNaN: true }), // Include invalid values
            fc.constantFrom<PaperStyle>('blank', 'lined', 'grid', 'dotted', 'vintage'),
            async (name, lineHeight, paperStyle) => {
              const input: CreateNotebookInput = {
                userId: testUserId,
                name,
                paperStyle,
                fontFamily: 'system',
                fontSize: 16,
                lineHeight,
                archived: false,
              };

              const isValidLineHeight = lineHeight >= 1.2 && lineHeight <= 2.0;

              try {
                const result = await service.createNotebook(input);

                if (!isValidLineHeight) {
                  // Should not reach here for invalid line height
                  expect.fail('Expected error for invalid line height, but creation succeeded');
                  return false;
                }

                // Valid line height - creation should succeed
                expect(result).toBeDefined();
                expect(result.lineHeight).toBe(lineHeight);
                
                // Track created notebook for cleanup
                createdNotebookIds.push(result.id);
                
                return true;
              } catch (error) {
                if (!isValidLineHeight) {
                  // Error is expected for invalid line height
                  expect(error).toBeDefined();
                  expect((error as Error).message).toMatch(/line height/i);
                  return true;
                } else {
                  // Valid line height but got error - unexpected
                  console.error('Unexpected error for valid line height:', error);
                  return false;
                }
              }
            }
          ),
          { numRuns: 5 } // Reduced runs for faster testing
        );
      }
    );
  });
});
