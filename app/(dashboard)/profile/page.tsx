'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/lib/types/user';

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'driver' as UserRole,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showRoleChangeModal, setShowRoleChangeModal] = useState(false);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
      });
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setSuccessMessage('');
  };

  const handleRoleChange = (newRole: UserRole) => {
    // If role is changing, show confirmation modal
    if (newRole !== user?.role) {
      setPendingRole(newRole);
      setShowRoleChangeModal(true);
    }
  };

  const confirmRoleChange = () => {
    if (pendingRole) {
      setFormData(prev => ({ ...prev, role: pendingRole }));
      setShowRoleChangeModal(false);
      setPendingRole(null);
    }
  };

  const cancelRoleChange = () => {
    setShowRoleChangeModal(false);
    setPendingRole(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccessMessage('Profile updated successfully!');
      
      // If role changed, refresh the page to update session and navigation
      if (formData.role !== user?.role) {
        setTimeout(() => {
          router.refresh();
        }, 1000);
      }
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="h-9 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div className="space-y-2">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getRoleChangeWarning = () => {
    if (pendingRole === 'driver' && user?.role === 'owner') {
      return 'Switching to Driver will invalidate your active fleet code and you will lose access to Fleet Management features.';
    }
    if (pendingRole === 'owner' && user?.role === 'driver') {
      return 'Switching to Truck Owner will remove you from your current fleet and you will lose access to fleet resources until you create your own fleet.';
    }
    return '';
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile Settings</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              disabled={isSaving}
            />
          </div>

          <div>
            <Input
              label="Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Role
            </label>
            <div className="space-y-3">
              <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="role"
                  value="driver"
                  checked={formData.role === 'driver'}
                  onChange={() => handleRoleChange('driver')}
                  disabled={isSaving}
                  className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-gray-900">Driver</span>
                  <span className="block text-xs text-gray-500">Join fleets and access assigned vehicles</span>
                </div>
              </label>
              
              <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="role"
                  value="owner"
                  checked={formData.role === 'owner'}
                  onChange={() => handleRoleChange('owner')}
                  disabled={isSaving}
                  className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-gray-900">Truck Owner</span>
                  <span className="block text-xs text-gray-500">Manage your fleet and register vehicles</span>
                </div>
              </label>
            </div>
          </div>

          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>

      {/* Role Change Confirmation Modal */}
      <Modal
        isOpen={showRoleChangeModal}
        onClose={cancelRoleChange}
        title="Confirm Role Change"
        footer={
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={cancelRoleChange}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmRoleChange}
            >
              Confirm Change
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to change your role from <strong>{user?.role === 'owner' ? 'Truck Owner' : 'Driver'}</strong> to <strong>{pendingRole === 'owner' ? 'Truck Owner' : 'Driver'}</strong>?
          </p>
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800 font-medium">
              ⚠️ Warning
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              {getRoleChangeWarning()}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
