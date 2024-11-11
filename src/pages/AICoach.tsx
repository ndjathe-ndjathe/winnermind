import React, { useState } from 'react';
import { Brain, MessageCircle, Book } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AICoach() {
  const [userInput, setUserInput] = useState('');
  const [aiResponses, setAiResponses] = useState<Array<{ role: string; content: string }>>([
    {
      role: 'assistant',
      content: "Hello! I'm your AI coach. I can help you with personalized advice, goal setting, and daily motivation. What would you like to work on today?"
    }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    // Add user message to chat
    setAiResponses(prev => [...prev, { role: 'user', content: userInput }]);

    // Simulate AI response (replace with actual OpenAI API call)
    const mockAIResponse = {
      role: 'assistant',
      content: "Based on your input, I recommend focusing on building a consistent routine. Here's a personalized plan for you..."
    };

    setAiResponses(prev => [...prev, mockAIResponse]);
    setUserInput('');
  };

  return (
    <div className="space-y-6">
      <header className="bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">AI Coach</h1>
        <p className="mt-1 text-sm text-gray-500">Get personalized guidance and support</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2 bg-white shadow-sm rounded-lg">
          <div className="h-[600px] flex flex-col">
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {aiResponses.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="p-4 border-t">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Ask your AI coach anything..."
                  className="flex-1 rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Suggestions and Tools */}
        <div className="space-y-6">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-purple-600" />
              Suggested Topics
            </h2>
            <div className="space-y-2">
              {[
                'Goal setting strategies',
                'Stress management techniques',
                'Productivity tips',
                'Work-life balance',
              ].map((topic, index) => (
                <button
                  key={index}
                  onClick={() => setUserInput(`Tell me about ${topic.toLowerCase()}`)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 rounded-md"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-purple-600" />
              Premium Coaching
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Get personalized guidance from certified human coaches.
            </p>
            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Upgrade to Premium
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}