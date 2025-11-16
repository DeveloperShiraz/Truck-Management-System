'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';

interface Truck {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  registeredAt: string;
  status: string;
}

interface TruckRegistrationProps {
  trucks: Truck[];
  onTruckRegistered: () => void;
}

export function TruckRegistration({ trucks, onTruckRegistered }: TruckRegistrationProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    vin: '',
    licensePlate: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/trucks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to register truck');
        setIsSubmitting(false);
        return;
      }

      // Success - reset form and close modal
      setFormData({
        make: '',
        model: '',
        year: '',
        vin: '',
        licensePlate: '',
      });
      setIsModalOpen(false);
      onTruckRegistered();
    } catch (err) {
      setError('An error occurred while registering the truck');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setFormData({
      make: '',
      model: '',
      year: '',
      vin: '',
      licensePlate: '',
    });
    setError('');
  };

  return (
    <div>
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Registered Trucks</h2>
          <Button onClick={() => setIsModalOpen(true)}>Register Truck</Button>
        </div>

        {trucks.length === 0 ? (
          <p className="text-gray-600">No trucks registered yet. Click &quot;Register Truck&quot; to add one.</p>
        ) : (
          <div className="space-y-3">
            {trucks.map((truck) => (
              <div
                key={truck.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {truck.year} {truck.make} {truck.model}
                    </h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">VIN:</span> {truck.vin}
                      </p>
                      <p>
                        <span className="font-medium">License Plate:</span> {truck.licensePlate}
                      </p>
                      <p>
                        <span className="font-medium">Status:</span>{' '}
                        <span className="capitalize">{truck.status}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        Registered: {new Date(truck.registeredAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleCancel} title="Register New Truck">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">
              Make
            </label>
            <Input
              id="make"
              name="make"
              type="text"
              value={formData.make}
              onChange={handleInputChange}
              placeholder="e.g., Ford, Chevrolet, Freightliner"
              required
            />
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <Input
              id="model"
              name="model"
              type="text"
              value={formData.model}
              onChange={handleInputChange}
              placeholder="e.g., F-150, Silverado, Cascadia"
              required
            />
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <Input
              id="year"
              name="year"
              type="number"
              value={formData.year}
              onChange={handleInputChange}
              placeholder="e.g., 2020"
              min="1900"
              max={new Date().getFullYear() + 1}
              required
            />
          </div>

          <div>
            <label htmlFor="vin" className="block text-sm font-medium text-gray-700 mb-1">
              VIN (Vehicle Identification Number)
            </label>
            <Input
              id="vin"
              name="vin"
              type="text"
              value={formData.vin}
              onChange={handleInputChange}
              placeholder="17-character VIN"
              maxLength={17}
              required
            />
          </div>

          <div>
            <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 mb-1">
              License Plate
            </label>
            <Input
              id="licensePlate"
              name="licensePlate"
              type="text"
              value={formData.licensePlate}
              onChange={handleInputChange}
              placeholder="e.g., ABC-1234"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Registering...' : 'Register Truck'}
            </Button>
            <Button type="button" variant="secondary" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
