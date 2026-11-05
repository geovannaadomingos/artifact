"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { TaskForm, TaskFormData } from "@/components/tasks/task-form";
import { FeedbackAlert, FeedbackType } from "@/components/ui/feedback-alert";

export default function NewTaskPage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [feedback, setFeedback] = useState<{
    type: FeedbackType;
    message: string | null;
  }>({
    type: null,
    message: null,
  });

  const createMutation = trpc.task.create.useMutation({
    onSuccess: async () => {
      await utils.task.list.invalidate();
      router.push("/");
    },
    onError: (err) => {
      setFeedback({
        type: "error",
        message: err.message || "Failed to create task. Please try again.",
      });
    },
  });

  const handleSubmit = async (data: TaskFormData) => {
    setFeedback({ type: null, message: null });
    createMutation.mutate({
      titulo: data.titulo,
      descricao: data.descricao,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Create New Task
        </h1>
        <p className="text-sm text-slate-500">
          Fill in the details below to add a new task to your list.
        </p>
      </header>

      <FeedbackAlert
        type={feedback.type}
        message={feedback.message}
        onClose={() => setFeedback({ type: null, message: null })}
      />

      <TaskForm
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        submitButtonLabel="Create Task"
        cancelHref="/"
      />
    </div>
  );
}

