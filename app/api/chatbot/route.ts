import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to use the chatbot' },
        { status: 401 }
      );
    }

    // Get user details from session
    const user = session.user as any;
    const userRole = user.role as 'owner' | 'driver';
    const hasFleet = userRole === 'owner' || !!user.fleetOwnerId;

    // Parse request body
    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Message is required' },
        { status: 400 }
      );
    }

    // Check for DeepSeek API key
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Configuration Error', message: 'DeepSeek API key is not configured' },
        { status: 500 }
      );
    }

    // Build system context
    const systemContext = `You are a helpful assistant for a Truck Management System.
You can help users with:
- Understanding fleet management features
- Navigating the application
- Troubleshooting common issues
- Explaining telemetrics and maintenance features

Current user role: ${userRole === 'owner' ? 'Truck Owner' : 'Driver'}
Fleet status: ${hasFleet ? 'Member of fleet' : 'Not in fleet'}

Be concise, friendly, and helpful. Focus on TMS-related topics.`;

    // Build messages array for DeepSeek API
    const messages: ChatMessage[] = [
      { role: 'system', content: systemContext },
      ...conversationHistory,
      { role: 'user', content: message },
    ];

    // Call DeepSeek API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: messages,
          temperature: 0.7,
          max_tokens: 500,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `DeepSeek API error: ${response.status}`);
      }

      const data: DeepSeekResponse = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from DeepSeek API');
      }

      const assistantMessage = data.choices[0].message.content;

      return NextResponse.json({
        message: assistantMessage,
        conversationHistory: [
          ...conversationHistory,
          { role: 'user', content: message },
          { role: 'assistant', content: assistantMessage },
        ],
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);

      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { 
            error: 'Timeout Error', 
            message: 'The request took too long. Please try again.',
            retryable: true,
          },
          { status: 408 }
        );
      }

      throw fetchError;
    }
  } catch (error: any) {
    console.error('Chatbot API error:', error);

    return NextResponse.json(
      {
        error: 'Server Error',
        message: error.message || 'An unexpected error occurred. Please try again.',
        retryable: true,
      },
      { status: 500 }
    );
  }
}
