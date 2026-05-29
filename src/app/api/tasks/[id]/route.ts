// src/app/api/tasks/[id]/route.ts
import { NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Task from "@/lib/models/Task";
import { requireAdmin } from "@/helpers/apiAuth";
import { updateTaskSchema } from "@/schemas/task";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        await dbConnect();

        const authResult = requireAdmin(request);
        if ("error" in authResult) return authResult.error;

        const { id } = await params;
        const task = await Task.findById(id).lean();

        if (!task) {
            return Response.json(
                { success: false, error: "Task not found" },
                { status: 404 },
            );
        }

        return Response.json(
            {
                success: true,
                data: task,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Get task error:", error);
        return Response.json(
            { success: false, error: "Internal server error" },
            { status: 500 },
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        await dbConnect();

        const authResult = requireAdmin(request);
        if ("error" in authResult) return authResult.error;

        const { id } = await params;

        const body = await request.json();
        const parsed = updateTaskSchema.safeParse(body);

        if (!parsed.success) {
            return Response.json(
                {
                    success: false,
                    error: parsed.error.issues.map((i) => i.message).join(", "),
                },
                { status: 400 },
            );
        }

        const task = await Task.findByIdAndUpdate(id, parsed.data, {
            new: true,
            runValidators: true,
        });

        if (!task) {
            return Response.json(
                { success: false, error: "Task not found" },
                { status: 404 },
            );
        }

        return Response.json(
            {
                success: true,
                data: task,
                message: "Task updated successfully",
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Update task error:", error);
        return Response.json(
            { success: false, error: "Internal server error" },
            { status: 500 },
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        await dbConnect();

        const authResult = requireAdmin(request);
        if ("error" in authResult) return authResult.error;

        const { id } = await params;

        const task = await Task.findByIdAndDelete(id);

        if (!task) {
            return Response.json(
                { success: false, error: "Task not found" },
                { status: 404 },
            );
        }

        return Response.json(
            {
                success: true,
                message: "Task deleted successfully",
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Delete task error:", error);
        return Response.json(
            { success: false, error: "Internal server error" },
            { status: 500 },
        );
    }
}
