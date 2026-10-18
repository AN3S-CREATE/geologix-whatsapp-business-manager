import * as React from "react";
import { MessageSquare, Brain, CheckSquare, Zap } from "lucide-react";

interface NavigationProps {
  activeTab: 'dashboard' | 'analyzer' | 'tasks' | 'integration';
  onTabChange: (tab: 'dashboard' | 'analyzer' | 'tasks' | 'integration') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'dashboard' as const,
      label: 'Messages',
      shortLabel: 'Messages',
      icon: MessageSquare,
      description: 'View and manage all WhatsApp messages'
    },
    {
      id: 'analyzer' as const,
      label: 'AI Analyzer',
      shortLabel: 'Analyzer',
      icon: Brain,
      description: 'Manually analyze messages with AI'
    },
    {
      id: 'integration' as const,
      label: 'API Setup',
      shortLabel: 'API',
      icon: Zap,
      description: 'Automatic WhatsApp API setup'
    },
    {
      id: 'tasks' as const,
      label: 'Tasks',
      shortLabel: 'Tasks',
      icon: CheckSquare,
      description: 'View and manage generated tasks'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
      {/* Desktop Navigation */}
      <div className="hidden md:grid md:grid-cols-4 gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center space-x-3 px-4 py-4 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
              <div className="text-left">
                <div className={`font-medium ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                  {tab.label}
                </div>
                <div className={`text-sm ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                  {tab.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex flex-col items-center justify-center px-3 py-3 rounded-lg transition-all duration-200 min-w-0 flex-1
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-medium ${isActive ? 'text-blue-900' : 'text-gray-700'}`}>
                  {tab.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};