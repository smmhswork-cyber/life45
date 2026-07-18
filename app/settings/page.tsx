"use client";

import { Settings as SettingsIcon } from "lucide-react";

import { ModuleHeader } from "@/components/module-header";
import { AccountSection } from "@/app/settings/_components/account-section";
import { HabitsEditor } from "@/app/settings/_components/habits-editor";
import { PeriodsEditor } from "@/app/settings/_components/periods-editor";

export default function SettingsPage() {
  return (
    <div className="space-y-10">
      <ModuleHeader
        icon={SettingsIcon}
        title="Settings"
        description="Tune what Life45 tracks for you. Up to 20 habits, as many class periods as you need, and your Google account."
      />

      <HabitsEditor />
      <PeriodsEditor />
      <AccountSection />
    </div>
  );
}
