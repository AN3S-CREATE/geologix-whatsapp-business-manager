import * as React from "react";
import { Send, Loader2, CheckCircle, AlertCircle, Brain, MessageCircle, Sparkles, RefreshCw } from "lucide-react";
import { useApiMutation } from "../hooks/useApi";
import { useToast } from "./Toast";
import { LoadingButton } from "./LoadingSpinner";

interface AnalysisResult {
  senderName: string;
  phoneNumber: string;
  messageContent: string;
  messageDate: string;
  suggestedTasks: string;
}

interface InteractiveAnalysisResult {
  agentResponse: string;
  messageDetails: string;
  timestamp: string;
}

export const MessageAnalyzer: React.FC = () => {
  const [activeMode, setActiveMode] = React.useState<'basic' | 'interactive'>('interactive');
  const [formData, setFormData] = React.useState({
    senderName: '',
    phoneNumber: '',
    messageContent: '',
    messageDate: '',
    additionalContext: ''
  });
  const [analysisResult, setAnalysisResult] = React.useState<AnalysisResult | null>(null);
  const [interactiveResult, setInteractiveResult] = React.useState<InteractiveAnalysisResult | null>(null);

  const { addToast } = useToast();
  
  const { 
    mutate: analyzeBasic, 
    loading: basicLoading, 
    error: basicError,
    reset: resetBasic
  } = useApiMutation<AnalysisResult>();

  const { 
    mutate: analyzeInteractive, 
    loading: interactiveLoading, 
    error: interactiveError,
    reset: resetInteractive
  } = useApiMutation<InteractiveAnalysisResult>();

  const isAnalyzing = basicLoading || interactiveLoading;
  const error = basicError || interactiveError;

  const handleBasicAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    resetBasic();
    setAnalysisResult(null);

    try {
      const result = await analyzeBasic('/api/taskade/webhooks/01K423AYBGKSV1J6ZX4WJ9H3TF/run', {
        variables: {
          senderName: formData.senderName,
          phoneNumber: formData.phoneNumber,
          messageContent: formData.messageContent,
          messageDate: formData.messageDate || new Date().toISOString()
        }
      });

      setAnalysisResult(result);
      
      addToast({
        type: 'success',
        title: 'Analysis Complete',
        message: 'Message analyzed and stored successfully!',
        duration: 3000
      });
      
      // Reset form after successful analysis
      setFormData({
        senderName: '',
        phoneNumber: '',
        messageContent: '',
        messageDate: '',
        additionalContext: ''
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Analysis Failed',
        message: err instanceof Error ? err.message : 'Failed to analyze message',
        duration: 5000,
        action: {
          label: 'Retry',
          onClick: () => handleBasicAnalysis(e)
        }
      });
    }
  };

  const handleInteractiveAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    resetInteractive();
    setInteractiveResult(null);

    try {
      const result = await analyzeInteractive('/api/taskade/webhooks/01K42BM31XJ6PH2TSEXXK2HBNX/run', {
        variables: {
          senderName: formData.senderName,
          phoneNumber: formData.phoneNumber,
          messageContent: formData.messageContent,
          messageDate: formData.messageDate || new Date().toISOString(),
          additionalContext: formData.additionalContext
        }
      });

      setInteractiveResult(result);
      
      addToast({
        type: 'success',
        title: 'AI Agent Response Ready',
        message: 'Your AI assistant has analyzed the message.',
        duration: 3000
      });
      
      // Reset form after successful analysis
      setFormData({
        senderName: '',
        phoneNumber: '',
        messageContent: '',
        messageDate: '',
        additionalContext: ''
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'AI Agent Failed',
        message: err instanceof Error ? err.message : 'Failed to get AI agent response',
        duration: 5000,
        action: {
          label: 'Retry',
          onClick: () => handleInteractiveAnalysis(e)
        }
      });
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const clearResults = () => {
    setAnalysisResult(null);
    setInteractiveResult(null);
    resetBasic();
    resetInteractive();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-4">
          <Brain className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">AI Message Analyzer</h2>
        <p className="text-sm sm:text-base text-gray-600 max-w-3xl mx-auto px-4">
          Choose between basic automated analysis or interactive AI agent assistance that asks clarifying questions 
          when unsure about categorization or project assignment.
        </p>
      </div>

      {/* Mode Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Mode</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => {
              setActiveMode('basic');
              clearResults();
            }}
            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
              activeMode === 'basic'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3 mb-2">
              <Brain className={`w-6 h-6 ${activeMode === 'basic' ? 'text-blue-600' : 'text-gray-500'}`} />
              <h4 className={`font-medium ${activeMode === 'basic' ? 'text-blue-900' : 'text-gray-900'}`}>
                Basic Analysis
              </h4>
            </div>
            <p className={`text-sm ${activeMode === 'basic' ? 'text-blue-700' : 'text-gray-600'}`}>
              Automatic categorization and task generation without interaction
            </p>
          </button>

          <button
            onClick={() => {
              setActiveMode('interactive');
              clearResults();
            }}
            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
              activeMode === 'interactive'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3 mb-2">
              <MessageCircle className={`w-6 h-6 ${activeMode === 'interactive' ? 'text-purple-600' : 'text-gray-500'}`} />
              <h4 className={`font-medium ${activeMode === 'interactive' ? 'text-purple-900' : 'text-gray-900'}`}>
                Interactive AI Agent
              </h4>
            </div>
            <p className={`text-sm ${activeMode === 'interactive' ? 'text-purple-700' : 'text-gray-600'}`}>
              AI agent asks clarifying questions when unsure about categorization
            </p>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Input Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Message Details</h3>
          
          <form onSubmit={activeMode === 'basic' ? handleBasicAnalysis : handleInteractiveAnalysis} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sender Name
              </label>
              <input
                type="text"
                value={formData.senderName}
                onChange={(e) => handleInputChange('senderName', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                placeholder="e.g., John Smith"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                placeholder="e.g., +1234567890"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Date (Optional)
              </label>
              <input
                type="datetime-local"
                value={formData.messageDate}
                onChange={(e) => handleInputChange('messageDate', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Content
              </label>
              <textarea
                value={formData.messageContent}
                onChange={(e) => handleInputChange('messageContent', e.target.value)}
                rows={4}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none text-sm sm:text-base"
                placeholder="Paste the WhatsApp message content here..."
                required
              />
            </div>

            {activeMode === 'interactive' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Context (Optional)
                </label>
                <textarea
                  value={formData.additionalContext}
                  onChange={(e) => handleInputChange('additionalContext', e.target.value)}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none text-sm sm:text-base"
                  placeholder="Any additional context about the customer, previous interactions, or business relationship..."
                />
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  This helps the AI agent make better recommendations and ask more relevant questions.
                </p>
              </div>
            )}

            <LoadingButton
              type="submit"
              loading={isAnalyzing}
              loadingText={activeMode === 'basic' ? 'Analyzing...' : 'AI Agent Working...'}
              className={`w-full text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium focus:ring-2 focus:ring-offset-2 transition-all duration-200 text-sm sm:text-base ${
                activeMode === 'basic'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:ring-purple-500'
              }`}
            >
              {activeMode === 'basic' ? (
                <>
                  <Brain className="w-4 sm:w-5 h-4 sm:h-5" />
                  <span>Analyze Message</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 sm:w-5 h-4 sm:h-5" />
                  <span>Ask AI Agent</span>
                </>
              )}
            </LoadingButton>
          </form>
        </div>

        {/* Results Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              {activeMode === 'basic' ? 'Analysis Results' : 'AI Agent Response'}
            </h3>
            {(analysisResult || interactiveResult) && (
              <button
                onClick={clearResults}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Clear results"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 font-medium">Error</span>
              </div>
              <p className="text-red-600 mt-1 text-sm">{error}</p>
            </div>
          )}

          {/* Basic Analysis Results */}
          {activeMode === 'basic' && analysisResult && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-700 font-medium">Analysis Complete</span>
                </div>
                <p className="text-green-600 text-sm">
                  Message analyzed and stored successfully!
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Message Details</h4>
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2 text-sm">
                    <p><span className="font-medium">From:</span> {analysisResult.senderName}</p>
                    <p><span className="font-medium">Phone:</span> {analysisResult.phoneNumber}</p>
                    <p><span className="font-medium">Date:</span> {new Date(analysisResult.messageDate).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">AI-Generated Task Recommendations</h4>
                  <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                    <pre className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap font-mono overflow-x-auto">
                      {analysisResult.suggestedTasks}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Analysis Results */}
          {activeMode === 'interactive' && interactiveResult && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <MessageCircle className="w-5 h-5 text-purple-500" />
                  <span className="text-purple-700 font-medium">AI Agent Response</span>
                </div>
                <p className="text-purple-600 text-sm">
                  Your AI assistant has analyzed the message and provided recommendations.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Message Summary</h4>
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <p className="text-gray-700 text-sm">{interactiveResult.messageDetails}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Analyzed at: {new Date(interactiveResult.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">AI Agent Analysis & Recommendations</h4>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 sm:p-6 border border-purple-100">
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-sm sm:text-base">
                        {interactiveResult.agentResponse}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Next Steps</h4>
                  <p className="text-blue-700 text-sm">
                    If the AI agent asked questions, you can provide more context and re-analyze. 
                    If you're satisfied with the recommendations, you can proceed to create tasks 
                    or update the message status in the dashboard.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!analysisResult && !interactiveResult && !error && !isAnalyzing && (
            <div className="text-center py-8 sm:py-12">
              {activeMode === 'basic' ? (
                <>
                  <Brain className="w-8 sm:w-12 h-8 sm:h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm sm:text-base">
                    Submit a message to see automated AI analysis results here
                  </p>
                </>
              ) : (
                <>
                  <MessageCircle className="w-8 sm:w-12 h-8 sm:h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm sm:text-base">
                    Submit a message to start an interactive conversation with your AI agent
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 sm:p-8">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">Analysis Mode Comparison</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <Brain className="w-6 sm:w-8 h-6 sm:h-8 text-blue-600" />
              <h4 className="text-lg sm:text-xl font-semibold text-gray-900">Basic Analysis</h4>
            </div>
            <ul className="space-y-2 text-sm sm:text-base text-gray-700">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Fast automated processing</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Immediate categorization</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Standard task generation</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>No interaction required</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <MessageCircle className="w-6 sm:w-8 h-6 sm:h-8 text-purple-600" />
              <h4 className="text-lg sm:text-xl font-semibold text-gray-900">Interactive AI Agent</h4>
            </div>
            <ul className="space-y-2 text-sm sm:text-base text-gray-700">
              <li className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0" />
                <span>Asks clarifying questions</span>
              </li>
              <li className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0" />
                <span>Context-aware analysis</span>
              </li>
              <li className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0" />
                <span>Personalized recommendations</span>
              </li>
              <li className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0" />
                <span>Business relationship insights</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};