'use client';

import React, { useState, useEffect } from 'react';

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
  completions?: Record<string, boolean>;
}

export const ChecklistViewer: React.FC = () => {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

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

  const handleToggleCompletion = async (checklistId: string, itemId: string, currentStatus: boolean) => {
    const itemKey = `${checklistId}-${itemId}`;
    setUpdatingItems(prev => new Set(prev).add(itemKey));
    setError(null);

    try {
      const response = await fetch('/api/checklist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklistId,
          itemId,
          completed: !currentStatus,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update completion status');
      }

      // Update local state
      setChecklists(prevChecklists =>
        prevChecklists.map(checklist => {
          if (checklist.id === checklistId) {
            return {
              ...checklist,
              completions: {
                ...checklist.completions,
                [itemId]: !currentStatus,
              },
            };
          }
          return checklist;
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update completion status');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  const getCompletionPercentage = (checklist: Checklist): number => {
    if (!checklist.items.length) return 0;
    const completedCount = checklist.items.filter(
      item => checklist.completions?.[item.id] === true
    ).length;
    return Math.round((completedCount / checklist.items.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">Loading checklists...</div>
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

      <h2 className="text-2xl font-semibold text-gray-900">Driver Checklists</h2>

      {checklists.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No checklists available. Your fleet owner hasn&apos;t created any checklists yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {checklists.map((checklist) => {
            const completionPercentage = getCompletionPercentage(checklist);
            const completedCount = checklist.items.filter(
              item => checklist.completions?.[item.id] === true
            ).length;

            return (
              <div key={checklist.id} className="bg-white rounded-lg shadow p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{checklist.title}</h3>
                  
                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{completedCount} of {checklist.items.length} completed</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {checklist.items
                    .sort((a, b) => a.order - b.order)
                    .map((item) => {
                      const isCompleted = checklist.completions?.[item.id] === true;
                      const itemKey = `${checklist.id}-${item.id}`;
                      const isUpdating = updatingItems.has(itemKey);

                      return (
                        <label
                          key={item.id}
                          className={`flex items-start p-3 rounded-md border transition-colors cursor-pointer ${
                            isCompleted
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          } ${isUpdating ? 'opacity-50' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={() => handleToggleCompletion(checklist.id, item.id, isCompleted)}
                            disabled={isUpdating}
                            className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                          />
                          <span
                            className={`ml-3 text-gray-700 ${
                              isCompleted ? 'line-through text-gray-500' : ''
                            }`}
                          >
                            {item.description}
                          </span>
                        </label>
                      );
                    })}
                </div>

                {completionPercentage === 100 && (
                  <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-md">
                    <p className="text-sm text-green-800 font-medium">
                      ✓ Checklist completed!
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
