'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface JoinFleetFormProps {
  onSuccess: () => void;
}

export const JoinFleetForm: React.FC<JoinFleetFormProps> = ({ onSuccess }) => {
  const [fleetCode, setFleetCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!fleetCode.trim()) {
      setError('Please enter a fleet code');
      return;
    }

    if (fleetCode.trim().length !== 8) {
      setError('Fleet code must be exactly 8 characters');
      return;
    }

    if (!/^[A-Z0-9]+$/.test(fleetCode.trim())) {
      setError('Fleet code must contain only letters and numbers');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/fleet/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: fleetCode.trim().toUpperCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to join fleet');
      }

      setSuccess(true);
      setFleetCode('');
      
      // Call onSuccess callback after a brief delay to show success message
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join fleet');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Join a Fleet</h2>
      
      <p className="text-gray-600 text-sm mb-6">
        Enter the fleet code provided by your truck owner to join their fleet and access fleet resources.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">
            Successfully joined fleet! Redirecting...
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Fleet Code"
          type="text"
          value={fleetCode}
          onChange={(e) => setFleetCode(e.target.value.toUpperCase())}
          placeholder="Enter 8-character code"
          maxLength={8}
          disabled={isSubmitting || success}
          error={error || undefined}
        />

        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || success || !fleetCode.trim()}
          className="w-full"
        >
          {isSubmitting ? 'Joining Fleet...' : 'Join Fleet'}
        </Button>
      </form>
    </div>
  );
};
