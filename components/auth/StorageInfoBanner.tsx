'use client';

import React, { useState } from 'react';

export const StorageInfoBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h3 className="text-sm font-semibold text-green-900">Test Accounts Available</h3>
          </div>
          <p className="mt-2 text-sm text-green-800">
            Use these pre-configured test accounts to get started quickly:
          </p>
          <ul className="mt-2 text-xs text-green-700 space-y-1">
            <li className="flex items-center">
              <span className="font-semibold mr-2">Truck Owner:</span>
              <code className="bg-green-100 px-2 py-0.5 rounded">owner@test.com</code>
              <span className="mx-1">/</span>
              <code className="bg-green-100 px-2 py-0.5 rounded">Password123</code>
            </li>
            <li className="flex items-center">
              <span className="font-semibold mr-2">Driver:</span>
              <code className="bg-green-100 px-2 py-0.5 rounded ml-9">driver@test.com</code>
              <span className="mx-1">/</span>
              <code className="bg-green-100 px-2 py-0.5 rounded">Password123</code>
            </li>
          </ul>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-4 text-green-400 hover:text-green-600"
          aria-label="Dismiss"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};
