'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Folder, Trash2, LayoutDashboard } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

  const deleteProject = async (id: string) => {
    await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
    });
    if (selectedProjectId === id) {
      setSelectedProjectId(null);
    }
    fetchProjects();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-800">پروژه‌ها</h2>
        <form onSubmit={createProject} className="mb-4 flex flex-col gap-2">
          <Input
            type="text"
            placeholder="نام پروژه جدید"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
          <Button type="submit" className="w-full">
            <Plus className="ml-2 h-4 w-4" />
            افزودن پروژه
          </Button>
        </form>
        {projects.length === 0 && (
          <Button variant="outline" onClick={createDefaultProject} className="w-full mb-4">
            ایجاد پروژه نمونه
          </Button>
        )}
        <ul className="space-y-1">
          {projects.map((project) => (
            <li
              key={project.id}
              className={`p-3 cursor-pointer rounded-lg text-sm font-medium transition-all flex justify-between items-center group ${selectedProjectId === project.id ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-muted text-muted-foreground border border-transparent'}`}
              onClick={() => setSelectedProjectId(project.id)}
            >
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4" />
                <span>{project.name}</span>
              </div>
              <AlertDialog>
                <AlertDialogTrigger render={
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                    className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    title="حذف پروژه"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                } />
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>آیا از حذف این پروژه مطمئن هستید؟</AlertDialogTitle>
                    <AlertDialogDescription>
                      این عملیات غیر قابل بازگشت است و تمام وظایف مرتبط با این پروژه نیز حذف خواهند شد.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex gap-2 sm:justify-start">
                    <AlertDialogCancel>انصراف</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteProject(project.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      حذف پروژه
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </li>
          ))}
        </ul>
      </div>

      <div className="md:col-span-3">
        {selectedProjectId ? (
          <TaskBoard projectId={selectedProjectId} />
        ) : (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-border text-center text-muted-foreground flex flex-col items-center justify-center h-full min-h-[400px]">
            <LayoutDashboard className="h-16 w-16 mb-4 text-muted" />
            <p className="text-lg font-medium">برای مشاهده وظایف، یک پروژه را انتخاب کنید</p>
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
    await fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    });
    fetchTasks(projectId);
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
        <Input
          type="text"
          placeholder="عنوان وظیفه جدید..."
          className="flex-grow"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
        />
        <Button type="submit" variant="default" className="whitespace-nowrap">
          <Plus className="ml-2 h-4 w-4" />
          افزودن وظیفه
        </Button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statuses.map(status => (
          <Card
            key={status.id}
            className="bg-muted/30 border-muted flex flex-col shadow-none"
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, status.id)}
          >
            <CardHeader className="pb-3 px-4 pt-4">
              <CardTitle className="text-base font-semibold flex items-center justify-between text-muted-foreground">
                <span>{status.label}</span>
                <Badge variant="secondary" className="rounded-full">
                  {tasks.filter(t => t.status === status.id).length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 flex-grow min-h-[200px] px-4 pb-4">
              {tasks.filter(t => t.status === status.id).map(task => (
                <Card
                  key={task.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, task.id)}
                  className={`border-t-4 ${status.color} hover:shadow-md transition-all cursor-grab active:cursor-grabbing group relative`}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-sm font-medium leading-tight">{task.title}</p>
                      <AlertDialog>
                        <AlertDialogTrigger render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 -mt-1 -mr-1 text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            title="حذف وظیفه"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        } />
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>آیا از حذف این وظیفه مطمئن هستید؟</AlertDialogTitle>
                            <AlertDialogDescription>
                              این وظیفه به طور دائمی حذف خواهد شد.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex gap-2 sm:justify-start">
                            <AlertDialogCancel>انصراف</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteTask(task.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              حذف وظیفه
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {tasks.filter(t => t.status === status.id).length === 0 && (
                <div className="text-muted-foreground text-sm text-center py-8 border-2 border-dashed border-muted rounded-lg">
                  وظیفه‌ای یافت نشد
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
