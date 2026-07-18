"use client";

import { BookOpen } from "lucide-react";

import { ModuleHeader } from "@/components/module-header";
import { AssignmentsWorkspace } from "@/app/assignments/_components/assignments-workspace";

export default function AssignmentsPage() {
  return (
    <div className="space-y-8">
      <ModuleHeader
        icon={BookOpen}
        title="Assignments"
        description="Classwork or tasks. Tag each one with a class period from Settings, then filter the list by any tag below."
      />

      <AssignmentsWorkspace />
    </div>
  );
}
