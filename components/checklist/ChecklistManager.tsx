'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

interface ChecklistItem {
  id: string;
  description: string;
  order: number;
}

interface Checklist {
  id: string;
  ownerId: string;
  title: string;
  items: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export const ChecklistManager: React.FC = () => {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Create/Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<Checklist | null>(null);
  const [checklistTitle, setChecklistTitle] = useState('');
  const [checklistItems, setChecklistItems] = useState<Array<{ description: string; order: number }>>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingChecklist, setDeletingChecklist] = useState<Checklist | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchChecklists();
  }, []);

  const fetchChecklists = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checklist');
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch checklists');
      }

      const data = await response.json();
      setChecklists(data.checklists || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch checklists');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingChecklist(null);
    setChecklistTitle('');
    setChecklistItems([{ description: '', order: 0 }]);
    setShowEditModal(true);
  };

  const handleEdit = (checklist: Checklist) => {
    setEditingChecklist(checklist);
    setChecklistTitle(checklist.title);
    setChecklistItems(checklist.items.map(item => ({ description: item.description, order: item.order })));
    setShowEditModal(true);
  };

  const handleAddItem = () => {
    setChecklistItems([...checklistItems, { description: '', order: checklistItems.length }]);
  };

  const handleRemoveItem = (index: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, description: string) => {
    const updated = [...checklistItems];
    updated[index] = { ...updated[index], description };
    setChecklistItems(updated);
  };

  const handleSave = async () => {
    if (!checklistTitle.trim()) {
      setError('Checklist title is required');
      return;
    }

    const validItems = checklistItems.filter(item => item.description.trim());
    if (validItems.length === 0) {
      setError('At least one checklist item is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const url = editingChecklist 
        ? `/api/checklist?id=${editingChecklist.id}`
        : '/api/checklist';
      
      const method = editingChecklist ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: checklistTitle,
          items: validItems.map((item, index) => ({
            description: item.description,
            order: index,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save checklist');
      }

      setShowEditModal(false);
      fetchChecklists();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save checklist');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (checklist: Checklist) => {
    setDeletingChecklist(checklist);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingChecklist) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/checklist?id=${deletingChecklist.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete checklist');
      }

      setShowDeleteModal(false);
      setDeletingChecklist(null);
      fetchChecklists();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete checklist');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Manage Checklists</h2>
        <Button onClick={handleCreateNew}>Create Checklist</Button>
      </div>

      {checklists.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">No checklists created yet.</p>
          <Button onClick={handleCreateNew}>Create Your First Checklist</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {checklists.map((checklist) => (
            <div key={checklist.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{checklist.title}</h3>
                  <p className="text-sm text-gray-500">
                    {checklist.items.length} item{checklist.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => handleEdit(checklist)}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => handleDeleteClick(checklist)}>
                    Delete
                  </Button>
                </div>
              </div>
              <ul className="space-y-2">
                {checklist.items.map((item, index) => (
                  <li key={item.id} className="flex items-start">
                    <span className="text-gray-500 mr-2">{index + 1}.</span>
                    <span className="text-gray-700">{item.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={editingChecklist ? 'Edit Checklist' : 'Create Checklist'}
        className="max-w-2xl"
        footer={
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowEditModal(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="checklist-title" className="block text-sm font-medium text-gray-700 mb-1">
              Checklist Title
            </label>
            <Input
              id="checklist-title"
              type="text"
              value={checklistTitle}
              onChange={(e) => setChecklistTitle(e.target.value)}
              placeholder="Enter checklist title"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Checklist Items
              </label>
              <Button variant="secondary" onClick={handleAddItem} className="text-sm py-1">
                Add Item
              </Button>
            </div>
            <div className="space-y-2">
              {checklistItems.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, e.target.value)}
                    placeholder={`Item ${index + 1}`}
                    className="flex-1"
                  />
                  {checklistItems.length > 1 && (
                    <Button
                      variant="danger"
                      onClick={() => handleRemoveItem(index)}
                      className="px-3"
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Checklist"
        footer={
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        }
      >
        <p className="text-gray-700">
          Are you sure you want to delete &quot;{deletingChecklist?.title}&quot;? This will remove the checklist for all fleet members and cannot be undone.
        </p>
      </Modal>
    </div>
  );
};
