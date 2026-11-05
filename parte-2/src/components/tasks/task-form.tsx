"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { Loader2, Save, ArrowLeft, AlertCircle } from "lucide-react";

export interface TaskFormData {
  titulo: string;
  descricao?: string;
}

interface TaskFormProps {
  initialData?: TaskFormData;
  onSubmit: (data: TaskFormData) => Promise<void> | void;
  isSubmitting?: boolean;
  submitButtonLabel?: string;
  cancelHref?: string;
}

export function TaskForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  submitButtonLabel = "Save Task",
  cancelHref = "/",
}: TaskFormProps) {
  const [titulo, setTitulo] = useState(initialData?.titulo ?? "");
  const [descricao, setDescricao] = useState(initialData?.descricao ?? "");
  const [tituloError, setTituloError] = useState<string | null>(null);

  const handleTituloChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitulo(value);
    if (tituloError && value.trim().length > 0) {
      setTituloError(null);
    }
  };

  const handleDescricaoChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDescricao(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedTitulo = titulo.trim();
    if (!trimmedTitulo) {
      setTituloError("Task title is required and cannot contain only whitespace.");
      return;
    }

    setTituloError(null);

    await onSubmit({
      titulo: trimmedTitulo,
      descricao: descricao.trim() ? descricao.trim() : undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6"
    >
      <div className="space-y-2">
        <label
          htmlFor="titulo"
          className="block text-sm font-semibold text-slate-800"
        >
          Task Title <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <input
            id="titulo"
            type="text"
            value={titulo}
            onChange={handleTituloChange}
            disabled={isSubmitting}
            placeholder="e.g., Implement authentication flow"
            maxLength={100}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 ${
              tituloError
                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/30 text-rose-900"
                : "border-slate-300 focus:border-blue-500 focus:ring-blue-100 bg-white text-slate-900"
            } disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed`}
          />
        </div>

        {tituloError ? (
          <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium pt-1">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{tituloError}</span>
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            Required. Minimum 1 non-whitespace character (max: 100).
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="descricao"
            className="block text-sm font-semibold text-slate-800"
          >
            Description <span className="text-xs font-normal text-slate-400">(Optional)</span>
          </label>
          <span className="text-xs text-slate-400 font-mono">
            {descricao.length}/500
          </span>
        </div>
        <textarea
          id="descricao"
          rows={4}
          value={descricao}
          onChange={handleDescricaoChange}
          disabled={isSubmitting}
          maxLength={500}
          placeholder="Describe details, acceptance criteria, or notes about this task..."
          className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed resize-y"
        />
      </div>

      <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3">
        <Link
          href={cancelHref}
          className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors ${
            isSubmitting ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel</span>
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-sm font-semibold text-white shadow-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{submitButtonLabel}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
