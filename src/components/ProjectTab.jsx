import React, { useState } from "react";
import Image from "next/image";

// Mock LetterAvatar component for display
const LetterAvatar = ({ name, size = "sm" }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2);
  const colors = ["#774dd3", "#e91e63", "#00bcd4", "#4caf50", "#ff9800"];
  const colorIndex = name.length % colors.length;

  return (
    <div
      className={`d-flex align-items-center justify-content-center rounded-circle text-white fw-bold ${
        size === "sm" ? "me-2" : ""
      }`}
      style={{
        backgroundColor: colors[colorIndex],
        width: size === "sm" ? "32px" : "40px",
        height: size === "sm" ? "32px" : "40px",
        fontSize: size === "sm" ? "12px" : "14px",
      }}
    >
      {initials}
    </div>
  );
};

// Custom styles for brand color
const styles = {
  brandColor: "#774dd3",
  brandLight: "#9b7ee2",
  brandGradient: "linear-gradient(310deg, #774dd3, #9b7ee2)",
  cardHeaderGradient: "linear-gradient(195deg, #774dd3, #673ab7)",
};

const ProjectTab = ({
  project = {
    name: "Website Redesign",
    description:
      "Comprehensive redesign of the company website focusing on improved UX and mobile responsiveness.",
  },
}) => {
  const [activeTab, setActiveTab] = useState("tasks");
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({
    assignee: "",
    customAssignee: "",
  });

  // 2. Add these new functions after the existing functions:
  const handleEditTask = (task) => {
    setEditingTask(task);
    setEditForm({
      assignee: task.assignee.name,
      customAssignee: "",
    });
    setShowEditModal(true);
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    }
  };

  const handleSaveEdit = () => {
    if (!editForm.assignee.trim()) {
      alert("Assignee is required");
      return;
    }

    const assigneeName =
      editForm.assignee === "custom"
        ? editForm.customAssignee
        : editForm.assignee;
    if (!assigneeName.trim()) {
      alert("Assignee is required");
      return;
    }

    // Find or create assignee
    let assignee;
    const existingAssignee = availableAssignees.find(
      (a) => a.name === assigneeName
    );

    if (existingAssignee) {
      assignee = existingAssignee;
    } else {
      // Create new assignee with generated email
      assignee = {
        name: assigneeName,
        email: `${assigneeName.toLowerCase().replace(" ", ".")}@company.com`,
      };
    }

    // Update the task
    setTasks((prev) =>
      prev.map((task) =>
        task.id === editingTask.id ? { ...task, assignee: assignee } : task
      )
    );

    closeEditModal();
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingTask(null);
    setEditForm({
      assignee: "",
      customAssignee: "",
    });
  };

  const [draggedTask, setDraggedTask] = useState(null);

  const handleEditFormChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Form state
  const [taskForm, setTaskForm] = useState({
    name: "",
    description: "",
    assignee: "",
    customAssignee: "",
    priority: "Medium",
    dueDate: "",
  });

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
    // Add some visual feedback
    e.currentTarget.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = "1";
    setDraggedTask(null);
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === draggedTask.id ? { ...task, status: newStatus } : task
        )
      );
    }
    setDraggedTask(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Available assignees
  const availableAssignees = [
    { name: "John Michael", email: "john@creative-tim.com" },
    { name: "Alexa Liras", email: "alexa@creative-tim.com" },
    { name: "Laurent Perrier", email: "laurent@creative-tim.com" },
    { name: "Michael Johnson", email: "michael@creative-tim.com" },
    { name: "Sarah Wilson", email: "sarah@creative-tim.com" },
  ];

  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: "Design new dashboard",
      description: "Create a modern and intuitive dashboard design",
      assignee: {
        name: "John Michael",
        email: "john@creative-tim.com",
        avatar: "../assets/img/team-2.jpg",
      },
      function: "UI/UX Design",
      details: "Design",
      status: "In Progress",
      dueDate: "2025-06-01",
      createdAt: "2025-05-15",
      priority: "High",
    },
    {
      id: 2,
      name: "Fix navigation issues",
      description: "Resolve navigation bugs and improve user flow",
      assignee: {
        name: "Alexa Liras",
        email: "alexa@creative-tim.com",
        avatar: "../assets/img/team-3.jpg",
      },
      function: "Frontend Dev",
      details: "Development",
      status: "To Do",
      dueDate: "2025-05-30",
      createdAt: "2025-05-10",
      priority: "Medium",
    },
    {
      id: 3,
      name: "API integration",
      description: "Integrate third-party APIs for data synchronization",
      assignee: {
        name: "Laurent Perrier",
        email: "laurent@creative-tim.com",
        avatar: "../assets/img/team-1.jpg",
      },
      function: "Backend Dev",
      details: "Development",
      status: "Done",
      dueDate: "2025-05-18",
      createdAt: "2025-05-01",
      priority: "Low",
    },
  ]);

  // Filter tasks based on search query
  const getFilteredTasks = () => {
    let filtered = [...tasks];

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.name.toLowerCase().includes(query) ||
          task.assignee.name.toLowerCase().includes(query) ||
          task.status.toLowerCase().includes(query) ||
          task.function.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const handleFormChange = (field, value) => {
    setTaskForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddTask = () => {
    // Validation
    if (!taskForm.name.trim()) {
      alert("Task name is required");
      return;
    }

    const assigneeName =
      taskForm.assignee === "custom"
        ? taskForm.customAssignee
        : taskForm.assignee;
    if (!assigneeName.trim()) {
      alert("Assignee is required");
      return;
    }

    // Find or create assignee
    let assignee;
    const existingAssignee = availableAssignees.find(
      (a) => a.name === assigneeName
    );

    if (existingAssignee) {
      assignee = existingAssignee;
    } else {
      // Create new assignee with generated email
      assignee = {
        name: assigneeName,
        email: `${assigneeName.toLowerCase().replace(" ", ".")}@company.com`,
      };
    }

    // Create new task
    const newTask = {
      id: tasks.length + 1,
      name: taskForm.name,
      description: taskForm.description || "No description provided",
      assignee: assignee,
      function: "General",
      details: "Task",
      status: "To Do",
      dueDate:
        taskForm.dueDate ||
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      createdAt: new Date().toISOString().split("T")[0],
      priority: taskForm.priority,
    };

    // Add task to list
    setTasks((prev) => [...prev, newTask]);

    // Reset form and close modal
    setTaskForm({
      name: "",
      description: "",
      assignee: "",
      customAssignee: "",
      priority: "Medium",
      dueDate: "",
    });
    setShowAddTaskModal(false);
  };

  const closeModal = () => {
    setShowAddTaskModal(false);
    setTaskForm({
      name: "",
      description: "",
      assignee: "",
      customAssignee: "",
      priority: "Medium",
      dueDate: "",
    });
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "High":
        return (
          <span
            className="badge text-white ms-2"
            style={{
              backgroundColor: "#ea4e3d",
              opacity: "0.6",
              fontSize: "0.7rem",
            }}
          >
            High
          </span>
        );
      case "Medium":
        return (
          <span
            className="badge text-white ms-2"
            style={{
              backgroundColor: "#f19937",
              opacity: "0.6",
              fontSize: "0.7rem",
            }}
          >
            Medium
          </span>
        );
      case "Low":
        return (
          <span
            className="badge text-white ms-2"
            style={{
              backgroundColor: "#67c23a",
              opacity: "0.6",
              fontSize: "0.7rem",
            }}
          >
            Low
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="container-fluid py-4 px-5">
        <div className="row">
          <div className="col-12">
            <div className="card card-background card-background-after-none align-items-start mt-4 mb-3">
              <div
                className="full-background"
                style={{ backgroundImage: "url('/header-blue-purple.jpg')" }}
              ></div>
              <div className="card-body text-start p-4 w-100">
                <h3 className="text-white mb-2">{project.name}</h3>
                <p className="mb-4 font-weight-semibold text-white">
                  {project.description}
                </p>
              </div>
            </div>
            <div className="card shadow-lg">
              <div className="card-body">
                {/* Navigation Tabs */}
                <div className="nav-wrapper position-relative mb-4 mt-3">
                  <ul
                    className="nav nav-pills nav-fill p-1"
                    role="tablist"
                    style={{
                      background: "#f8f9fa",
                      borderRadius: "0.75rem",
                    }}
                  >
                    <li className="nav-item">
                      <a
                        className={`nav-link ${
                          activeTab === "tasks" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("tasks")}
                        role="tab"
                        href="#"
                        style={
                          activeTab === "tasks"
                            ? {
                                background: styles.brandGradient,
                                color: "white",
                                borderRadius: "0.5rem",
                              }
                            : {}
                        }
                      >
                        <i className="fas fa-tasks me-2"></i>Tasks
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        className={`nav-link ${
                          activeTab === "board" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("board")}
                        role="tab"
                        href="#"
                        style={
                          activeTab === "board"
                            ? {
                                background: styles.brandGradient,
                                color: "white",
                                borderRadius: "0.5rem",
                              }
                            : {}
                        }
                      >
                        <i className="fas fa-columns me-2"></i>Board
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        className={`nav-link ${
                          activeTab === "summary" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("summary")}
                        role="tab"
                        href="#"
                        style={
                          activeTab === "summary"
                            ? {
                                background: styles.brandGradient,
                                color: "white",
                                borderRadius: "0.5rem",
                              }
                            : {}
                        }
                      >
                        <i className="fas fa-chart-pie me-2"></i>Summary
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Content Area */}
                {activeTab === "tasks" && (
                  <div className="card border shadow-xs mb-4">
                    <div className="card-body px-0 py-0">
                      <div className="border-bottom py-3 px-3 d-sm-flex align-items-center">
                        <div className="input-group w-sm-25 me-auto mt-3 mt-sm-0">
                          <span className="input-group-text text-body">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16px"
                              height="16px"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                              ></path>
                            </svg>
                          </span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>

                        {/* Create Task Button */}
                        <button
                          type="button"
                          className="btn btn-dark btn-sm d-flex align-items-center me-2 shadow-sm"
                          style={{
                            border: "none",
                            color: "white",
                            borderRadius: "0.5rem",
                            padding: "0.5rem 1rem",
                            transition: "all 0.3s ease",
                          }}
                          onClick={() => setShowAddTaskModal(true)}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-1px)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 15px rgba(119, 77, 211, 0.3)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow =
                              "0 2px 10px rgba(0,0,0,0.1)";
                          }}
                        >
                          <span className="btn-inner--icon">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="white"
                              className="bi bi-plus-lg"
                              viewBox="0 0 16 16"
                              style={{ marginRight: "5px" }}
                            >
                              <path
                                fillRule="evenodd"
                                d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"
                              />
                            </svg>
                          </span>
                          <span className="btn-inner--text">Add Task</span>
                        </button>
                      </div>
                      <div className="table-responsive p-0">
                        <table className="table align-items-center mb-0">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="text-secondary text-xs font-weight-semibold opacity-7">
                                Task
                              </th>
                              <th className="text-secondary text-xs font-weight-semibold opacity-7 ps-2">
                                Assigned To
                              </th>
                              <th className="text-center text-secondary text-xs font-weight-semibold opacity-7">
                                Status
                              </th>
                              <th className="text-center text-secondary text-xs font-weight-semibold opacity-7">
                                Due Date
                              </th>
                              <th className="text-secondary opacity-7"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {getFilteredTasks().map((task) => (
                              <tr key={task.id}>
                                <td>
                                  <div className="d-flex px-2 py-1">
                                    <div className="d-flex flex-column justify-content-center">
                                      <div
                                        className="d-flex align-items-center mb-0"
                                        style={{ minWidth: 0 }}
                                      >
                                        <h6
                                          className="mb-0 text-sm font-weight-semibold text-truncate"
                                          style={{
                                            minWidth: 0,
                                            flex: "1 1 auto",
                                          }}
                                        >
                                          {task.name}
                                        </h6>
                                        <div
                                          className="ms-2"
                                          style={{ flexShrink: 0 }}
                                        >
                                          {getPriorityBadge(task.priority)}
                                        </div>
                                      </div>
                                      <p className="text-sm text-secondary mb-0">
                                        {task.function}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div className="d-flex px-2 py-1">
                                    <div className="d-flex align-items-center">
                                      <LetterAvatar
                                        name={task.assignee.name}
                                        size="sm"
                                      />
                                    </div>
                                    <div className="d-flex flex-column justify-content-center ms-1">
                                      <h6 className="mb-0 text-sm font-weight-semibold">
                                        {task.assignee.name}
                                      </h6>
                                      <p className="text-sm text-secondary mb-0">
                                        {task.assignee.email}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="align-middle text-center text-sm">
                                  <span
                                    className={`badge badge-sm border ${
                                      task.status === "Done"
                                        ? "border-success text-success bg-success"
                                        : task.status === "In Progress"
                                        ? "border-info text-info bg-info"
                                        : "border-warning text-warning bg-warning"
                                    }`}
                                  >
                                    {task.status}
                                  </span>
                                </td>
                                <td className="align-middle text-center">
                                  <span className="text-secondary text-sm font-weight-normal">
                                    {task.dueDate}
                                  </span>
                                </td>
                                <td className="align-middle">
                                  <div className="d-flex gap-2">
                                    <a
                                      href="#"
                                      className="text-secondary font-weight-bold text-xs"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleEditTask(task);
                                      }}
                                      style={{ cursor: "pointer" }}
                                      title="Edit task"
                                    >
                                      <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 15 16"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M11.2201 2.02495C10.8292 1.63482 10.196 1.63545 9.80585 2.02636C9.41572 2.41727 9.41635 3.05044 9.80726 3.44057L11.2201 2.02495ZM12.5572 6.18502C12.9481 6.57516 13.5813 6.57453 13.9714 6.18362C14.3615 5.79271 14.3609 5.15954 13.97 4.7694L12.5572 6.18502ZM11.6803 1.56839L12.3867 2.2762L12.3867 2.27619L11.6803 1.56839ZM14.4302 4.31284L15.1367 5.02065L15.1367 5.02064L14.4302 4.31284ZM3.72198 15V16C3.98686 16 4.24091 15.8949 4.42839 15.7078L3.72198 15ZM0.999756 15H-0.000244141C-0.000244141 15.5523 0.447471 16 0.999756 16L0.999756 15ZM0.999756 12.2279L0.293346 11.5201C0.105383 11.7077 -0.000244141 11.9624 -0.000244141 12.2279H0.999756ZM9.80726 3.44057L12.5572 6.18502L13.97 4.7694L11.2201 2.02495L9.80726 3.44057ZM12.3867 2.27619C12.7557 1.90794 13.3549 1.90794 13.7238 2.27619L15.1367 0.860593C13.9869 -0.286864 12.1236 -0.286864 10.9739 0.860593L12.3867 2.27619ZM13.7238 2.27619C14.0917 2.64337 14.0917 3.23787 13.7238 3.60504L15.1367 5.02064C16.2875 3.8721 16.2875 2.00913 15.1367 0.860593L13.7238 2.27619ZM13.7238 3.60504L3.01557 14.2922L4.42839 15.7078L15.1367 5.02065L13.7238 3.60504ZM3.72198 14H0.999756V16H3.72198V14ZM1.99976 15V12.2279H-0.000244141V15H1.99976ZM1.70617 12.9357L12.3867 2.2762L10.9739 0.86059L0.293346 11.5201L1.70617 12.9357Z"
                                          fill="#64748B"
                                        />
                                      </svg>
                                    </a>
                                    <a
                                      href="#"
                                      className="text-danger font-weight-bold text-xs"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleDeleteTask(task.id);
                                      }}
                                      style={{ cursor: "pointer" }}
                                      title="Delete task"
                                    >
                                      <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6"
                                          stroke="#dc3545"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    </a>
                                  </div>
                                </td>
                              </tr>
                            ))}

                            {getFilteredTasks().length === 0 && (
                              <tr>
                                <td colSpan="5" className="text-center py-4">
                                  <p className="text-sm mb-0">
                                    No tasks found matching your criteria.
                                  </p>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "board" && (
                  <div className="card border shadow-xs p-3">
                    <div className="row g-3">
                      {/* To Do Column */}
                      <div className="col-lg-4 col-md-6">
                        <div
                          className="card border-0 shadow-sm h-100"
                          style={{ backgroundColor: "#faf7ff" }}
                        >
                          <div
                            className="card-header border-0 pb-0"
                            style={{
                              background:
                                "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                              borderRadius: "0.75rem 0.75rem 0 0",
                            }}
                          >
                            <div className="d-flex align-items-center justify-content-between">
                              <h6 className="text-white mb-0 fw-bold">
                                <i className="fas fa-clipboard-list me-2"></i>
                                To Do
                              </h6>
                              <span
                                className="badge bg-white text-dark fw-bold"
                                style={{ fontSize: "0.75rem" }}
                              >
                                {
                                  tasks.filter(
                                    (task) => task.status === "To Do"
                                  ).length
                                }
                              </span>
                            </div>
                          </div>
                          <div
                            className="card-body p-3"
                            style={{
                              minHeight: "400px",
                              backgroundColor: "#faf7ff",
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDrop(e, "To Do")}
                          >
                            {tasks
                              .filter((task) => task.status === "To Do")
                              .map((task) => (
                                <div
                                  key={task.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, task)}
                                  className="card mb-3 shadow-sm border-0"
                                  style={{
                                    cursor: "grab",
                                    transition: "all 0.2s ease",
                                    borderLeft: "4px solid #8b5cf6",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform =
                                      "translateY(-2px)";
                                    e.currentTarget.style.boxShadow =
                                      "0 4px 15px rgba(139, 92, 246, 0.15)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform =
                                      "translateY(0)";
                                    e.currentTarget.style.boxShadow =
                                      "0 1px 3px rgba(0,0,0,0.1)";
                                  }}
                                >
                                  <div className="card-body p-3">
                                    <h6 className="mb-2 fw-semibold text-dark">
                                      {task.name}
                                      {getPriorityBadge(task.priority)}
                                    </h6>
                                    <div className="d-flex align-items-center justify-content-between">
                                      <div className="d-flex align-items-center">
                                        <LetterAvatar
                                          name={task.assignee.name}
                                          size="sm"
                                        />
                                        <div className="ms-2">
                                          <small className="text-dark fw-semibold d-block">
                                            {task.assignee.name}
                                          </small>
                                          <small className="text-muted">
                                            {task.function}
                                          </small>
                                        </div>
                                      </div>
                                      <small className="text-muted">
                                        {task.dueDate}
                                      </small>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            {tasks.filter((task) => task.status === "To Do")
                              .length === 0 && (
                              <div
                                className="text-center py-5"
                                style={{
                                  border: "2px dashed #c4b5fd",
                                  borderRadius: "0.5rem",
                                  backgroundColor: "white",
                                }}
                              >
                                <i
                                  className="fas fa-clipboard-list text-muted mb-2"
                                  style={{
                                    fontSize: "2rem",
                                    color: "#a78bfa !important",
                                  }}
                                ></i>
                                <p className="text-muted mb-0">
                                  No tasks to do
                                </p>
                                <small className="text-muted">
                                  Drag tasks here
                                </small>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* In Progress Column */}
                      <div className="col-lg-4 col-md-6">
                        <div
                          className="card border-0 shadow-sm h-100"
                          style={{ backgroundColor: "#fff3cd" }}
                        >
                          <div
                            className="card-header border-0 pb-0"
                            style={{
                              background:
                                "linear-gradient(135deg, #ffc107, #e0a800)",
                              borderRadius: "0.75rem 0.75rem 0 0",
                            }}
                          >
                            <div className="d-flex align-items-center justify-content-between">
                              <h6 className="text-white mb-0 fw-bold">
                                <i className="fas fa-spinner me-2"></i>
                                In Progress
                              </h6>
                              <span
                                className="badge bg-white text-dark fw-bold"
                                style={{ fontSize: "0.75rem" }}
                              >
                                {
                                  tasks.filter(
                                    (task) => task.status === "In Progress"
                                  ).length
                                }
                              </span>
                            </div>
                          </div>
                          <div
                            className="card-body p-3"
                            style={{
                              minHeight: "400px",
                              backgroundColor: "#fff3cd",
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDrop(e, "In Progress")}
                          >
                            {tasks
                              .filter((task) => task.status === "In Progress")
                              .map((task) => (
                                <div
                                  key={task.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, task)}
                                  className="card mb-3 shadow-sm border-0"
                                  style={{
                                    cursor: "grab",
                                    transition: "all 0.2s ease",
                                    borderLeft: "4px solid #ffc107",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform =
                                      "translateY(-2px)";
                                    e.currentTarget.style.boxShadow =
                                      "0 4px 15px rgba(0,0,0,0.1)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform =
                                      "translateY(0)";
                                    e.currentTarget.style.boxShadow =
                                      "0 1px 3px rgba(0,0,0,0.1)";
                                  }}
                                >
                                  <div className="card-body p-3">
                                    <h6 className="mb-2 fw-semibold text-dark">
                                      {task.name}
                                      {getPriorityBadge(task.priority)}
                                    </h6>
                                    <div className="d-flex align-items-center justify-content-between">
                                      <div className="d-flex align-items-center">
                                        <LetterAvatar
                                          name={task.assignee.name}
                                          size="sm"
                                        />
                                        <div className="ms-2">
                                          <small className="text-dark fw-semibold d-block">
                                            {task.assignee.name}
                                          </small>
                                          <small className="text-muted">
                                            {task.function}
                                          </small>
                                        </div>
                                      </div>
                                      <small className="text-muted">
                                        {task.dueDate}
                                      </small>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            {tasks.filter(
                              (task) => task.status === "In Progress"
                            ).length === 0 && (
                              <div
                                className="text-center py-5"
                                style={{
                                  border: "2px dashed #ffc107",
                                  borderRadius: "0.5rem",
                                  backgroundColor: "white",
                                }}
                              >
                                <i
                                  className="fas fa-spinner text-warning mb-2"
                                  style={{ fontSize: "2rem" }}
                                ></i>
                                <p className="text-muted mb-0">
                                  No tasks in progress
                                </p>
                                <small className="text-muted">
                                  Drag tasks here
                                </small>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Done Column */}
                      <div className="col-lg-4 col-md-12">
                        <div
                          className="card border-0 shadow-sm h-100"
                          style={{ backgroundColor: "#d1e7dd" }}
                        >
                          <div
                            className="card-header border-0 pb-0"
                            style={{
                              background:
                                "linear-gradient(135deg, #198754, #146c43)",
                              borderRadius: "0.75rem 0.75rem 0 0",
                            }}
                          >
                            <div className="d-flex align-items-center justify-content-between">
                              <h6 className="text-white mb-0 fw-bold">
                                <i className="fas fa-check-circle me-2"></i>
                                Done
                              </h6>
                              <span
                                className="badge bg-white text-dark fw-bold"
                                style={{ fontSize: "0.75rem" }}
                              >
                                {
                                  tasks.filter((task) => task.status === "Done")
                                    .length
                                }
                              </span>
                            </div>
                          </div>
                          <div
                            className="card-body p-3"
                            style={{
                              minHeight: "400px",
                              backgroundColor: "#d1e7dd",
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDrop(e, "Done")}
                          >
                            {tasks
                              .filter((task) => task.status === "Done")
                              .map((task) => (
                                <div
                                  key={task.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, task)}
                                  className="card mb-3 shadow-sm border-0"
                                  style={{
                                    cursor: "grab",
                                    transition: "all 0.2s ease",
                                    borderLeft: "4px solid #198754",
                                    opacity: "0.9",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform =
                                      "translateY(-2px)";
                                    e.currentTarget.style.boxShadow =
                                      "0 4px 15px rgba(0,0,0,0.1)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform =
                                      "translateY(0)";
                                    e.currentTarget.style.boxShadow =
                                      "0 1px 3px rgba(0,0,0,0.1)";
                                  }}
                                >
                                  <div className="card-body p-3">
                                    <h6 className="mb-2 fw-semibold text-dark">
                                      {task.name}
                                      {getPriorityBadge(task.priority)}
                                    </h6>
                                    <div className="d-flex align-items-center justify-content-between">
                                      <div className="d-flex align-items-center">
                                        <LetterAvatar
                                          name={task.assignee.name}
                                          size="sm"
                                        />
                                        <div className="ms-2">
                                          <small className="text-dark fw-semibold d-block">
                                            {task.assignee.name}
                                          </small>
                                          <small className="text-muted">
                                            {task.function}
                                          </small>
                                        </div>
                                      </div>
                                      <small className="text-muted">
                                        {task.dueDate}
                                      </small>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            {tasks.filter((task) => task.status === "Done")
                              .length === 0 && (
                              <div
                                className="text-center py-5"
                                style={{
                                  border: "2px dashed #198754",
                                  borderRadius: "0.5rem",
                                  backgroundColor: "white",
                                }}
                              >
                                <i
                                  className="fas fa-check-circle text-success mb-2"
                                  style={{ fontSize: "2rem" }}
                                ></i>
                                <p className="text-muted mb-0">
                                  No completed tasks
                                </p>
                                <small className="text-muted">
                                  Drag tasks here
                                </small>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "summary" && (
                  <div className="card border shadow-xs p-3">
                    <h6 className="mb-4">Project Summary</h6>
                    <p className="text-muted">
                      This section will contain reports and graphs showing
                      project progress statistics.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
            zIndex: 1050,
            animation: "fadeIn 0.3s ease-out",
          }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div
            className="card shadow-lg border-0"
            style={{
              width: "90%",
              maxWidth: "500px",
              borderRadius: "1rem",
              animation: "slideIn 0.3s ease-out",
              transform: "translateY(0)",
            }}
          >
            <div
              className="card-header text-white border-0 d-flex justify-content-between align-items-center"
              style={{
                background: styles.brandGradient,
                borderRadius: "1rem 1rem 0 0",
                padding: "1.5rem",
              }}
            >
              <div>
                <h5 className="mb-0 text-white fw-bold">Create New Task</h5>
                <small className="text-white opacity-8">
                  Add a new task to your project
                </small>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={closeModal}
                style={{
                  filter: "brightness(0) invert(1)",
                  opacity: 0.8,
                }}
              ></button>
            </div>

            <div className="card-body p-4">
              <form>
                {/* Task Name */}
                <div className="mb-3">
                  <label
                    htmlFor="taskName"
                    className="form-label text-dark fw-semibold"
                  >
                    Task Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control border-2"
                    id="taskName"
                    placeholder="Enter task name..."
                    value={taskForm.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    style={{
                      borderRadius: "0.5rem",
                      padding: "0.75rem",
                      borderColor: "#e9ecef",
                      fontSize: "0.95rem",
                    }}
                  />
                </div>

                {/* Task Description */}
                <div className="mb-3">
                  <label
                    htmlFor="taskDescription"
                    className="form-label text-dark fw-semibold"
                  >
                    Description
                  </label>
                  <textarea
                    className="form-control border-2"
                    id="taskDescription"
                    rows="3"
                    placeholder="Describe the task (optional)..."
                    value={taskForm.description}
                    onChange={(e) =>
                      handleFormChange("description", e.target.value)
                    }
                    style={{
                      borderRadius: "0.5rem",
                      padding: "0.75rem",
                      borderColor: "#e9ecef",
                      fontSize: "0.95rem",
                      resize: "vertical",
                    }}
                  ></textarea>
                </div>

                {/* Assignee Selection */}
                <div className="mb-3">
                  <label
                    htmlFor="taskAssignee"
                    className="form-label text-dark fw-semibold"
                  >
                    Assignee <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select border-2"
                    id="taskAssignee"
                    value={taskForm.assignee}
                    onChange={(e) =>
                      handleFormChange("assignee", e.target.value)
                    }
                    style={{
                      borderRadius: "0.5rem",
                      padding: "0.75rem",
                      borderColor: "#e9ecef",
                      fontSize: "0.95rem",
                    }}
                  >
                    <option value="">Select an assignee...</option>
                    {availableAssignees.map((assignee, index) => (
                      <option key={index} value={assignee.name}>
                        {assignee.name} ({assignee.email})
                      </option>
                    ))}
                    <option value="custom">+ Add new assignee</option>
                  </select>
                </div>

                {/* Custom Assignee Input */}
                {taskForm.assignee === "custom" && (
                  <div className="mb-3">
                    <label
                      htmlFor="customAssignee"
                      className="form-label text-dark fw-semibold"
                    >
                      New Assignee Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control border-2"
                      id="customAssignee"
                      placeholder="Enter assignee name..."
                      value={taskForm.customAssignee}
                      onChange={(e) =>
                        handleFormChange("customAssignee", e.target.value)
                      }
                      style={{
                        borderRadius: "0.5rem",
                        padding: "0.75rem",
                        borderColor: "#e9ecef",
                        fontSize: "0.95rem",
                      }}
                    />
                  </div>
                )}

                {/* Priority and Due Date Row */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label
                      htmlFor="taskPriority"
                      className="form-label text-dark fw-semibold"
                    >
                      Priority
                    </label>
                    <select
                      className="form-select border-2"
                      id="taskPriority"
                      value={taskForm.priority}
                      onChange={(e) =>
                        handleFormChange("priority", e.target.value)
                      }
                      style={{
                        borderRadius: "0.5rem",
                        padding: "0.75rem",
                        borderColor: "#e9ecef",
                        fontSize: "0.95rem",
                      }}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label
                      htmlFor="taskDueDate"
                      className="form-label text-dark fw-semibold"
                    >
                      Due Date
                    </label>
                    <input
                      type="date"
                      className="form-control border-2"
                      id="taskDueDate"
                      value={taskForm.dueDate}
                      onChange={(e) =>
                        handleFormChange("dueDate", e.target.value)
                      }
                      style={{
                        borderRadius: "0.5rem",
                        padding: "0.75rem",
                        borderColor: "#e9ecef",
                        fontSize: "0.95rem",
                      }}
                    />
                  </div>
                </div>
              </form>
            </div>

            <div
              className="card-footer bg-light border-0 d-flex justify-content-end gap-2"
              style={{ borderRadius: "0 0 1rem 1rem", padding: "1.5rem" }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeModal}
                style={{
                  borderRadius: "0.5rem",
                  padding: "0.6rem 1.5rem",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn text-white shadow-sm"
                onClick={handleAddTask}
                disabled={
                  !taskForm.name.trim() ||
                  !taskForm.assignee ||
                  (taskForm.assignee === "custom" &&
                    !taskForm.customAssignee.trim())
                }
                style={{
                  background: styles.brandGradient,
                  border: "none",
                  borderRadius: "0.5rem",
                  padding: "0.6rem 1.5rem",
                  fontWeight: "500",
                  opacity:
                    !taskForm.name.trim() ||
                    !taskForm.assignee ||
                    (taskForm.assignee === "custom" &&
                      !taskForm.customAssignee.trim())
                      ? 0.6
                      : 1,
                  cursor:
                    !taskForm.name.trim() ||
                    !taskForm.assignee ||
                    (taskForm.assignee === "custom" &&
                      !taskForm.customAssignee.trim())
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                <i className="fas fa-plus me-2"></i>
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditModal && editingTask && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
            zIndex: 1050,
            animation: "fadeIn 0.3s ease-out",
          }}
          onClick={(e) => e.target === e.currentTarget && closeEditModal()}
        >
          <div
            className="card shadow-lg border-0"
            style={{
              width: "90%",
              maxWidth: "500px",
              borderRadius: "1rem",
              animation: "slideIn 0.3s ease-out",
              transform: "translateY(0)",
            }}
          >
            <div
              className="card-header text-white border-0 d-flex justify-content-between align-items-center"
              style={{
                background: styles.brandGradient,
                borderRadius: "1rem 1rem 0 0",
                padding: "1.5rem",
              }}
            >
              <div>
                <h5 className="mb-0 text-white fw-bold">Edit Task</h5>
                <small className="text-white opacity-8">
                  Change assignee for "{editingTask.name}"
                </small>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={closeEditModal}
                style={{
                  filter: "brightness(0) invert(1)",
                  opacity: 0.8,
                }}
              ></button>
            </div>

            <div className="card-body p-4">
              <form>
                {/* Current Task Info */}
                <div className="mb-4 p-3 bg-light rounded">
                  <h6 className="mb-2 text-dark fw-semibold">
                    {editingTask.name}
                  </h6>
                  <p className="text-muted mb-0 small">
                    {editingTask.description}
                  </p>
                </div>

                {/* Assignee Selection */}
                <div className="mb-3">
                  <label
                    htmlFor="editTaskAssignee"
                    className="form-label text-dark fw-semibold"
                  >
                    New Assignee <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select border-2"
                    id="editTaskAssignee"
                    value={editForm.assignee}
                    onChange={(e) =>
                      handleEditFormChange("assignee", e.target.value)
                    }
                    style={{
                      borderRadius: "0.5rem",
                      padding: "0.75rem",
                      borderColor: "#e9ecef",
                      fontSize: "0.95rem",
                    }}
                  >
                    <option value="">Select an assignee...</option>
                    {availableAssignees.map((assignee, index) => (
                      <option key={index} value={assignee.name}>
                        {assignee.name} ({assignee.email})
                      </option>
                    ))}
                    <option value="custom">+ Add new assignee</option>
                  </select>
                </div>

                {/* Custom Assignee Input */}
                {editForm.assignee === "custom" && (
                  <div className="mb-3">
                    <label
                      htmlFor="editCustomAssignee"
                      className="form-label text-dark fw-semibold"
                    >
                      New Assignee Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control border-2"
                      id="editCustomAssignee"
                      placeholder="Enter assignee name..."
                      value={editForm.customAssignee}
                      onChange={(e) =>
                        handleEditFormChange("customAssignee", e.target.value)
                      }
                      style={{
                        borderRadius: "0.5rem",
                        padding: "0.75rem",
                        borderColor: "#e9ecef",
                        fontSize: "0.95rem",
                      }}
                    />
                  </div>
                )}
              </form>
            </div>

            <div
              className="card-footer bg-light border-0 d-flex justify-content-end gap-2"
              style={{ borderRadius: "0 0 1rem 1rem", padding: "1.5rem" }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeEditModal}
                style={{
                  borderRadius: "0.5rem",
                  padding: "0.6rem 1.5rem",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn text-white shadow-sm"
                onClick={handleSaveEdit}
                disabled={
                  !editForm.assignee ||
                  (editForm.assignee === "custom" &&
                    !editForm.customAssignee.trim())
                }
                style={{
                  background: styles.brandGradient,
                  border: "none",
                  borderRadius: "0.5rem",
                  padding: "0.6rem 1.5rem",
                  fontWeight: "500",
                  opacity:
                    !editForm.assignee ||
                    (editForm.assignee === "custom" &&
                      !editForm.customAssignee.trim())
                      ? 0.6
                      : 1,
                  cursor:
                    !editForm.assignee ||
                    (editForm.assignee === "custom" &&
                      !editForm.customAssignee.trim())
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                <i className="fas fa-save me-2"></i>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .form-control:focus,
        .form-select:focus {
          border-color: ${styles.brandColor} !important;
          box-shadow: 0 0 0 0.25rem rgba(119, 77, 211, 0.25) !important;
        }

        .btn:hover {
          transform: translateY(-1px);
          transition: all 0.2s ease;
        }

        .btn:disabled:hover {
          transform: none;
        }
      `}</style>
    </>
  );
};

export default ProjectTab;
