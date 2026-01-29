/**
 * NotebookListPage
 * 
 * Page for displaying and managing notebooks.
 * Includes list view, create/edit forms, and navigation.
 * 
 * Requirements: 1.8, 8.2
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotebookListView, NotebookForm } from '../components/notebook';
import { useNotebookStore } from '../store/notebookStore';
import { useAuthStore } from '../store/authStore';
import type { Notebook, CreateNotebookInput, UpdateNotebookInput } from '../types/notebook';
import './NotebookListPage.css';

/**
 * NotebookListPage component
 */
export const NotebookListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createNotebook, updateNotebook, loading, error } = useNotebookStore();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNotebook, setEditingNotebook] = useState<Notebook | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Handle create notebook
  const handleCreate = async (data: CreateNotebookInput | UpdateNotebookInput) => {
    if (!user) {
      setFormError('请先登录');
      return;
    }

    try {
      setFormError(null);
      await createNotebook({
        ...data,
        userId: user.id,
        archived: false,
      } as CreateNotebookInput);
      setShowCreateForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '创建失败');
    }
  };

  // Handle update notebook
  const handleUpdate = async (data: CreateNotebookInput | UpdateNotebookInput) => {
    if (!editingNotebook) return;

    try {
      setFormError(null);
      await updateNotebook(editingNotebook.id, data as UpdateNotebookInput);
      setEditingNotebook(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '更新失败');
    }
  };

  // Handle open notebook
  const handleOpenNotebook = (notebook: Notebook) => {
    navigate(`/notebooks/${notebook.id}`);
  };

  // Handle edit notebook
  const handleEditNotebook = (notebook: Notebook) => {
    setEditingNotebook(notebook);
  };

  return (
    <div className="notebook-list-page">
      <NotebookListView
        onCreateNotebook={() => setShowCreateForm(true)}
        onOpenNotebook={handleOpenNotebook}
        onEditNotebook={handleEditNotebook}
      />

      {/* Create form */}
      {showCreateForm && (
        <NotebookForm
          onSubmit={handleCreate}
          onCancel={() => {
            setShowCreateForm(false);
            setFormError(null);
          }}
          loading={loading}
          error={formError || error || undefined}
        />
      )}

      {/* Edit form */}
      {editingNotebook && (
        <NotebookForm
          notebook={editingNotebook}
          onSubmit={handleUpdate}
          onCancel={() => {
            setEditingNotebook(null);
            setFormError(null);
          }}
          loading={loading}
          error={formError || error || undefined}
        />
      )}
    </div>
  );
};

export default NotebookListPage;
