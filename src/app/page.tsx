'use client';

import { useState, useEffect } from 'react';

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
};

type Project = {
  id: string;
  name: string;
  description: string | null;
  tasks: Task[];
};

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchProjects = async () => {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (mounted) {
        setProjects(data);
      }
    };
    fetchProjects();
    return () => {
      mounted = false;
    };
  }, []);

  const fetchProjects = async () => {
    const res = await fetch('/api/projects');
    const data = await res.json();
    setProjects(data);
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;

    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newProjectName }),
    });

    setNewProjectName('');
    fetchProjects();
  };

  const createDefaultProject = async () => {
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'پروژه نمونه' }),
    });
    fetchProjects();
  }

  const deleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('آیا از حذف این پروژه و تمام وظایف آن مطمئن هستید؟')) {
      await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });
      if (selectedProjectId === id) {
        setSelectedProjectId(null);
      }
      fetchProjects();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-800">پروژه‌ها</h2>
        <form onSubmit={createProject} className="mb-4">
          <input
            type="text"
            placeholder="نام پروژه جدید"
            className="w-full border border-gray-200 p-2.5 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg transition-colors text-sm font-medium">
            افزودن پروژه
          </button>
        </form>
        {projects.length === 0 && <button onClick={createDefaultProject} className="text-blue-500 hover:text-blue-600 text-sm w-full text-center py-2 transition-colors">ایجاد پروژه نمونه</button>}
        <ul className="space-y-1">
          {projects.map((project) => (
            <li
              key={project.id}
              className={`p-3 cursor-pointer rounded-lg text-sm font-medium transition-colors flex justify-between items-center group ${selectedProjectId === project.id ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'hover:bg-gray-50 text-gray-700 border border-transparent'}`}
              onClick={() => setSelectedProjectId(project.id)}
            >
              <span>{project.name}</span>
              <button
                onClick={(e) => deleteProject(e, project.id)}
                className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                title="حذف پروژه"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="md:col-span-3">
        {selectedProjectId ? (
          <TaskBoard projectId={selectedProjectId} />
        ) : (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500 flex flex-col items-center justify-center h-full min-h-[400px]">
            <span className="text-4xl mb-4">📂</span>
            <p className="text-lg">برای مشاهده وظایف، یک پروژه را انتخاب کنید</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskBoard({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchTasksEffect = async () => {
      const res = await fetch(`/api/tasks?projectId=${projectId}`);
      const data = await res.json();
      if (mounted) {
        setTasks(data);
      }
    };
    fetchTasksEffect();
    return () => {
      mounted = false;
    };
  }, [projectId]);

  const fetchTasks = async (id: string) => {
    const res = await fetch(`/api/tasks?projectId=${id}`);
    const data = await res.json();
    setTasks(data);
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTaskTitle, projectId, status: 'TODO' }),
    });

    setNewTaskTitle('');
    fetchTasks(projectId);
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    // Optimistic UI update
    setTasks(currentTasks =>
      currentTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
    );

    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  const deleteTask = async (taskId: string) => {
    if (confirm('آیا از حذف این وظیفه مطمئن هستید؟')) {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      fetchTasks(projectId);
    }
  };

  const onDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // allow drop
  };

  const onDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      updateTaskStatus(taskId, status);
    }
  };

  const statuses = [
    { id: 'TODO', label: 'برای انجام', color: 'border-t-gray-400' },
    { id: 'IN_PROGRESS', label: 'در حال انجام', color: 'border-t-blue-400' },
    { id: 'DONE', label: 'انجام شده', color: 'border-t-green-400' }
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">تخته وظایف</h2>

      <form onSubmit={createTask} className="mb-8 flex gap-3">
        <input
          type="text"
          placeholder="عنوان وظیفه جدید..."
          className="flex-grow border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
        />
        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors text-sm font-medium whitespace-nowrap">
          افزودن وظیفه
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statuses.map(status => (
          <div
            key={status.id}
            className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col"
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, status.id)}
          >
            <h3 className="font-bold mb-4 text-gray-700 flex items-center justify-between">
              <span>{status.label}</span>
              <span className="bg-slate-200 text-slate-600 text-xs py-1 px-2.5 rounded-full">
                {tasks.filter(t => t.status === status.id).length}
              </span>
            </h3>
            <div className="space-y-3 flex-grow min-h-[200px]">
              {tasks.filter(t => t.status === status.id).map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, task.id)}
                  className={`bg-white p-4 rounded-lg shadow-sm border border-gray-100 border-t-4 ${status.color} hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group relative`}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm text-gray-800 font-medium pr-6">{task.title}</p>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="absolute top-3 right-3 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="حذف وظیفه"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.status === status.id).length === 0 && (
                <div className="text-gray-400 text-sm text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  وظیفه‌ای یافت نشد
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
