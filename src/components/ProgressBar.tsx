import React from "react";

interface ProgressBarProps {
  status: string;
}

export default function ProgressBar({ status }: ProgressBarProps) {
  // 3 Tahap: Diterima -> Penugasan Kru -> Selesai
  // Stage 1: Diterima (Menunggu)
  // Stage 2: Penugasan Kru (Diproses / Sedang Dikerjakan)
  // Stage 3: Selesai
  let activeStep = 1;
  if (status === "Diproses" || status === "Sedang Dikerjakan") {
    activeStep = 2;
  } else if (status === "Selesai") {
    activeStep = 3;
  }

  const steps = [
    { num: 1, label: "Diterima", icon: "check_circle" },
    { num: 2, label: "Penugasan Kru", icon: "engineering" },
    { num: 3, label: "Selesai", icon: "task_alt" },
  ];

  return (
    <div className="w-full">
      {/* Label & Status Indikator */}
      <div className="grid grid-cols-3 gap-2 mb-2 text-center">
        {steps.map((s) => {
          const isDone = s.num < activeStep;
          const isCurrent = s.num === activeStep;
          return (
            <div key={s.num} className="flex flex-col items-center">
              <span
                className={`text-xs font-semibold flex items-center gap-1 ${
                  isCurrent
                    ? "text-primary"
                    : isDone
                    ? "text-emerald-700"
                    : "text-secondary"
                }`}
              >
                <span className="material-symbols-outlined !text-sm">
                  {isDone ? "check" : s.icon}
                </span>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bilah h-2 rounded-full dengan 3 segmen sama lebar */}
      <div className="grid grid-cols-3 gap-1.5 h-2 w-full">
        {steps.map((s) => {
          const isFilled = s.num <= activeStep;
          let color = "bg-surface-container-high";
          if (isFilled) {
            if (activeStep === 3) {
              color = "bg-emerald-600";
            } else if (activeStep === 2) {
              color = "bg-amber-500";
            } else {
              color = "bg-red-500";
            }
          }
          return (
            <div
              key={s.num}
              className={`h-2 rounded-full transition-all duration-300 ${color}`}
            />
          );
        })}
      </div>
    </div>
  );
}

