import * as React from "react";
import { MessageSquare, Phone, Calendar, Tag, AlertCircle, CheckCircle2, Clock, Archive, Zap, User, RefreshCw } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { useToast } from "./Toast";
import { LoadingCard, LoadingButton } from "./LoadingSpinner";

interface Message {
  id: string;
  fieldValues: {
    '/text': string;
    '/attributes/@msg01': string; // Sender Name
    '/attributes/@msg02': string; // Phone Number
    '/attributes/@msg03': string; // Message Date
    '/attributes/@msg04': string; // Message Content
    '/attributes/@msg05': string; // Category
    '/attributes/@msg06': string; // Priority
    '/attributes/@msg07': string; // Status
  };
}

const categoryColors = {
  urgent: 'bg-red-100 text-red-800 border-red-200',
  'follow-up': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  inquiry: 'bg-blue-100 text-blue-800 border-blue-200',
  support: 'bg-purple-100 text-purple-800 border-purple-200',
  sales: 'bg-green-100 text-green-800 border-green-200',
  general: 'bg-gray-100 text-gray-800 border-gray-200'
};

const priorityColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-orange-100 text-orange-800',
  low: 'bg-green-100 text-green-800'
};

const statusIcons = {
  new: Clock,
  reviewed: AlertCircle,
  converted: CheckCircle2,
  archived: Archive
};

const statusColors = {
  new: 'text-blue-600',
  reviewed: 'text-yellow-600',
  converted: 'text-green-600',
  archived: 'text-gray-600'
};

export const MessageDashboard: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
  const [selectedSource, setSelectedSource] = React.useState<string>('all');
  const [updatingStatus, setUpdatingStatus] = React.useState<string | null>(null);

  const { addToast } = useToast();
  
  const { 
    data: messagesData, 
    loading, 
    error, 
    refetch 
  } = useApi<{ ok: boolean; payload: { nodes: Message[] } }>('/api/taskade/projects/FE4tsN867mrkXNBy/nodes');

  const messages = messagesData?.payload?.nodes || [];

  // Auto-refresh every 30 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  const updateMessageStatus = async (messageId: string, newStatus: string) => {
    setUpdatingStatus(messageId);
    
    try {
      const response = await fetch(`/api/taskade/projects/FE4tsN867mrkXNBy/nodes/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          '/attributes/@msg07': newStatus
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update message status');
      }

      addToast({
        type: 'success',
        title: 'Status Updated',
        message: `Message status changed to ${newStatus}`,
        duration: 3000
      });

      // Refresh messages
      await refetch();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err instanceof Error ? err.message : 'Failed to update status',
        duration: 5000
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const isAutoMessage = (message: Message) => {
    return message.fieldValues['/text']?.startsWith('[AUTO]');
  };

  const filteredMessages = messages.filter(message => {
    const categoryMatch = selectedCategory === 'all' || message.fieldValues['/attributes/@msg05'] === selectedCategory;
    const statusMatch = selectedStatus === 'all' || message.fieldValues['/attributes/@msg07'] === selectedStatus;
    const sourceMatch = selectedSource === 'all' || 
      (selectedSource === 'auto' && isAutoMessage(message)) ||
      (selectedSource === 'manual' && !isAutoMessage(message));
    return categoryMatch && statusMatch && sourceMatch;
  });

  const getMessageStats = () => {
    const total = messages.length;
    const autoMessages = messages.filter(isAutoMessage).length;
    const manualMessages = total - autoMessages;
    
    const byStatus = messages.reduce((acc, msg) => {
      const status = msg.fieldValues['/attributes/@msg07'] || 'new';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byPriority = messages.reduce((acc, msg) => {
      const priority = msg.fieldValues['/attributes/@msg06'] || 'medium';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, autoMessages, manualMessages, byStatus, byPriority };
  };

  const stats = getMessageStats();

  if (loading && messages.length === 0) {
    return <LoadingCard text="Loading messages..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700 font-medium">Failed to Load Messages</span>
        </div>
        <p className="text-red-600 mb-4">{error}</p>
        <LoadingButton
          loading={loading}
          onClick={() => refetch()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          loadingText="Retrying..."
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </LoadingButton>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <MessageSquare className="w-6 sm:w-8 h-6 sm:h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Auto</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.autoMessages}</p>
            </div>
            <Zap className="w-6 sm:w-8 h-6 sm:h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Manual</p>
              <p className="text-lg sm:text-2xl font-bold text-purple-600">{stats.manualMessages}</p>
            </div>
            <User className="w-6 sm:w-8 h-6 sm:h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-lg sm:text-2xl font-bold text-red-600">{stats.byPriority.high || 0}</p>
            </div>
            <AlertCircle className="w-6 sm:w-8 h-6 sm:h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">New</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.byStatus.new || 0}</p>
            </div>
            <Clock className="w-6 sm:w-8 h-6 sm:h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Converted</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.byStatus.converted || 0}</p>
            </div>
            <CheckCircle2 className="w-6 sm:w-8 h-6 sm:h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Sources</option>
              <option value="auto">Auto-Processed</option>
              <option value="manual">Manual Entry</option>
            </select>
          </div>

          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Categories</option>
              <option value="urgent">Urgent</option>
              <option value="follow-up">Follow-up</option>
              <option value="inquiry">Inquiry</option>
              <option value="support">Support</option>
              <option value="sales">Sales</option>
              <option value="general">General</option>
            </select>
          </div>

          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="reviewed">Reviewed</option>
              <option value="converted">Converted</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex items-end">
            <LoadingButton
              loading={loading}
              onClick={() => refetch()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              loadingText="Refreshing..."
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Refresh</span>
            </LoadingButton>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <MessageSquare className="w-8 sm:w-12 h-8 sm:h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No messages found</h3>
            <p className="text-sm sm:text-base text-gray-500">
              {messages.length === 0 
                ? "Start by analyzing some WhatsApp messages in the AI Analyzer tab or set up API integration."
                : "Try adjusting your filters to see more messages."
              }
            </p>
          </div>
        ) : (
          filteredMessages.map((message) => {
            const StatusIcon = statusIcons[message.fieldValues['/attributes/@msg07'] as keyof typeof statusIcons] || Clock;
            const isAuto = isAutoMessage(message);
            const isUpdating = updatingStatus === message.id;
            
            return (
              <div key={message.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center ${
                        isAuto ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        {isAuto ? (
                          <Zap className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
                        ) : (
                          <MessageSquare className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                          {message.fieldValues['/attributes/@msg01'] || 'Unknown Sender'}
                        </h3>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 sm:mt-0 ${
                          isAuto 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}>
                          {isAuto ? 'Auto' : 'Manual'}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-500 space-y-1 sm:space-y-0">
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3 sm:w-4 h-3 sm:h-4" />
                          <span className="truncate">{message.fieldValues['/attributes/@msg02'] || 'No phone'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 sm:w-4 h-3 sm:h-4" />
                          <span>
                            {message.fieldValues['/attributes/@msg03'] 
                              ? new Date(message.fieldValues['/attributes/@msg03']).toLocaleDateString()
                              : 'No date'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <StatusIcon className={`w-4 sm:w-5 h-4 sm:h-5 ${statusColors[message.fieldValues['/attributes/@msg07'] as keyof typeof statusColors] || 'text-gray-500'}`} />
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm sm:text-base text-gray-700 bg-gray-50 rounded-lg p-3 sm:p-4 break-words">
                    {message.fieldValues['/attributes/@msg04'] || 'No message content'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {message.fieldValues['/attributes/@msg05'] && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        categoryColors[message.fieldValues['/attributes/@msg05'] as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {message.fieldValues['/attributes/@msg05']}
                      </span>
                    )}
                    
                    {message.fieldValues['/attributes/@msg06'] && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        priorityColors[message.fieldValues['/attributes/@msg06'] as keyof typeof priorityColors] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {message.fieldValues['/attributes/@msg06']} priority
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <select
                      value={message.fieldValues['/attributes/@msg07'] || 'new'}
                      onChange={(e) => updateMessageStatus(message.id, e.target.value)}
                      disabled={isUpdating}
                      className="text-xs sm:text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="new">New</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="converted">Converted</option>
                      <option value="archived">Archived</option>
                    </select>
                    {isUpdating && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};