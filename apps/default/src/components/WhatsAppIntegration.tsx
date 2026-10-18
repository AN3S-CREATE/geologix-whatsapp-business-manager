import * as React from "react";
import { Zap, Copy, CheckCircle, AlertCircle, Settings, Smartphone, Globe, Shield, Clock, BarChart3 } from "lucide-react";

interface WebhookTest {
  timestamp: string;
  from: string;
  body: string;
  status: 'success' | 'error';
  response?: any;
}

export const WhatsAppIntegration: React.FC = () => {
  const [webhookUrl] = React.useState(`${window.location.origin}/api/taskade/webhooks/01K427Z91YK693SM7Y3ZTC7R86/run`);
  const [copied, setCopied] = React.useState(false);
  const [testMessage, setTestMessage] = React.useState({
    from: '+1234567890',
    body: 'Hello, I need help with my order #12345. Can you please check the status?',
    senderName: 'John Smith'
  });
  const [isTestingWebhook, setIsTestingWebhook] = React.useState(false);
  const [webhookTests, setWebhookTests] = React.useState<WebhookTest[]>([]);
  const [integrationStatus, setIntegrationStatus] = React.useState<'not-configured' | 'configured' | 'active'>('not-configured');

  const copyWebhookUrl = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const testWebhook = async () => {
    setIsTestingWebhook(true);
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: testMessage.from,
          body: testMessage.body,
          senderName: testMessage.senderName,
          timestamp: new Date().toISOString()
        }),
      });

      const result = await response.json();
      
      const newTest: WebhookTest = {
        timestamp: new Date().toISOString(),
        from: testMessage.from,
        body: testMessage.body,
        status: response.ok ? 'success' : 'error',
        response: result
      };

      setWebhookTests(prev => [newTest, ...prev.slice(0, 4)]); // Keep last 5 tests
      
      if (response.ok) {
        setIntegrationStatus('active');
      }
    } catch (err) {
      const newTest: WebhookTest = {
        timestamp: new Date().toISOString(),
        from: testMessage.from,
        body: testMessage.body,
        status: 'error',
        response: { error: err instanceof Error ? err.message : 'Unknown error' }
      };
      
      setWebhookTests(prev => [newTest, ...prev.slice(0, 4)]);
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const integrationSteps = [
    {
      title: "Get WhatsApp Business API Access",
      description: "Apply for WhatsApp Business API through Meta Business or a Business Solution Provider",
      status: "pending",
      icon: Smartphone
    },
    {
      title: "Configure Webhook URL",
      description: "Add the webhook URL to your WhatsApp Business API configuration",
      status: integrationStatus === 'not-configured' ? 'pending' : 'completed',
      icon: Globe
    },
    {
      title: "Set Up Authentication",
      description: "Configure webhook verification and security tokens",
      status: integrationStatus === 'active' ? 'completed' : 'pending',
      icon: Shield
    },
    {
      title: "Test Integration",
      description: "Send test messages to verify automatic processing",
      status: webhookTests.some(t => t.status === 'success') ? 'completed' : 'pending',
      icon: CheckCircle
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-4">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">WhatsApp API Integration</h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Set up automatic message processing with WhatsApp Business API. Messages will be automatically 
          analyzed, categorized, and converted to tasks in real-time.
        </p>
      </div>

      {/* Integration Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Integration Status</h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            integrationStatus === 'active' 
              ? 'bg-green-100 text-green-800' 
              : integrationStatus === 'configured'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {integrationStatus === 'active' ? 'Active' : integrationStatus === 'configured' ? 'Configured' : 'Not Configured'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {integrationSteps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = step.status === 'completed';
            
            return (
              <div key={index} className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Icon className={`w-4 h-4 ${isCompleted ? 'text-green-600' : 'text-gray-500'}`} />
                </div>
                <div>
                  <h4 className={`font-medium ${isCompleted ? 'text-green-900' : 'text-gray-900'}`}>
                    {step.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Webhook Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Webhook Configuration</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={webhookUrl}
                  readOnly
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-mono text-sm"
                />
                <button
                  onClick={copyWebhookUrl}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Use this URL as your WhatsApp Business API webhook endpoint
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Setup Instructions</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Copy the webhook URL above</li>
                <li>Go to your WhatsApp Business API configuration</li>
                <li>Add this URL as your webhook endpoint</li>
                <li>Set the HTTP method to POST</li>
                <li>Configure webhook verification if required</li>
              </ol>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">Expected Payload Format</h4>
                  <pre className="text-xs text-yellow-800 mt-2 bg-yellow-100 rounded p-2 overflow-x-auto">
{`{
  "from": "+1234567890",
  "body": "Message content",
  "senderName": "John Smith",
  "timestamp": "2024-01-01T12:00:00Z"
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Webhook Testing */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Test Webhook</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={testMessage.from}
                onChange={(e) => setTestMessage(prev => ({ ...prev, from: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sender Name
              </label>
              <input
                type="text"
                value={testMessage.senderName}
                onChange={(e) => setTestMessage(prev => ({ ...prev, senderName: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Message
              </label>
              <textarea
                value={testMessage.body}
                onChange={(e) => setTestMessage(prev => ({ ...prev, body: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter a test message..."
              />
            </div>

            <button
              onClick={testWebhook}
              disabled={isTestingWebhook}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isTestingWebhook ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Test Webhook</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Test Results */}
      {webhookTests.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Webhook Tests</h3>
          
          <div className="space-y-4">
            {webhookTests.map((test, index) => (
              <div key={index} className={`border rounded-lg p-4 ${
                test.status === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {test.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={`font-medium ${
                      test.status === 'success' ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {test.status === 'success' ? 'Success' : 'Error'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(test.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
                
                <div className="text-sm space-y-2">
                  <p><span className="font-medium">From:</span> {test.from}</p>
                  <p><span className="font-medium">Message:</span> {test.body}</p>
                  
                  {test.response && (
                    <div className="mt-3">
                      <p className="font-medium mb-1">Response:</p>
                      <pre className={`text-xs p-2 rounded overflow-x-auto ${
                        test.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {JSON.stringify(test.response, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Benefits Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Benefits of API Integration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Real-time Processing</h4>
            <p className="text-gray-600 text-sm">
              Messages are analyzed and categorized instantly as they arrive
            </p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Full Automation</h4>
            <p className="text-gray-600 text-sm">
              No manual intervention needed - everything happens automatically
            </p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Complete Analytics</h4>
            <p className="text-gray-600 text-sm">
              Every message is tracked, analyzed, and converted to actionable insights
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};