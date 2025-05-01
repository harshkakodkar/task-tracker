import React, { useEffect, useState } from 'react';
import api from '../api';
import { getToken } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: '' });
  const [tasks, setTasks] = useState({});
  const [taskForms, setTaskForms] = useState({});
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTaskText, setEditTaskText] = useState('');
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (!token) return navigate('/');
    
    fetchProjects();
  }, []);

  

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
      res.data.forEach((project) => fetchTasks(project._id));
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchTasks = async (projectId) => {
    try {
      const res = await api.get(`/tasks/${projectId}`);
      setTasks((prev) => ({ ...prev, [projectId]: res.data }));
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', form);
      setForm({ name: '' });
      fetchProjects();
    } catch (err) {
      alert('Project creation failed (max 4 allowed)');
    }
  };

  const handleCreateTask = async (e, projectId) => {
    e.preventDefault();
    const text = taskForms[projectId]?.description || '';
    if (!text.trim()) return;

    try {
      await api.post('/tasks', {
        description: text,
        projectId,
        status: 'Pending'
      });
      fetchTasks(projectId);
      setTaskForms((prev) => ({ ...prev, [projectId]: { description: '' } }));
    } catch (err) {
      console.error('Task creation failed:', err);
    }
  };

  const handleDeleteTask = async (taskId, projectId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks(projectId);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleStartEdit = (taskId, description) => {
    setEditTaskId(taskId);
    setEditTaskText(description);
  };

  const handleUpdateTask = async (taskId, projectId) => {
    try {
      await api.put(`/tasks/${taskId}`, { description: editTaskText });
      setEditTaskId(null);
      setEditTaskText('');
      fetchTasks(projectId);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleStatusChange = async (taskId, projectId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks(projectId);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${projectId}`);
      fetchProjects();
    } catch (err) {
      alert('Failed to delete project: ' + err.response.data);
    }
  };

  const getTaskStatusCounts = (projectId) => {
    const projectTasks = tasks[projectId] || [];
    const counts = { Pending: 0, 'In Progress': 0, Completed: 0 };
    projectTasks.forEach((t) => {
      if (counts[t.status] !== undefined) counts[t.status]++;
    });
    return counts;
  };

  const filteredProjects = projects.filter(project => {
    if (activeTab === 'all') return true;
    const counts = getTaskStatusCounts(project._id);
    if (activeTab === 'active') return counts.Completed < (counts.Pending + counts['In Progress']);
    if (activeTab === 'completed') return counts.Completed === (counts.Pending + counts['In Progress'] + counts.Completed);
    return true;
  });

  return (
    <>
      <Navbar user={user} />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8">
  <div className="max-w-6xl mx-auto">
    {/* Centered Header and Form */}
    <div className="flex flex-col items-center text-center mb-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Project Dashboard</h1>
        <p className="text-gray-400">Manage your projects and tasks efficiently</p>
      </div>
      
      <form 
  onSubmit={handleCreateProject} 
  className="w-full max-w-md mx-auto flex flex-col md:flex-row gap-4"
>
  <input
    name="name"
    placeholder="Enter Project Name"
    value={form.name}
    onChange={(e) => setForm({ name: e.target.value })}
    required
    className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 md:flex-1"
  />
  <button
    type="submit"
    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg w-full md:w-auto"
  >
    Create Project
  </button>
</form>
    </div>

    
           {/* Projects Grid - Centered */}
    {filteredProjects.length === 0 ? (
      <div className="bg-gray-800 rounded-xl p-8 text-center max-w-md mx-auto ">
        <div className="text-gray-400 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-300 mb-2">No projects found</h3>
        <p className="text-gray-500">Create a new project to get started</p>
      </div>
    ) : (
      <div className="">
        {filteredProjects.map((p) => {
          const counts = getTaskStatusCounts(p._id);
          const totalTasks = counts.Pending + counts['In Progress'] + counts.Completed;
          const completionPercentage = totalTasks > 0 ? Math.round((counts.Completed / totalTasks) * 100) : 0;
          
          return (
            <div key={p._id} className="bg-gray-800 rounded-xl mb-10 p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 shadow-lg mx-auto max-w-2xl w-full">
              {/* Project Header - Centered */}
              <div className="flex justify-between items-center mb-4">
                <div className="text-center flex-1">
                  <h3 className="text-xl font-bold text-white">{p.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'} • {completionPercentage}% completed
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteProject(p._id)}
                  className="text-red-400 hover:text-red-300 transition-colors p-1 ml-4"
                  title="Delete project"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
          
              {/* Progress Bar - Centered */}
              <div className="mb-6 mx-auto max-w-md">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full" 
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>
          
              {/* Status Indicators - Centered */}
              <div className="grid grid-cols-3 gap-2 mb-6 mx-auto max-w-md">
                <div className="bg-gray-700 rounded-lg p-3 text-center">
                  <div className="text-yellow-400 font-bold">{counts.Pending}</div>
                  <div className="text-xs text-gray-400">Pending</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3 text-center">
                  <div className="text-blue-400 font-bold">{counts['In Progress']}</div>
                  <div className="text-xs text-gray-400">In Progress</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3 text-center">
                  <div className="text-green-400 font-bold">{counts.Completed}</div>
                  <div className="text-xs text-gray-400">Completed</div>
                </div>
              </div>
          
              {/* Add Task Form - Centered */}
              <form onSubmit={(e) => handleCreateTask(e, p._id)} className="flex gap-2 mb-6 mx-auto max-w-md">
                <input
                  placeholder="What needs to be done?"
                  value={taskForms[p._id]?.description || ''}
                  onChange={(e) =>
                    setTaskForms((prev) => ({
                      ...prev,
                      [p._id]: { description: e.target.value },
                    }))
                  }
                  required
                  className="flex-1 px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-500"
                />
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-300 flex items-center justify-center"
                  title="Add task"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </form>
          
              {/* Tasks List - Centered */}
              <div className="space-y-3 mx-auto max-w-md">
                {tasks[p._id]?.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No tasks yet. Add your first task above.
                  </div>
                ) : (
                  tasks[p._id]?.map((t) => (
                    <div
                      key={t._id}
                      className={`p-4 rounded-lg transition-all duration-200 ${editTaskId === t._id ? 'bg-gray-700' : 'bg-gray-700 hover:bg-gray-650'}`}
                    >
                      {editTaskId === t._id ? (
                        <div className="flex flex-col gap-3">
                          <input
                            value={editTaskText}
                            onChange={(e) => setEditTaskText(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-600 text-white border border-gray-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setEditTaskId(null)}
                              className="px-3 py-1 text-sm bg-gray-600 text-gray-300 rounded hover:bg-gray-500 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleUpdateTask(t._id, p._id)}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            <input
                              type="checkbox"
                              checked={t.status === 'Completed'}
                              onChange={(e) =>
                                handleStatusChange(
                                  t._id,
                                  p._id,
                                  e.target.checked ? 'Completed' : 'Pending'
                                )
                              }
                              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-600 bg-gray-700"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm ${t.status === 'Completed' ? 'line-through text-gray-400' : 'text-gray-200'}`}>
                              {t.description}
                            </div>
                            <div className="mt-1">
                              <select
                                value={t.status}
                                onChange={(e) =>
                                  handleStatusChange(t._id, p._id, e.target.value)
                                }
                                className="text-xs bg-gray-600 border border-gray-500 text-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="Pending" className="bg-gray-700">Pending</option>
                                <option value="In Progress" className="bg-gray-700">In Progress</option>
                                <option value="Completed" className="bg-gray-700">Completed</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleStartEdit(t._id, t.description)}
                              className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                              title="Edit task"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteTask(t._id, p._id)}
                              className="text-red-400 hover:text-red-300 transition-colors p-1"
                              title="Delete task"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;