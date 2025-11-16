export interface ChecklistItem {
  id: string;
  description: string;
  order: number;
}

export interface Checklist {
  id: string;
  ownerId: string;
  title: string;
  items: ChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistCompletion {
  id: string;
  checklistId: string;
  itemId: string;
  driverId: string;
  completed: boolean;
  completedAt?: Date;
}

export interface CreateChecklistInput {
  ownerId: string;
  title: string;
  items: Omit<ChecklistItem, 'id'>[];
}

export interface UpdateChecklistInput {
  title?: string;
  items?: ChecklistItem[];
}
