"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";
import { trpc } from "@/trpc/client";
import { TaskForm, TaskFormData } from "@/components/tasks/task-form";
import { FeedbackAlert, FeedbackType } from "@/components/ui/feedback-alert";

export default function EditTaskPage() {
  const router = useRouter();
  const routeParams = useParams<{ id: string }>();
  const id = routeParams?.id as string;
  const utils = trpc.useUtils();
  const [feedback, setFeedback] = useState<{
    type: FeedbackType;
    message: string | null;
  }>({
    type: null,
    message: null,
  });

  const {
    data: task,
    isLoading,
    error: loadError,
  } = trpc.task.getById.useQuery(
    { id },
    {
      retry: false,
    }
  );

  const updateMutation = trpc.task.update.useMutation({
    onSuccess: async () => {
      await utils.task.list.invalidate();
      await utils.task.getById.invalidate({ id });
      router.push("/");
    },
    onError: (err) => {
      setFeedback({
        type: "error",
        message: err.message || "Failed to update task. Please try again.",
      });
    },
  });

  const handleSubmit = async (data: TaskFormData) => {
    setFeedback({ type: null, message: null });
    updateMutation.mutate({
      id,
      titulo: data.titulo,
      descricao: data.descricao,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm">Loading task details...</p>
      </div>
    );
  }

  if (loadError || !task) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <FeedbackAlert
          type="error"
          message={loadError?.message || "Task not found."}
        />
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Task List</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Edit Task
        </h1>
        <p className="text-sm text-slate-500">
          Modify the details below and save changes to update the task.
        </p>
      </header>

      <FeedbackAlert
        type={feedback.type}
        message={feedback.message}
        onClose={() => setFeedback({ type: null, message: null })}
      />

      <TaskForm
        initialData={{
          titulo: task.titulo,
          descricao: task.descricao,
        }}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        submitButtonLabel="Save Changes"
        cancelHref="/"
      />
    </div>
  );
}
