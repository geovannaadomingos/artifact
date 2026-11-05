"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Plus, ListTodo, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { trpc } from "@/trpc/client";
import { TaskCard } from "./task-card";
import { FeedbackAlert, FeedbackType } from "../ui/feedback-alert";

interface FeedbackState {
  type: FeedbackType;
  message: string | null;
}

export function TaskList() {
  const [feedback, setFeedback] = useState<FeedbackState>({
    type: null,
    message: null,
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement | null>(null);

  const utils = trpc.useUtils();

  const {
    data,
    error,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = trpc.task.list.useInfiniteQuery(
    { limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: undefined,
    }
  );

  const deleteMutation = trpc.task.delete.useMutation({
    onMutate: ({ id }) => {
      setDeletingId(id);
    },
    onSuccess: () => {
      setFeedback({
        type: "success",
        message: "Task deleted successfully!",
      });
      utils.task.list.invalidate();
    },
    onError: (err) => {
      setFeedback({
        type: "error",
        message: err.message || "Failed to delete task.",
      });
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id });
  };

  useEffect(() => {
    const target = observerTarget.current;
    if (!target || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (!feedback.message) return;
    const timer = setTimeout(() => {
      setFeedback({ type: null, message: null });
    }, 5000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const tasks = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Your Tasks</h2>
          </div>
          <p className="text-xs text-slate-500">
            {tasks.length > 0
              ? `${tasks.length} task(s) loaded with infinite scroll support`
              : "No tasks registered yet"}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefetching ? "animate-spin text-blue-600" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            href="/tasks/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-sm transition-all duration-150"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </Link>
        </div>
      </div>

      <FeedbackAlert
        type={feedback.type}
        message={feedback.message}
        onClose={() => setFeedback({ type: null, message: null })}
      />

      {error && (
        <FeedbackAlert
          type="error"
          message={`Failed to load tasks: ${error.message}`}
        />
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm">Loading tasks...</p>
        </div>
      )}

      {!isLoading && tasks.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-800">
              All caught up!
            </h3>
            <p className="text-sm text-slate-500 max-w-sm">
              You do not have any tasks yet. How about creating your first task now?
            </p>
          </div>
          <Link
            href="/tasks/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Task</span>
          </Link>
        </div>
      )}

      {tasks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={handleDelete}
              isDeleting={deletingId === task.id}
            />
          ))}
        </div>
      )}

      <div
        ref={observerTarget}
        className="flex items-center justify-center py-6 text-xs text-slate-400"
      >
        {isFetchingNextPage ? (
          <div className="flex items-center gap-2 text-blue-600 font-medium">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading more tasks...</span>
          </div>
        ) : hasNextPage ? (
          <span>Scroll to load more</span>
        ) : tasks.length > 0 ? (
          <span>You have reached the end of the task list.</span>
        ) : null}
      </div>
    </section>
  );
}
