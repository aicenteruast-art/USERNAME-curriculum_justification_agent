import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    // Delete all tasks associated with the project first
    await prisma.task.deleteMany({
      where: { projectId: id },
    });

    // Then delete the project itself
    await prisma.project.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
