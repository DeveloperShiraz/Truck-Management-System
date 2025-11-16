'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface FleetCodeData {
  code: string;
  expiresAt: string;
  createdAt: string;
}

interface FleetCodeGeneratorProps {
  activeCode: FleetCodeData | null;
  onCodeGenerated: () => void;
  onCodeDeleted: () => void;
}

export const FleetCodeGenerator: React.FC<FleetCodeGeneratorProps> = ({
  activeCode,
  onCodeGenerated,
  onCodeDeleted,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/fleet/generate-code', {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to generate fleet code');
      }

      onCodeGenerated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate fleet code');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteCode = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch('/api/fleet/generate-code', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete fleet code');
      }

      setShowDeleteModal(false);
      onCodeDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete fleet code');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Fleet Code</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {activeCode ? (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Active Fleet Code:</span>
              <span className="text-2xl font-bold text-blue-600 tracking-wider">
                {activeCode.code}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <p>Created: {formatDate(activeCode.createdAt)}</p>
              <p>Expires: {formatDate(activeCode.expiresAt)}</p>
            </div>
          </div>

          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
            className="w-full"
          >
            Delete Fleet Code
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Generate a fleet code to allow drivers to join your fleet. The code will be valid for 7 days.
          </p>
          <Button
            variant="primary"
            onClick={handleGenerateCode}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? 'Generating...' : 'Generate Code To Add Fleet Member'}
          </Button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Fleet Code"
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
              onClick={handleDeleteCode}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        }
      >
        <p className="text-gray-700">
          Are you sure you want to delete this fleet code? This action cannot be undone, and the code will no longer be valid for drivers to join your fleet.
        </p>
      </Modal>
    </div>
  );
};
