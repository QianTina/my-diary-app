/**
 * NotebookForm Component
 * 
 * Form for creating and editing notebooks with validation.
 * Includes fields for name, cover, description, paper style, and font settings.
 * 
 * Requirements: 1.2, 1.3, 1.4
 */

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { 
  Notebook, 
  PaperStyle, 
  FontFamily,
  CreateNotebookInput,
  UpdateNotebookInput 
} from '../../types/notebook';
import { 
  PAPER_STYLE_NAMES, 
  FONT_FAMILIES, 
  FONT_SIZE_RANGE, 
  LINE_HEIGHT_RANGE 
} from '../../types/notebook';
import './NotebookForm.css';

/**
 * NotebookForm component props
 */
export interface NotebookFormProps {
  /** Existing notebook to edit (undefined for create mode) */
  notebook?: Notebook;
  /** Callback when form is submitted */
  onSubmit: (data: CreateNotebookInput | UpdateNotebookInput) => void | Promise<void>;
  /** Callback when form is cancelled */
  onCancel: () => void;
  /** Whether the form is in loading state */
  loading?: boolean;
  /** Error message to display */
  error?: string;
}

/**
 * Form data interface
 */
interface FormData {
  name: string;
  coverColor: string;
  coverImage: string;
  description: string;
  paperStyle: PaperStyle;
  fontFamily: FontFamily;
  fontSize: number;
  lineHeight: number;
}

/**
 * Default form values
 */
const DEFAULT_FORM_DATA: FormData = {
  name: '',
  coverColor: '#8B7355',
  coverImage: '',
  description: '',
  paperStyle: 'lined',
  fontFamily: 'system',
  fontSize: FONT_SIZE_RANGE.default,
  lineHeight: LINE_HEIGHT_RANGE.default,
};

/**
 * NotebookForm component for creating and editing notebooks
 * 
 * @example
 * ```tsx
 * // Create mode
 * <NotebookForm
 *   onSubmit={handleCreate}
 *   onCancel={() => setShowForm(false)}
 * />
 * 
 * // Edit mode
 * <NotebookForm
 *   notebook={existingNotebook}
 *   onSubmit={handleUpdate}
 *   onCancel={() => setShowForm(false)}
 * />
 * ```
 */
export const NotebookForm: React.FC<NotebookFormProps> = ({
  notebook,
  onSubmit,
  onCancel,
  loading = false,
  error,
}) => {
  const isEditMode = !!notebook;
  
  // Initialize form data
  const [formData, setFormData] = useState<FormData>(() => {
    if (notebook) {
      return {
        name: notebook.name,
        coverColor: notebook.coverColor || DEFAULT_FORM_DATA.coverColor,
        coverImage: notebook.coverImage || '',
        description: notebook.description || '',
        paperStyle: notebook.paperStyle,
        fontFamily: notebook.fontFamily as FontFamily,
        fontSize: notebook.fontSize,
        lineHeight: notebook.lineHeight,
      };
    }
    return DEFAULT_FORM_DATA;
  });

  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // Validate form
  const validate = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};

    // Name is required
    if (!formData.name.trim()) {
      errors.name = '日记本名称不能为空';
    } else if (formData.name.length > 100) {
      errors.name = '日记本名称不能超过100个字符';
    }

    // Font size validation
    if (formData.fontSize < FONT_SIZE_RANGE.min || formData.fontSize > FONT_SIZE_RANGE.max) {
      errors.fontSize = `字体大小必须在 ${FONT_SIZE_RANGE.min}-${FONT_SIZE_RANGE.max}px 之间`;
    }

    // Line height validation
    if (formData.lineHeight < LINE_HEIGHT_RANGE.min || formData.lineHeight > LINE_HEIGHT_RANGE.max) {
      errors.lineHeight = `行高必须在 ${LINE_HEIGHT_RANGE.min}-${LINE_HEIGHT_RANGE.max} 之间`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    const submitData = {
      ...formData,
      coverColor: formData.coverColor || undefined,
      coverImage: formData.coverImage || undefined,
      description: formData.description || undefined,
      fontFamily: FONT_FAMILIES[formData.fontFamily],
    };

    // Remove empty optional fields
    if (!submitData.coverColor) delete submitData.coverColor;
    if (!submitData.coverImage) delete submitData.coverImage;
    if (!submitData.description) delete submitData.description;

    await onSubmit(submitData as any);
  };

  // Handle input change
  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="notebook-form-overlay">
      <div className="notebook-form-container">
        <div className="notebook-form-header">
          <h2>{isEditMode ? '编辑日记本' : '创建新日记本'}</h2>
          <button
            type="button"
            className="notebook-form-close"
            onClick={onCancel}
            aria-label="关闭"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        <form className="notebook-form" onSubmit={handleSubmit}>
          {/* Error message */}
          {error && (
            <div className="notebook-form-error" role="alert">
              {error}
            </div>
          )}

          {/* Name field */}
          <div className="notebook-form-field">
            <label htmlFor="name" className="notebook-form-label required">
              日记本名称
            </label>
            <input
              id="name"
              type="text"
              className={`notebook-form-input ${validationErrors.name ? 'error' : ''}`}
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="例如：工作日记、旅行记录"
              disabled={loading}
              required
              aria-required="true"
              aria-invalid={!!validationErrors.name}
              aria-describedby={validationErrors.name ? 'name-error' : undefined}
            />
            {validationErrors.name && (
              <span id="name-error" className="notebook-form-field-error">
                {validationErrors.name}
              </span>
            )}
          </div>

          {/* Cover color field */}
          <div className="notebook-form-field">
            <label htmlFor="coverColor" className="notebook-form-label">
              封面颜色
            </label>
            <div className="notebook-form-color-picker">
              <input
                id="coverColor"
                type="color"
                className="notebook-form-color-input"
                value={formData.coverColor}
                onChange={(e) => handleChange('coverColor', e.target.value)}
                disabled={loading}
              />
              <span className="notebook-form-color-value">{formData.coverColor}</span>
            </div>
          </div>

          {/* Description field */}
          <div className="notebook-form-field">
            <label htmlFor="description" className="notebook-form-label">
              描述
            </label>
            <textarea
              id="description"
              className="notebook-form-textarea"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="简短描述这个日记本的用途..."
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Paper style field */}
          <div className="notebook-form-field">
            <label htmlFor="paperStyle" className="notebook-form-label">
              纸张样式
            </label>
            <div className="notebook-form-paper-styles">
              {(Object.keys(PAPER_STYLE_NAMES) as PaperStyle[]).map((style) => (
                <button
                  key={style}
                  type="button"
                  className={`notebook-form-paper-style ${formData.paperStyle === style ? 'active' : ''}`}
                  onClick={() => handleChange('paperStyle', style)}
                  disabled={loading}
                  aria-label={PAPER_STYLE_NAMES[style]}
                  aria-pressed={formData.paperStyle === style}
                >
                  <div className={`paper-preview paper-preview--${style}`} />
                  <span>{PAPER_STYLE_NAMES[style]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font family field */}
          <div className="notebook-form-field">
            <label htmlFor="fontFamily" className="notebook-form-label">
              字体系列
            </label>
            <select
              id="fontFamily"
              className="notebook-form-select"
              value={formData.fontFamily}
              onChange={(e) => handleChange('fontFamily', e.target.value as FontFamily)}
              disabled={loading}
            >
              <option value="system">系统默认</option>
              <option value="handwriting">手写体</option>
              <option value="serif">衬线体</option>
              <option value="sansSerif">无衬线体</option>
            </select>
          </div>

          {/* Font size field */}
          <div className="notebook-form-field">
            <label htmlFor="fontSize" className="notebook-form-label">
              字体大小: {formData.fontSize}px
            </label>
            <input
              id="fontSize"
              type="range"
              className="notebook-form-range"
              min={FONT_SIZE_RANGE.min}
              max={FONT_SIZE_RANGE.max}
              step="1"
              value={formData.fontSize}
              onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
              disabled={loading}
              aria-valuemin={FONT_SIZE_RANGE.min}
              aria-valuemax={FONT_SIZE_RANGE.max}
              aria-valuenow={formData.fontSize}
            />
            {validationErrors.fontSize && (
              <span className="notebook-form-field-error">
                {validationErrors.fontSize}
              </span>
            )}
          </div>

          {/* Line height field */}
          <div className="notebook-form-field">
            <label htmlFor="lineHeight" className="notebook-form-label">
              行高: {formData.lineHeight.toFixed(1)}
            </label>
            <input
              id="lineHeight"
              type="range"
              className="notebook-form-range"
              min={LINE_HEIGHT_RANGE.min}
              max={LINE_HEIGHT_RANGE.max}
              step="0.1"
              value={formData.lineHeight}
              onChange={(e) => handleChange('lineHeight', parseFloat(e.target.value))}
              disabled={loading}
              aria-valuemin={LINE_HEIGHT_RANGE.min}
              aria-valuemax={LINE_HEIGHT_RANGE.max}
              aria-valuenow={formData.lineHeight}
            />
            {validationErrors.lineHeight && (
              <span className="notebook-form-field-error">
                {validationErrors.lineHeight}
              </span>
            )}
          </div>

          {/* Form actions */}
          <div className="notebook-form-actions">
            <button
              type="button"
              className="notebook-form-button notebook-form-button--secondary"
              onClick={onCancel}
              disabled={loading}
            >
              取消
            </button>
            <button
              type="submit"
              className="notebook-form-button notebook-form-button--primary"
              disabled={loading}
            >
              {loading ? '保存中...' : isEditMode ? '保存更改' : '创建日记本'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotebookForm;
