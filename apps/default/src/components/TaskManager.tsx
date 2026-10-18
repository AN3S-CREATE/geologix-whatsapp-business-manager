import * as React from "react";
import { CheckSquare, Plus, Calendar, Clock, User, AlertCircle, Trash2 } from "lucide-react";

interface Task {
  id: string;
  fieldValues: {
    '/text': string;
    '/attributes/@tsk01': string; // Source Message ID
    '/attributes/@tsk02': string; // Client Name
    '/attributes/@tsk03': string; // Task Type
    '/attributes/@tsk04': string; // Priority
    '/attributes/@tsk05': string; // Due Date
    '/attributes/@tsk06': string; // Estimated Time
    '/attributes/@tsk07': string; // Value-Add Notes
    '/attributes/note': string;   // Description
  };
}

interface NewTaskForm {
  title: string;
  clientName: string;
  taskType: string;
  priority: string;
  dueDate: string;
  estimatedTime: string;
  valueAddNotes: string;
  description: string;
}

const taskTypeColors = {
  'follow-up': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'research': 'bg-blue-100 text-blue-800 border-blue-200',
  'proposal': 'bg-purple-100 text-purple-800 border-purple-200',
  'meeting': 'bg-green-100 text-green-800 border-green-200',
  'support': 'bg-red-100 text-red-800 border-red-200',
  'documentation': 'bg-gray-100 text-gray-800 border-gray-200'
};

const priorityColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-orange-100 text-orange-800',
  low: 'bg-green-100 text-green-800'
};

export const TaskManager: React.FC = () => {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showNewTaskForm, setShowNewTaskForm] = React.useState(false);
  const [newTask, setNewTask] = React.useState<NewTaskForm>({
    title: '',
    clientName: '',
    taskType: 'follow-up',
    priority: 'medium',
    dueDate: '',
    estimatedTime: '',
    valueAddNotes: '',
    description: ''
  });
  const [isCreating, setIsCreating] = React.useState(false);

  React.useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/taskade/projects/8fCUiDY5oGVYhKVb/nodes');
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      setTasks(data.payload?.nodes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await fetch('/api/taskade/projects/8fCUiDY5oGVYhKVb/nodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          '/text': newTask.title,
          '/attributes/@tsk02': newTask.clientName,
          '/attributes/@tsk03': newTask.taskType,
          '/attributes/@tsk04': newTask.priority,
          '/attributes/@tsk05': newTask.dueDate,
          '/attributes/@tsk06': newTask.estimatedTime,
          '/attributes/@tsk07': newTask.valueAddNotes,
          '/attributes/note': newTask.description
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      // Reset form and refresh tasks
      setNewTask({
        title: '',
        clientName: '',
        taskType: 'follow-up',
        priority: 'medium',
        dueDate: '',
        estimatedTime: '',
        valueAddNotes: '',
        description: ''
      });
      setShowNewTaskForm(false);
      fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsCreating(false);
    }
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const byPriority = tasks.reduce((acc, task) => {
      const priority = task.fieldValues['/attributes/@tsk04'] || 'medium';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const overdue = tasks.filter(task => {
      const dueDate = task.fieldValues['/attributes/@tsk05'];
      return dueDate && new Date(dueDate) < new Date();
    }).length;

    return { total, byPriority, overdue };
  };

  const stats = getTaskStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading tasks...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700 font-medium">Error</span>
        </div>
        <p className="text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Generated Tasks</h2>
          <p className="text-gray-600">Manage tasks generated from WhatsApp messages</p>
        </div>
        <button
          onClick={() => setShowNewTaskForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <CheckSquare className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-red-600">{stats.byPriority.high || 0}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Medium Priority</p>
              <p className="text-2xl font-bold text-orange-600">{stats.byPriority.medium || 0}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            </div>
            <Calendar className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* New Task Form Modal */}
      {showNewTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Create New Task</h3>
                <button
                  onClick={() => setShowNewTaskForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={createTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client Name</label>
                    <input
                      type="text"
                      value={newTask.clientName}
                      onChange={(e) => setNewTask(prev => ({ ...prev, clientName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Task Type</label>
                    <select
                      value={newTask.taskType}
                      onChange={(e) => setNewTask(prev => ({ ...prev, taskType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="follow-up">Follow-up</option>
                      <option value="research">Research</option>
                      <option value="proposal">Proposal</option>
                      <option value="meeting">Meeting</option>
                      <option value="support">Support</option>
                      <option value="documentation">Documentation</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                    <input
                      type="datetime-local"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Time</label>
                  <input
                    type="text"
                    value={newTask.estimatedTime}
                    onChange={(e) => setNewTask(prev => ({ ...prev, estimatedTime: e.target.value }))}
                    placeholder="e.g., 2 hours, 30 minutes"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Value-Add Notes</label>
                  <input
                    type="text"
                    value={newTask.valueAddNotes}
                    onChange={(e) => setNewTask(prev => ({ ...prev, valueAddNotes: e.target.value }))}
                    placeholder="How does this task add value to the business relationship?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewTaskForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? 'Creating...' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
            <p className="text-gray-500">
              Tasks generated from WhatsApp messages will appear here, or you can create them manually.
            </p>
          </div>
        ) : (
          tasks.map((task) => {
            const isOverdue = task.fieldValues['/attributes/@tsk05'] && 
              new Date(task.fieldValues['/attributes/@tsk05']) < new Date();
            
            return (
              <div key={task.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {task.fieldValues['/text'] || 'Untitled Task'}
                    </h3>
                    
                    {task.fieldValues['/attributes/note'] && (
                      <p className="text-gray-600 mb-3">
                        {task.fieldValues['/attributes/note']}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      {task.fieldValues['/attributes/@tsk02'] && (
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{task.fieldValues['/attributes/@tsk02']}</span>
                        </div>
                      )}
                      
                      {task.fieldValues['/attributes/@tsk05'] && (
                        <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-600' : ''}`}>
                          <Calendar className="w-4 h-4" />
                          <span>
                            Due: {new Date(task.fieldValues['/attributes/@tsk05']).toLocaleDateString()}
                            {isOverdue && ' (Overdue)'}
                          </span>
                        </div>
                      )}
                      
                      {task.fieldValues['/attributes/@tsk06'] && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{task.fieldValues['/attributes/@tsk06']}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {task.fieldValues['/attributes/@tsk03'] && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        taskTypeColors[task.fieldValues['/attributes/@tsk03'] as keyof typeof taskTypeColors] || 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {task.fieldValues['/attributes/@tsk03']}
                      </span>
                    )}
                    
                    {task.fieldValues['/attributes/@tsk04'] && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        priorityColors[task.fieldValues['/attributes/@tsk04'] as keyof typeof priorityColors] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {task.fieldValues['/attributes/@tsk04']} priority
                      </span>
                    )}
                  </div>
                </div>

                {task.fieldValues['/attributes/@tsk07'] && (
                  <div className="bg-blue-50 rounded-lg p-3 mt-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-1">Value-Add Notes</h4>
                    <p className="text-sm text-blue-700">
                      {task.fieldValues['/attributes/@tsk07']}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};