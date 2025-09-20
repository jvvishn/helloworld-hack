import React, { useState, useEffect } from 'react';
import Button from '../UI/Button';
import Card from '../UI/Card';
import Modal from '../UI/Modal';
import LoadingSpinner from '../UI/LoadingSpinner';
import checklistService from '../../services/checklistService';
import { useNotification } from '../../contexts/NotificationContext';

const ChecklistView = ({ groupId = null }) => {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChecklist, setNewChecklist] = useState({ title: '', description: '' });
  const [newTask, setNewTask] = useState({});
  const [activeChecklist, setActiveChecklist] = useState(null);

  const { showSuccess, showError } = useNotification();
  const isGroupView = groupId !== null;

  useEffect(() => {
    loadChecklists();
  }, [groupId]);

  const loadChecklists = async () => {
    setLoading(true);
    try {
      console.log('Loading checklists, isGroupView:', isGroupView);
      const data = isGroupView 
        ? await checklistService.getGroupChecklists(groupId)
        : await checklistService.getPersonalChecklists();
      console.log('Loaded checklists:', data);
      setChecklists(data);
    } catch (error) {
      console.error('Load checklists error:', error);
      showError('Failed to load checklists');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChecklist = async () => {
    console.log('Create button clicked, newChecklist:', newChecklist);
    
    if (!newChecklist.title.trim()) {
      console.log('No title provided');
      return;
    }

    try {
      console.log('Calling service method...');
      const result = isGroupView
        ? await checklistService.createGroupChecklist(groupId, newChecklist)
        : await checklistService.createPersonalChecklist(newChecklist);

      console.log('Service result:', result);
      
      if (result.success) {
        setChecklists(prev => [...prev, result.data]);
        setNewChecklist({ title: '', description: '' });
        setShowCreateModal(false);
        
        // Initialize newTask state for the new checklist
        setNewTask(prev => ({
          ...prev,
          [result.data.id]: { title: '', dueDate: '', priority: 'medium', assignedTo: '' }
        }));
        
        showSuccess('Checklist created successfully!');
      } else {
        console.log('No success flag in result');
        showError('Failed to create checklist');
      }
    } catch (error) {
      console.error('Create checklist error:', error);
      showError('Failed to create checklist');
    }
  };

  const handleToggleTask = async (checklistId, taskId) => {
    try {
      const checklist = checklists.find(c => c.id === checklistId);
      const task = checklist.tasks.find(t => t.id === taskId);
      
      await checklistService.updateTask(taskId, { 
        completed: !task.completed,
        completedBy: !task.completed ? 'Current User' : null,
        completedAt: !task.completed ? new Date().toISOString() : null
      });

      setChecklists(prev => prev.map(checklist => ({
        ...checklist,
        tasks: checklist.tasks.map(task => 
          task.id === taskId 
            ? { ...task, completed: !task.completed, completedBy: !task.completed ? 'Current User' : null }
            : task
        )
      })));

      showSuccess(task.completed ? 'Task unmarked' : 'Task completed!');
    } catch (error) {
      showError('Failed to update task');
    }
  };

  const handleAddTask = async (checklistId) => {
    const taskData = newTask[checklistId];
    if (!taskData?.title?.trim()) return;

    try {
      const taskPayload = {
        title: taskData.title,
        dueDate: taskData.dueDate || null,
        priority: taskData.priority || "medium",
      };

      if (isGroupView) {
        taskPayload.assignedTo = taskData.assignedTo || "Unassigned";
      }

      const result = await checklistService.addTask(checklistId, taskPayload);

      if (result.success) {
        setChecklists((prev) =>
          prev.map((checklist) =>
            checklist.id === checklistId
              ? { ...checklist, tasks: [...checklist.tasks, result.data] }
              : checklist
          )
        );
        setNewTask((prev) => ({
          ...prev,
          [checklistId]: {
            title: "",
            dueDate: "",
            priority: "medium",
            assignedTo: "",
          },
        }));
        showSuccess("Task added successfully!");
      }
    } catch (error) {
      showError("Failed to add task");
    }
  };

  const handleDeleteTask = async (checklistId, taskId) => {
    try {
      await checklistService.deleteTask(taskId);

      setChecklists((prev) =>
        prev.map((checklist) =>
          checklist.id === checklistId
            ? {
                ...checklist,
                tasks: checklist.tasks.filter((task) => task.id !== taskId),
              }
            : checklist
        )
      );

      showSuccess("Task deleted successfully!");
    } catch (error) {
      showError("Failed to delete task");
    }
  };

  const getTaskProgress = (tasks) => {
    const completed = tasks.filter(t => t.completed).length;
    return { completed, total: tasks.length, percentage: tasks.length ? (completed / tasks.length) * 100 : 0 };
  };

  if (loading) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isGroupView ? 'Group Checklists' : 'My Checklists'}
          </h2>
          <p className="text-gray-600">
            {isGroupView 
              ? 'Collaborative task lists for your study group'
              : 'Personal task lists and study goals'
            }
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          Create {isGroupView ? 'Group' : 'Personal'} Checklist
        </Button>
      </div>

      {/* Checklists */}
      {checklists.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 4h6m-6 4h6m-6 4h6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No checklists yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first {isGroupView ? 'group' : 'personal'} checklist to start organizing tasks
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            Create Checklist
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {checklists.map(checklist => {
            const progress = getTaskProgress(checklist.tasks);
            return (
              <Card key={checklist.id} className="p-6">
                {/* Checklist Header */}
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{checklist.title}</h3>
                    {isGroupView && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Group
                      </span>
                    )}
                  </div>
                  {checklist.description && (
                    <p className="text-gray-600 text-sm mb-3">{checklist.description}</p>
                  )}
                  
                  {/* Progress Bar */}
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      {progress.completed}/{progress.total}
                    </span>
                  </div>
                </div>

                {/* Tasks */}
                <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                  {checklist.tasks
                    .sort((a, b) => {
                      // Sort by due date, then by priority
                      if (a.completed !== b.completed) return a.completed - b.completed;
                      if (a.dueDate && b.dueDate)
                        return new Date(a.dueDate) - new Date(b.dueDate);
                      if (a.dueDate && !b.dueDate) return -1;
                      if (!a.dueDate && b.dueDate) return 1;
                      return 0;
                    })
                    .map((task) => {
                      const isOverdue =
                        task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
                      const isDueSoon =
                        task.dueDate &&
                        new Date(task.dueDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000) &&
                        new Date(task.dueDate) >= new Date() &&
                        !task.completed;

                      return (
                        <div
                          key={task.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 border transition-colors ${
                            task.completed
                              ? "opacity-75 bg-gray-50"
                              : isOverdue
                              ? "border-red-200 bg-red-50"
                              : isDueSoon
                              ? "border-yellow-200 bg-yellow-50"
                              : "border-transparent"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleToggleTask(checklist.id, task.id)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p
                                className={`text-sm font-medium ${
                                  task.completed
                                    ? "line-through text-gray-500"
                                    : isOverdue
                                    ? "text-red-900"
                                    : "text-gray-900"
                                }`}
                              >
                                {task.title}
                              </p>
                              {task.priority && task.priority !== "medium" && (
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    task.priority === "high"
                                      ? "bg-red-100 text-red-800"
                                      : task.priority === "low"
                                      ? "bg-gray-100 text-gray-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {task.priority}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                              {task.dueDate && (
                                <span
                                  className={`flex items-center space-x-1 ${
                                    isOverdue
                                      ? "text-red-600 font-medium"
                                      : isDueSoon
                                      ? "text-yellow-600 font-medium"
                                      : ""
                                  }`}
                                >
                                  <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V7a2 2 0 012-2h4a2 2 0 012 2v0M8 7v10a2 2 0 002 2h4a2 2 0 002-2V7m-6 0h6"
                                    />
                                  </svg>
                                  <span>
                                    Due: {new Date(task.dueDate).toLocaleDateString()}
                                    {isOverdue && " (Overdue)"}
                                    {isDueSoon && " (Due Soon)"}
                                  </span>
                                </span>
                              )}
                              {isGroupView && task.assignedTo && (
                                <>
                                  {task.dueDate && <span>•</span>}
                                  <span>Assigned to: {task.assignedTo}</span>
                                </>
                              )}
                              {task.completedBy && (
                                <>
                                  <span>•</span>
                                  <span>Completed by: {task.completedBy}</span>
                                </>
                              )}
                            </div>
                          </div>
                          {!task.completed && (
                            <button
                              onClick={() => handleDeleteTask(checklist.id, task.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>

                {/* Add Task */}
                <div className="border-t pt-4">
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newTask[checklist.id]?.title || ""}
                      onChange={(e) =>
                        setNewTask((prev) => ({
                          ...prev,
                          [checklist.id]: { ...prev[checklist.id], title: e.target.value },
                        }))
                      }
                      placeholder="Add a new task..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) =>
                        e.key === "Enter" && !e.shiftKey && handleAddTask(checklist.id)
                      }
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Due Date</label>
                        <input
                          type="date"
                          value={newTask[checklist.id]?.dueDate || ""}
                          onChange={(e) =>
                            setNewTask((prev) => ({
                              ...prev,
                              [checklist.id]: {
                                ...prev[checklist.id],
                                dueDate: e.target.value,
                              },
                            }))
                          }
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Priority</label>
                        <select
                          value={newTask[checklist.id]?.priority || "medium"}
                          onChange={(e) =>
                            setNewTask((prev) => ({
                              ...prev,
                              [checklist.id]: {
                                ...prev[checklist.id],
                                priority: e.target.value,
                              },
                            }))
                          }
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>

                      {isGroupView && (
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Assign To</label>
                          <select
                            value={newTask[checklist.id]?.assignedTo || "Unassigned"}
                            onChange={(e) =>
                              setNewTask((prev) => ({
                                ...prev,
                                [checklist.id]: {
                                  ...prev[checklist.id],
                                  assignedTo: e.target.value,
                                },
                              }))
                            }
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="Unassigned">Unassigned</option>
                            <option value="Alice">Alice</option>
                            <option value="Bob">Bob</option>
                            <option value="Carol">Carol</option>
                            <option value="David">David</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <Button
                      size="small"
                      onClick={() => handleAddTask(checklist.id)}
                      disabled={!newTask[checklist.id]?.title?.trim()}
                      className="w-full"
                    >
                      Add Task
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Checklist Modal */}
      <Modal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        size="medium"
      >
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Create {isGroupView ? 'Group' : 'Personal'} Checklist
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={newChecklist.title}
              onChange={(e) => setNewChecklist(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Midterm Study Plan"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={newChecklist.description}
              onChange={(e) => setNewChecklist(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this checklist is for..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateChecklist}
              disabled={!newChecklist.title.trim()}
              className="flex-1"
            >
              Create Checklist
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChecklistView;