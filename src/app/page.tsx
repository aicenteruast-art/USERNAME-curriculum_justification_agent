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
    fetchProjects();
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
      body: JSON.stringify({ name: 'Default Project' }),
    });
    fetchProjects();
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-1 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Projects</h2>
        <form onSubmit={createProject} className="mb-4">
          <input
            type="text"
            placeholder="New Project Name"
            className="w-full border p-2 rounded mb-2"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
            Add Project
          </button>
        </form>
        {projects.length === 0 && <button onClick={createDefaultProject} className="text-blue-500 text-sm">Create demo project</button>}
        <ul>
          {projects.map((project) => (
            <li
              key={project.id}
              className={`p-2 cursor-pointer rounded ${selectedProjectId === project.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              onClick={() => setSelectedProjectId(project.id)}
            >
              {project.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="md:col-span-3">
        {selectedProjectId ? (
          <TaskBoard projectId={selectedProjectId} />
        ) : (
          <div className="bg-white p-8 rounded shadow text-center text-gray-500">
            Select a project to view tasks
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
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    const res = await fetch(`/api/tasks?projectId=${projectId}`);
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
    fetchTasks();
  };

  const statuses = ['TODO', 'IN_PROGRESS', 'DONE'];

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Task Board</h2>

      <form onSubmit={createTask} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="New Task Title"
          className="flex-grow border p-2 rounded"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
        />
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Add Task
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statuses.map(status => (
          <div key={status} className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold mb-2">{status.replace('_', ' ')}</h3>
            <div className="space-y-2">
              {tasks.filter(t => t.status === status).map(task => (
                <div key={task.id} className="bg-white p-3 rounded shadow-sm border border-gray-200">
                  {task.title}
                </div>
              ))}
              {tasks.filter(t => t.status === status).length === 0 && (
                <div className="text-gray-400 text-sm italic">No tasks</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
