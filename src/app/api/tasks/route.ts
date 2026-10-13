import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  try {
    const tasks = await prisma.task.findMany({
      where: projectId ? { projectId } : undefined,
    });
    return NextResponse.json(tasks);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, description, projectId, status } = await request.json();
    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        status: status || 'TODO',
      },
    });
    return NextResponse.json(task, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
