import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { status, title } = await request.json();
    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(title && { title }),
      },
    });
    return NextResponse.json(task);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.task.delete({
      where: { id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
