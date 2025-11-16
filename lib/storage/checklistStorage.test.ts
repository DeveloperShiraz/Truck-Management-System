import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createChecklist,
  getChecklistsByOwner,
  getChecklistById,
  updateChecklist,
  deleteChecklist,
  updateCompletionStatus,
  getChecklistCompletionStatus,
} from './checklistStorage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('Checklist Storage', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('createChecklist', () => {
    it('creates a new checklist with items', () => {
      const checklist = createChecklist({
        ownerId: 'owner1',
        title: 'Pre-Trip Inspection',
        items: [
          { description: 'Check tire pressure', order: 0 },
          { description: 'Check oil level', order: 1 },
        ],
      });

      expect(checklist.id).toBeDefined();
      expect(checklist.title).toBe('Pre-Trip Inspection');
      expect(checklist.ownerId).toBe('owner1');
      expect(checklist.items).toHaveLength(2);
      expect(checklist.items[0].id).toBeDefined();
      expect(checklist.items[0].description).toBe('Check tire pressure');
    });
  });

  describe('getChecklistsByOwner', () => {
    it('returns checklists for a specific owner', () => {
      createChecklist({
        ownerId: 'owner1',
        title: 'Checklist 1',
        items: [{ description: 'Item 1', order: 0 }],
      });

      createChecklist({
        ownerId: 'owner2',
        title: 'Checklist 2',
        items: [{ description: 'Item 2', order: 0 }],
      });

      const owner1Checklists = getChecklistsByOwner('owner1');
      expect(owner1Checklists).toHaveLength(1);
      expect(owner1Checklists[0].title).toBe('Checklist 1');
    });
  });

  describe('updateChecklist', () => {
    it('updates checklist title and items', () => {
      const checklist = createChecklist({
        ownerId: 'owner1',
        title: 'Original Title',
        items: [{ description: 'Item 1', order: 0 }],
      });

      const updated = updateChecklist(checklist.id, {
        title: 'Updated Title',
        items: [
          { id: 'item1', description: 'Updated Item', order: 0 },
        ],
      });

      expect(updated?.title).toBe('Updated Title');
      expect(updated?.items[0].description).toBe('Updated Item');
    });
  });

  describe('deleteChecklist', () => {
    it('deletes a checklist', () => {
      const checklist = createChecklist({
        ownerId: 'owner1',
        title: 'To Delete',
        items: [{ description: 'Item 1', order: 0 }],
      });

      const success = deleteChecklist(checklist.id);
      expect(success).toBe(true);

      const found = getChecklistById(checklist.id);
      expect(found).toBeNull();
    });
  });

  describe('Completion Status', () => {
    it('updates completion status for a checklist item', () => {
      const checklist = createChecklist({
        ownerId: 'owner1',
        title: 'Test Checklist',
        items: [{ description: 'Item 1', order: 0 }],
      });

      const itemId = checklist.items[0].id;
      const completion = updateCompletionStatus(checklist.id, itemId, 'driver1', true);

      expect(completion.completed).toBe(true);
      expect(completion.driverId).toBe('driver1');
      expect(completion.checklistId).toBe(checklist.id);
      expect(completion.itemId).toBe(itemId);
    });

    it('gets completion status for all items in a checklist', () => {
      const checklist = createChecklist({
        ownerId: 'owner1',
        title: 'Test Checklist',
        items: [
          { description: 'Item 1', order: 0 },
          { description: 'Item 2', order: 1 },
        ],
      });

      updateCompletionStatus(checklist.id, checklist.items[0].id, 'driver1', true);
      updateCompletionStatus(checklist.id, checklist.items[1].id, 'driver1', false);

      const statusMap = getChecklistCompletionStatus(checklist.id, 'driver1');

      expect(statusMap.get(checklist.items[0].id)).toBe(true);
      expect(statusMap.get(checklist.items[1].id)).toBe(false);
    });
  });
});
