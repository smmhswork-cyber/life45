"use client";

import { LineChart } from "lucide-react";

import { ModuleHeader } from "@/components/module-header";
import { HabitsWorkspace } from "@/app/habits/_components/habits-workspace";

export default function HabitsPage() {
  return (
    <div className="space-y-8">
      <ModuleHeader
        icon={LineChart}
        title="Habits"
        description="Small, recurring behaviors that compound. Switch between week, month, and year views, and watch the trend line below the grid."
      />

      <HabitsWorkspace />
    </div>
  );
}
