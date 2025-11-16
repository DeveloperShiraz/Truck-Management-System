'use client';

import React from 'react';
import { ChatInterface } from '@/components/chatbot/ChatInterface';

export default function ChatbotPage() {
  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 h-[calc(100vh-8rem)]">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">TMS Assistant</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
          Ask questions about the Truck Management System and get instant help.
        </p>
      </div>

      <div className="h-[calc(100%-5rem)] sm:h-[calc(100%-6rem)]">
        <ChatInterface />
      </div>
    </div>
  );
}
