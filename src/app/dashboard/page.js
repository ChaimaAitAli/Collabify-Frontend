"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardTab from "@/components/DashboardTab";

export default function Dashboard() {
  const user = { firstName: "Noah" };

  return (
    <DashboardLayout activeTab="dashboard">
      <DashboardTab user={user} />
    </DashboardLayout>
  );
}
