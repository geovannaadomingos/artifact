"use client";

import Link from "next/link";
import { Trash2, Edit3, Calendar, Loader2 } from "lucide-react";
import { Task } from "@/server/schemas/task.schema";

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => Promise<void> | void;
  isDeleting?: boolean;
}

export function TaskCard({ task, onDelete, isDeleting = false }: TaskCardProps) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(task.dataCriacao));

  return (
    <article
      className={`p-5 rounded-xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md ${
        isDeleting ? "opacity-60 pointer-events-none" : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5 flex-1 min-w-0">
          <h3 className="text-base font-semibold text-slate-900 break-words">
            {task.titulo}
          </h3>
          {task.descricao ? (
            <p className="text-sm text-slate-600 break-words whitespace-pre-line leading-relaxed">
              {task.descricao}
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic">No description provided</p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Link
            href={`/tasks/${task.id}/edit`}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit task"
            aria-label={`Edit task "${task.titulo}"`}
          >
            <Edit3 className="w-4 h-4" />
          </Link>

          <button
            type="button"
            onClick={() => onDelete(task.id)}
            disabled={isDeleting}
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
            title="Delete task"
            aria-label={`Delete task "${task.titulo}"`}
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span suppressHydrationWarning>Created on: {formattedDate}</span>
        </div>
        <span className="font-mono text-[10px] text-slate-300 truncate max-w-[120px]" title={task.id}>
          #{task.id.slice(0, 8)}
        </span>
      </div>
    </article>
  );
}
