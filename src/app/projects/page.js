"use client";
import Link from "next/link";
import Image from "next/image";
import "@/assets/css/nucleo-icons.css";
import "@/assets/css/nucleo-svg.css";
import "@/assets/css/corporate-ui-dashboard.css?v=1.0.0";
import SideBar from "@/components/SideBar";
import Navbar from "@/components/Navbar";
import DashboardTab from "@/components/DashboardTab";
import ProjectTab from "@/components/ProjectTab";
import { useState } from "react";

export default function Projects() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const user = { firstName: "Noah" };

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

  // Find the currently selected project based on the activeTab
  const getSelectedProject = () => {
    if (activeTab.startsWith("project-")) {
      const projectId = parseInt(activeTab.split("-")[1]);
      return projects.find((p) => p.id === projectId);
    }
    return null;
  };

  const renderTab = () => {
    // For regular tabs
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab user={user} />;
      case "projects":
        return (
          <div className="container-fluid py-4">All Projects Overview</div>
        );
      case "reports":
        return <div className="container-fluid py-4">Reports Content</div>;
      case "chat":
        return <div className="container-fluid py-4">Chat Interface</div>;
      case "all-projects":
        return (
          <div className="container-fluid py-4">
            <div className="row">
              {projects.map((project) => (
                <div key={project.id} className="col-md-4 mb-4">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">{project.name}</h5>
                      <p className="card-text text-sm">{project.description}</p>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{
                          backgroundColor: "#774dd3",
                          borderColor: "#774dd3",
                        }}
                        onClick={() => setActiveTab(`project-${project.id}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
    }

    // For project-specific tabs
    if (activeTab.startsWith("project-")) {
      const selectedProject = getSelectedProject();
      return <ProjectTab project={selectedProject} />;
    }

    // Default fallback
    return <DashboardTab user={user} />;
  };

  return (
    <div className="g-sidenav-show bg-gray-100">
      <SideBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg">
        <Navbar activeTab={activeTab} />
        {renderTab()}
      </main>
    </div>
  );
}
