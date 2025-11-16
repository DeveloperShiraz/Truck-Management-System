import { Checklist, ChecklistCompletion, CreateChecklistInput, UpdateChecklistInput } from '../types/checklist';

const CHECKLISTS_KEY = 'tms_checklists';
const COMPLETIONS_KEY = 'tms_checklist_completions';

// Helper function to get data from localStorage
function getFromStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  
  const data = localStorage.getItem(key);
  if (!data) return [];
  
  try {
    const parsed = JSON.parse(data);
    // Convert date strings back to Date objects
    return parsed.map((item: any) => ({
      ...item,
      createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
      updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
      completedAt: item.completedAt ? new Date(item.completedAt) : undefined,
    }));
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage:`, error);
    return [];
  }
}

// Helper function to save data to localStorage
function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

// Generate unique IDs
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ============= Checklist Operations =============

/**
 * Get all checklists
 */
export function getAllChecklists(): Checklist[] {
  return getFromStorage<Checklist>(CHECKLISTS_KEY);
}

/**
 * Get checklists by owner ID
 */
export function getChecklistsByOwner(ownerId: string): Checklist[] {
  const checklists = getAllChecklists();
  return checklists.filter((checklist) => checklist.ownerId === ownerId);
}

/**
 * Get checklist by ID
 */
export function getChecklistById(checklistId: string): Checklist | null {
  const checklists = getAllChecklists();
  return checklists.find((checklist) => checklist.id === checklistId) || null;
}

/**
 * Create a new checklist
 */
export function createChecklist(input: CreateChecklistInput): Checklist {
  const checklists = getAllChecklists();
  
  // Generate IDs for checklist items
  const itemsWithIds = input.items.map((item, index) => ({
    ...item,
    id: generateId('item'),
    order: item.order ?? index,
  }));
  
  const newChecklist: Checklist = {
    id: generateId('checklist'),
    ownerId: input.ownerId,
    title: input.title,
    items: itemsWithIds,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  checklists.push(newChecklist);
  saveToStorage(CHECKLISTS_KEY, checklists);
  
  return newChecklist;
}

/**
 * Update a checklist
 */
export function updateChecklist(checklistId: string, updates: UpdateChecklistInput): Checklist | null {
  const checklists = getAllChecklists();
  const index = checklists.findIndex((checklist) => checklist.id === checklistId);
  
  if (index === -1) return null;
  
  checklists[index] = {
    ...checklists[index],
    ...updates,
    updatedAt: new Date(),
  };
  
  saveToStorage(CHECKLISTS_KEY, checklists);
  return checklists[index];
}

/**
 * Delete a checklist
 */
export function deleteChecklist(checklistId: string): boolean {
  const checklists = getAllChecklists();
  const filteredChecklists = checklists.filter((checklist) => checklist.id !== checklistId);
  
  if (filteredChecklists.length === checklists.length) return false;
  
  // Also delete all completions for this checklist
  const completions = getAllCompletions();
  const filteredCompletions = completions.filter((completion) => completion.checklistId !== checklistId);
  saveToStorage(COMPLETIONS_KEY, filteredCompletions);
  
  saveToStorage(CHECKLISTS_KEY, filteredChecklists);
  return true;
}

// ============= Completion Operations =============

/**
 * Get all completions
 */
export function getAllCompletions(): ChecklistCompletion[] {
  return getFromStorage<ChecklistCompletion>(COMPLETIONS_KEY);
}

/**
 * Get completions for a specific driver
 */
export function getCompletionsByDriver(driverId: string): ChecklistCompletion[] {
  const completions = getAllCompletions();
  return completions.filter((completion) => completion.driverId === driverId);
}

/**
 * Get completions for a specific checklist and driver
 */
export function getCompletionsByChecklistAndDriver(checklistId: string, driverId: string): ChecklistCompletion[] {
  const completions = getAllCompletions();
  return completions.filter(
    (completion) => completion.checklistId === checklistId && completion.driverId === driverId
  );
}

/**
 * Get a specific completion
 */
export function getCompletion(checklistId: string, itemId: string, driverId: string): ChecklistCompletion | null {
  const completions = getAllCompletions();
  return (
    completions.find(
      (completion) =>
        completion.checklistId === checklistId &&
        completion.itemId === itemId &&
        completion.driverId === driverId
    ) || null
  );
}

/**
 * Update or create a completion status
 */
export function updateCompletionStatus(
  checklistId: string,
  itemId: string,
  driverId: string,
  completed: boolean
): ChecklistCompletion {
  const completions = getAllCompletions();
  const existingIndex = completions.findIndex(
    (completion) =>
      completion.checklistId === checklistId &&
      completion.itemId === itemId &&
      completion.driverId === driverId
  );
  
  const completionData: ChecklistCompletion = {
    id: existingIndex !== -1 ? completions[existingIndex].id : generateId('completion'),
    checklistId,
    itemId,
    driverId,
    completed,
    completedAt: completed ? new Date() : undefined,
  };
  
  if (existingIndex !== -1) {
    completions[existingIndex] = completionData;
  } else {
    completions.push(completionData);
  }
  
  saveToStorage(COMPLETIONS_KEY, completions);
  return completionData;
}

/**
 * Get completion status for all items in a checklist for a driver
 */
export function getChecklistCompletionStatus(
  checklistId: string,
  driverId: string
): Map<string, boolean> {
  const completions = getCompletionsByChecklistAndDriver(checklistId, driverId);
  const statusMap = new Map<string, boolean>();
  
  completions.forEach((completion) => {
    statusMap.set(completion.itemId, completion.completed);
  });
  
  return statusMap;
}

/**
 * Delete all completions for a specific driver (when they leave a fleet)
 */
export function deleteDriverCompletions(driverId: string): void {
  const completions = getAllCompletions();
  const filteredCompletions = completions.filter((completion) => completion.driverId !== driverId);
  saveToStorage(COMPLETIONS_KEY, filteredCompletions);
}
