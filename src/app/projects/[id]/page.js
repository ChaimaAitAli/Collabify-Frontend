"use client";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProjectTab from "@/components/ProjectTab";

export default function ProjectPage() {
  const params = useParams();
  const projectId = parseInt(params.id);

  // You'll want to fetch this data from your API/database
  const projects = [
    {
      id: 1,
      name: "Website Redesign",
      description:
        "Comprehensive redesign of the company website focusing on improved UX and mobile responsiveness.",
    },
    {
      id: 2,
      name: "Mobile App",
      description:
        "Development of a cross-platform mobile application for our core services.",
    },
    {
      id: 3,
      name: "Marketing Campaign",
      description:
        "Q2 marketing campaign focusing on social media engagement and brand awareness.",
    },
  ];

  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <DashboardLayout activeTab={`project-${projectId}`}>
        <div className="container-fluid py-4">
          <div className="alert alert-warning">Project not found</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab={`project-${projectId}`}>
      <ProjectTab project={project} />
    </DashboardLayout>
  );
}
