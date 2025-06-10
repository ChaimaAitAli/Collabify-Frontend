import React, { useState, useEffect } from "react";
import getPriorityBadge from "./getPriorityBadge";
import Task from "./Task";
import LetterAvatar from "./LetterAvatar";
import DraggableTask from "./DraggableTask";
import Image from "next/image";
import { taskAPI, projectAPI } from "@/api/api";

// Custom styles for brand color
const styles = {
  brandColor: "#774dd3",
  brandLight: "#9b7ee2",
  brandGradient: "linear-gradient(310deg, #774dd3, #9b7ee2)",
  cardHeaderGradient: "linear-gradient(195deg, #774dd3, #673ab7)",
};

const ProjectTab = ({ project }) => {
  const [activeTab, setActiveTab] = useState("tasks");
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editForm, setEditForm] = useState({
    assignee: "",
    customAssignee: "",
  });

  // Form state
  const [taskForm, setTaskForm] = useState({
    name: "",
    description: "",
    assignee: "",
    customAssignee: "",
    priority: "Medium",
    dueDate: "",
  });
  const getDisplayName = (user) => {
    if (!user) return "Unknown User";

    // Based on your User entity: firstname, lastname, email
    const fullName = `${user.firstname || ""} ${user.lastname || ""}`.trim();

    return fullName || user.email?.split("@")[0] || "Unknown User";
  };
  const [draggedTask, setDraggedTask] = useState(null);

  // Get available assignees from project members and lead
  const getAvailableAssignees = () => {
    if (!project) return [];

    const assignees = [];

    // Add project lead
    if (project.lead) {
      assignees.push({
        id: project.lead.id,
        name:
          project.lead.fullName ||
          project.lead.name ||
          `${project.lead.firstName} ${project.lead.lastName}`,
        email: project.lead.email,
      });
    }

    // Add project members
    if (project.members && project.members.length > 0) {
      project.members.forEach((member) => {
        // Avoid duplicates
        if (!assignees.find((a) => a.id === member.id)) {
          assignees.push({
            id: member.id,
            name:
              member.fullName ||
              member.name ||
              `${member.firstName} ${member.lastName}`,
            email: member.email,
          });
        }
      });
    }

    return assignees;
  };

  const availableAssignees = getAvailableAssignees();

  // Fetch project tasks when component mounts or project changes
  useEffect(() => {
    const fetchTasks = async () => {
      if (!project?.id) return;

      try {
        setLoading(true);
        setError(null);

        const tasksData = await taskAPI.getTasksByProject(project.id);

        // Transform backend task data to match frontend format
        const transformedTasks = tasksData.map((task) => ({
          id: task.id,
          name: task.title,
          description: task.description || "No description provided",
          assignee: task.assignee
            ? {
                id: task.assignee.id,
                name:
                  task.assignee.fullName ||
                  `${task.assignee.firstName} ${task.assignee.lastName}`,
                email: task.assignee.email,
              }
            : null,
          function: "General", // You might want to add this field to your backend
          details: "Task",
          status: task.status,
          dueDate:
            task.dueDate ||
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
          createdAt: task.createdAt
            ? new Date(task.createdAt).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          priority: task.priority || "Medium",
        }));

        setTasks(transformedTasks);
      } catch (err) {
        console.error("Failed to fetch project tasks:", err);
        setError(err.message || "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [project]);

  const handleEditTask = (task) => {
    setEditingTask(task);
    setEditForm({
      assignee: task.assignee?.name || "",
      customAssignee: "",
    });
    setShowEditModal(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await taskAPI.deleteTask(taskId);
        setTasks((prev) => prev.filter((task) => task.id !== taskId));
      } catch (err) {
        console.error("Failed to delete task:", err);
        alert("Failed to delete task. Please try again.");
      }
    }
  };

  const handleSaveEdit = async () => {
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

    try {
      // Find assignee
      let assigneeId = null;
      const existingAssignee = availableAssignees.find(
        (a) => a.name === assigneeName
      );

      if (existingAssignee) {
        assigneeId = existingAssignee.id;
      }

      if (assigneeId) {
        // Update task assignee via API
        await taskAPI.assignUser(editingTask.id, assigneeId);

        // Update local state
        setTasks((prev) =>
          prev.map((task) =>
            task.id === editingTask.id
              ? {
                  ...task,
                  assignee: {
                    id: existingAssignee.id,
                    name: existingAssignee.name,
                    email: existingAssignee.email,
                  },
                }
              : task
          )
        );
      }

      closeEditModal();
    } catch (err) {
      console.error("Failed to update task:", err);
      alert("Failed to update task. Please try again.");
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingTask(null);
    setEditForm({
      assignee: "",
      customAssignee: "",
    });
  };

  const handleEditFormChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = "1";
    setDraggedTask(null);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
      try {
        // Update task status via API
        await taskAPI.updateTaskStatus(
          draggedTask.id,
          newStatus.toUpperCase().replace(" ", "_")
        );

        // Update local state
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === draggedTask.id ? { ...task, status: newStatus } : task
          )
        );
      } catch (err) {
        console.error("Failed to update task status:", err);
        alert("Failed to update task status. Please try again.");
      }
    }
    setDraggedTask(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Filter tasks based on search query
  const getFilteredTasks = () => {
    let filtered = [...tasks];

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.name.toLowerCase().includes(query) ||
          (task.assignee?.name || "").toLowerCase().includes(query) ||
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

  const handleAddTask = async () => {
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

    try {
      // Find assignee
      let assigneeId = null;
      const existingAssignee = availableAssignees.find(
        (a) => a.name === assigneeName
      );

      if (existingAssignee) {
        assigneeId = existingAssignee.id;
      }

      // Create task data for API
      const taskData = {
        title: taskForm.name,
        description: taskForm.description || "No description provided",
        projectId: project.id,
        priority: taskForm.priority.toUpperCase(),
        status: "TO_DO",
        assigneeId: assigneeId,
      };

      // Create task via API
      const newTaskResponse = await taskAPI.createTask(taskData);

      // Transform and add to local state
      const newTask = {
        id: newTaskResponse.id,
        name: newTaskResponse.title,
        description: newTaskResponse.description,
        assignee: newTaskResponse.assignee
          ? {
              id: newTaskResponse.assignee.id,
              name:
                newTaskResponse.assignee.fullName ||
                `${newTaskResponse.assignee.firstName} ${newTaskResponse.assignee.lastName}`,
              email: newTaskResponse.assignee.email,
            }
          : null,
        function: "General",
        details: "Task",
        status: newTaskResponse.status,
        dueDate:
          taskForm.dueDate ||
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        createdAt: new Date().toISOString().split("T")[0],
        priority: newTaskResponse.priority,
      };

      setTasks((prev) => [...prev, newTask]);
      closeModal();
    } catch (err) {
      console.error("Failed to create task:", err);
      alert("Failed to create task. Please try again.");
    }
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

  // Don't render if no project
  if (!project) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning">No project data available</div>
      </div>
    );
  }

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
                          activeTab === "comments" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("comments")}
                        role="tab"
                        href="#"
                        style={
                          activeTab === "comments"
                            ? {
                                background: styles.brandGradient,
                                color: "white",
                                borderRadius: "0.5rem",
                              }
                            : {}
                        }
                      >
                        <i className="fas fa-comments me-2"></i>Comments
                        {comments.length > 0 && (
                          <span className="badge bg-light text-dark ms-2 small">
                            {comments.length}
                          </span>
                        )}
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
                              <Task
                                key={task.id}
                                task={task}
                                handleDeleteTask={handleAddTask}
                                handleEditTask={handleEditTask}
                              />
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