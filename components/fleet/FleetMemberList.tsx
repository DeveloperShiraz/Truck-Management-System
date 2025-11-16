'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface FleetMemberData {
  id: string;
  driverId: string;
  driverEmail: string;
  driverName: string;
  joinedAt: string;
}

interface FleetMemberListProps {
  members: FleetMemberData[];
  onMemberRemoved: () => void;
}

export const FleetMemberList: React.FC<FleetMemberListProps> = ({
  members,
  onMemberRemoved,
}) => {
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FleetMemberData | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRemoveClick = (member: FleetMemberData) => {
    setSelectedMember(member);
    setShowRemoveModal(true);
    setError(null);
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;

    setIsRemoving(true);
    setError(null);

    try {
      const response = await fetch(`/api/fleet/members?driverId=${selectedMember.driverId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to remove fleet member');
      }

      setShowRemoveModal(false);
      setSelectedMember(null);
      onMemberRemoved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove fleet member');
    } finally {
      setIsRemoving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Fleet Members</h2>

      {members.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No fleet members yet. Generate a fleet code to add drivers to your fleet.
        </p>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{member.driverName}</h3>
                <p className="text-sm text-gray-600">{member.driverEmail}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Joined: {formatDate(member.joinedAt)}
                </p>
              </div>
              <Button
                variant="danger"
                onClick={() => handleRemoveClick(member)}
                className="ml-4"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Remove Confirmation Modal */}
      <Modal
        isOpen={showRemoveModal}
        onClose={() => {
          setShowRemoveModal(false);
          setSelectedMember(null);
          setError(null);
        }}
        title="Remove Fleet Member"
        footer={
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setShowRemoveModal(false);
                setSelectedMember(null);
                setError(null);
              }}
              disabled={isRemoving}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleRemoveMember}
              disabled={isRemoving}
            >
              {isRemoving ? 'Removing...' : 'Remove'}
            </Button>
          </div>
        }
      >
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        {selectedMember && (
          <p className="text-gray-700">
            Are you sure you want to remove <strong>{selectedMember.driverName}</strong> ({selectedMember.driverEmail}) from your fleet? 
            They will lose access to telemetrics, service, and driver checklist features.
          </p>
        )}
      </Modal>
    </div>
  );
};
