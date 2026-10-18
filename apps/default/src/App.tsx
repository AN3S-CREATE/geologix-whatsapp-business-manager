import * as React from "react";
import { MessageDashboard } from "./components/MessageDashboard";
import { MessageAnalyzer } from "./components/MessageAnalyzer";
import { TaskManager } from "./components/TaskManager";
import { WhatsAppIntegration } from "./components/WhatsAppIntegration";
import { Navigation } from "./components/Navigation";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/Toast";

const App: React.FC = function () {
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'analyzer' | 'tasks' | 'integration'>('dashboard');

  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                WhatsApp Business Manager
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                Hybrid system: Manual copy-paste + Automatic WhatsApp API integration
              </p>
            </div>

            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="mt-6 sm:mt-8">
              <React.Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading...</span>
                </div>
              }>
                {activeTab === 'dashboard' && <MessageDashboard />}
                {activeTab === 'analyzer' && <MessageAnalyzer />}
                {activeTab === 'tasks' && <TaskManager />}
                {activeTab === 'integration' && <WhatsAppIntegration />}
              </React.Suspense>
            </div>
          </div>
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;