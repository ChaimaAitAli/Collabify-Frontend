import React, { useState, useEffect } from "react";
import getPriorityBadge from "./getPriorityBadge";
import Task from "./Task";
import LetterAvatar from "./LetterAvatar";
import DraggableTask from "./DraggableTask";
import Image from "next/image";
import { taskAPI, projectAPI, userAPI } from "@/api/api";

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
  const [userCache, setUserCache] = useState(new Map());

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
        const transformedTasks = await Promise.all(
          tasksData.map(async (task) => {
            let assignee = null;

            // If task has assigneeId, fetch the assignee data
            if (task.assigneeId) {
              try {
                const assigneeData = await userAPI.getUserById(task.assigneeId);
                assignee = {
                  id: assigneeData.id,
                  firstname: assigneeData.firstname,
                  lastname: assigneeData.lastname,
                  email: assigneeData.email,
                  // Add a computed name field for easier access
                  name:
                    `${assigneeData.firstname || ""} ${
                      assigneeData.lastname || ""
                    }`.trim() ||
                    assigneeData.email?.split("@")[0] ||
                    "Unknown User",
                };
              } catch (err) {
                console.error(
                  `Failed to fetch assignee ${task.assigneeId}:`,
                  err
                );
                // Set a placeholder assignee to avoid breaking the UI
                assignee = {
                  id: task.assigneeId,
                  firstname: "",
                  lastname: "",
                  email: "unknown@example.com",
                  name: "Unknown User",
                };
              }
            }

            return {
              id: task.id,
              name: task.title,
              description: task.description || "No description provided",
              assignee: assignee, // This will now contain the full user data
              assigneeId: task.assigneeId, // Keep this for reference
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
            };
          })
        );

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
          task.status.toLowerCase().includes(query)
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
        status: "To Do",
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

  // Comments
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  const handleLikeComment = (commentId, isReply = false, parentId = null) => {
    setComments((prev) => {
      if (isReply) {
        return prev.map((comment) => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: updateCommentLikes(comment.replies, commentId),
            };
          }
          return comment;
        });
      } else {
        return prev.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likes: comment.likedByUser
                ? comment.likes - 1
                : comment.likes + 1,
              likedByUser: !comment.likedByUser,
            };
          }
          return comment;
        });
      }
    });
  };

  const updateCommentLikes = (replies, targetId) => {
    return replies.map((reply) => {
      if (reply.id === targetId) {
        return {
          ...reply,
          likes: reply.likedByUser ? reply.likes - 1 : reply.likes + 1,
          likedByUser: !reply.likedByUser,
        };
      }
      if (reply.replies.length > 0) {
        return {
          ...reply,
          replies: updateCommentLikes(reply.replies, targetId),
        };
      }
      return reply;
    });
  };

  const handleReply = (commentId, parentId = null) => {
    if (!replyText.trim()) return;

    const newReply = {
      id: Date.now(),
      author: { name: "John Michael", email: "john@creative-tim.com" },
      content: replyText,
      timestamp: new Date().toISOString(),
      edited: false,
      likes: 0,
      likedByUser: false,
      replies: [],
    };

    setComments((prev) => {
      return prev.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [...comment.replies, newReply],
          };
        }
        // Handle nested replies
        if (comment.replies.some((reply) => reply.id === commentId)) {
          return {
            ...comment,
            replies: addNestedReply(comment.replies, commentId, newReply),
          };
        }
        return comment;
      });
    });

    setReplyText("");
    setReplyingTo(null);
  };

  const addNestedReply = (replies, targetId, newReply) => {
    return replies.map((reply) => {
      if (reply.id === targetId) {
        return {
          ...reply,
          replies: [...reply.replies, newReply],
        };
      }
      if (reply.replies.length > 0) {
        return {
          ...reply,
          replies: addNestedReply(reply.replies, targetId, newReply),
        };
      }
      return reply;
    });
  };

  const renderReplies = (replies, level = 1, parentId = null) => {
    if (!replies || replies.length === 0) return null;

    return (
      <div
        className={`replies-container ${level > 1 ? "ms-4" : "ms-5"}`}
        style={{ marginTop: "1rem" }}
      >
        {replies.map((reply) => (
          <div key={reply.id} className="reply-item mb-3">
            <div
              className="card border-0 shadow-sm"
              style={{
                borderRadius: "0.75rem",
                background: level % 2 === 1 ? "#f8f9fc" : "white",
                borderLeft: `3px solid ${styles.brandColor}`,
                marginLeft: `${Math.min(level * 20, 60)}px`,
              }}
            >
              <div className="card-body p-3">
                <div className="d-flex align-items-start gap-3">
                  <LetterAvatar
                    name={reply.author.name}
                    size={level > 2 ? 32 : 36}
                  />
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div>
                        <h6
                          className="mb-0 fw-bold text-dark"
                          style={{ fontSize: level > 2 ? "0.85rem" : "0.9rem" }}
                        >
                          {reply.author.name}
                        </h6>
                        <small className="text-muted d-flex align-items-center gap-2">
                          <i className="fas fa-clock"></i>
                          {formatTimestamp(reply.timestamp)}
                          {reply.edited && (
                            <span className="badge bg-light text-muted">
                              edited
                            </span>
                          )}
                        </small>
                      </div>
                    </div>

                    <div
                      className="comment-content mb-3"
                      style={{
                        lineHeight: "1.6",
                        color: "#344767",
                        fontSize: level > 2 ? "0.85rem" : "0.9rem",
                      }}
                    >
                      {reply.content}
                    </div>

                    <div className="d-flex align-items-center gap-3">
                      <button
                        className="btn btn-sm btn-light rounded-pill d-flex align-items-center gap-1"
                        onClick={() =>
                          handleLikeComment(
                            reply.id,
                            true,
                            parentId || reply.id
                          )
                        }
                        style={{
                          border: "none",
                          backgroundColor: reply.likedByUser
                            ? "#ffe6e6"
                            : "transparent",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill={reply.likedByUser ? "#dc3545" : "#6c757d"}
                          stroke={reply.likedByUser ? "#dc3545" : "#6c757d"}
                          strokeWidth="1.5"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        {reply.likes > 0 && (
                          <span className="small">{reply.likes}</span>
                        )}
                      </button>
                      <button
                        className="btn btn-sm btn-light rounded-pill d-flex align-items-center gap-1"
                        style={{
                          backgroundColor: "#8dc71e",
                          color: "white",
                        }}
                        onClick={() => setReplyingTo(reply.id)}
                      >
                        <span style={{ fontSize: "0.8rem" }}>Reply</span>
                      </button>
                    </div>

                    {replyingTo === reply.id && (
                      <div className="mt-3">
                        <div className="d-flex gap-2">
                          <LetterAvatar name="John Michael" size={28} />
                          <div className="flex-grow-1">
                            <textarea
                              className="form-control border-0 shadow-sm"
                              placeholder={`Reply to ${reply.author.name}...`}
                              rows="2"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              style={{
                                borderRadius: "0.5rem",
                                fontSize: "0.85rem",
                                resize: "none",
                              }}
                            />
                            <div className="d-flex justify-content-end gap-2 mt-2">
                              <button
                                className="btn btn-sm btn-light rounded-pill"
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyText("");
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                className="btn btn-sm rounded-pill"
                                style={{
                                  background: styles.brandGradient,
                                  color: "white",
                                  border: "none",
                                }}
                                onClick={() => handleReply(reply.id, parentId)}
                                disabled={!replyText.trim()}
                              >
                                Send
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Render nested replies */}
            {renderReplies(reply.replies, level + 1, parentId || reply.id)}
          </div>
        ))}
      </div>
    );
  };

  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  // Add comment function
  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: comments.length + 1,
      author: { name: "John Michael", email: "john@creative-tim.com" }, // Current user
      content: newComment,
      timestamp: new Date().toISOString(),
      edited: false,
    };

    setComments((prev) => [comment, ...prev]);
    setNewComment("");
  };

  // Edit comment functions
  const handleEditComment = (comment) => {
    setEditingComment(comment.id);
    setEditCommentText(comment.content);
  };

  const handleSaveEditComment = () => {
    if (!editCommentText.trim()) return;

    setComments((prev) =>
      prev.map((comment) =>
        comment.id === editingComment
          ? { ...comment, content: editCommentText, edited: true }
          : comment
      )
    );
    setEditingComment(null);
    setEditCommentText("");
  };

  const handleCancelEditComment = () => {
    setEditingComment(null);
    setEditCommentText("");
  };

  // Delete comment function
  const handleDeleteComment = (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes} min ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return (
        date.toLocaleDateString() +
        " at " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    }
  };
  const [comments, setComments] = useState([
    {
      id: 1,
      author: { name: "John Michael", email: "john@creative-tim.com" },
      content:
        "Great progress on the dashboard design! The new color scheme looks much more modern.",
      timestamp: "2025-06-07T14:30:00Z",
      edited: false,
      likes: 5,
      likedByUser: true,
      replies: [
        {
          id: 11,
          author: { name: "Sarah Wilson", email: "sarah@creative-tim.com" },
          content: "I totally agree! The purple gradient looks fantastic.",
          timestamp: "2025-06-07T15:00:00Z",
          edited: false,
          likes: 2,
          likedByUser: false,
          replies: [],
        },
      ],
    },
    {
      id: 2,
      author: { name: "Alexa Liras", email: "alexa@creative-tim.com" },
      content:
        "I've noticed some navigation issues on mobile. Should we prioritize fixing those before the next milestone?",
      timestamp: "2025-06-07T10:15:00Z",
      edited: false,
      likes: 3,
      likedByUser: false,
      replies: [],
    },
    {
      id: 3,
      author: { name: "Laurent Perrier", email: "laurent@creative-tim.com" },
      content:
        "API integration is complete! All endpoints are now responding correctly. Ready for frontend implementation.",
      timestamp: "2025-06-06T16:45:00Z",
      edited: true,
      likes: 8,
      likedByUser: true,
      replies: [
        {
          id: 31,
          author: {
            name: "Michael Johnson",
            email: "michael@creative-tim.com",
          },
          content: "Excellent work! I'll start the frontend integration today.",
          timestamp: "2025-06-06T17:00:00Z",
          edited: false,
          likes: 1,
          likedByUser: false,
          replies: [
            {
              id: 311,
              author: {
                name: "Laurent Perrier",
                email: "laurent@creative-tim.com",
              },
              content:
                "Perfect! Let me know if you need any clarification on the endpoints.",
              timestamp: "2025-06-06T17:15:00Z",
              edited: false,
              likes: 0,
              likedByUser: false,
              replies: [],
            },
          ],
        },
      ],
    },
  ]);

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
                {/* Comments Tab */}
                {activeTab === "comments" && (
                  <div
                    className="card border shadow-xs mb-4"
                    style={{ minHeight: "600px" }}
                  >
                    <div
                      className="card-header border-0 p-4"
                      style={{
                        background:
                          "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                        borderRadius: "0.75rem 0.75rem 0 0",
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <h5 className="text-white mb-1 fw-bold">
                            <i className="fas fa-comments me-2"></i>
                            Project Discussion
                          </h5>
                          <p className="text-white-50 mb-0 small">
                            Share updates, ask questions, and collaborate with
                            your team
                          </p>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                          <span className="badge bg-white text-dark fw-bold px-3 py-2">
                            {comments.length} Comments
                          </span>
                          <div className="d-flex">
                            {availableAssignees
                              .slice(0, 4)
                              .map((assignee, index) => (
                                <div
                                  key={assignee.name}
                                  className="ms-n2"
                                  style={{ zIndex: 10 - index }}
                                >
                                  <LetterAvatar
                                    name={getDisplayName(assignee)}
                                    size={32}
                                  />
                                </div>
                              ))}
                            {availableAssignees.length > 4 && (
                              <div
                                className="ms-n2 d-flex align-items-center justify-content-center text-white fw-bold rounded-circle border border-2 border-white"
                                style={{
                                  width: 32,
                                  height: 32,
                                  backgroundColor: "rgba(255,255,255,0.2)",
                                  fontSize: "12px",
                                }}
                              >
                                +{availableAssignees.length - 4}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className="card-body p-4"
                      style={{ backgroundColor: "#fafbfc" }}
                    >
                      {/* Add Comment Section */}
                      <div className="mb-4">
                        <div
                          className="card border-0 shadow-sm"
                          style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "1.25rem",
                            border: "1px solid #f1f5f9",
                            backdropFilter: "blur(10px)",
                            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06)",
                          }}
                        >
                          <div className="card-body p-4">
                            <div className="d-flex align-items-start gap-3">
                              <LetterAvatar name="John Michael" size={40} />
                              <div className="flex-grow-1 position-relative">
                                <textarea
                                  className="form-control border-0 shadow-sm pe-5"
                                  placeholder="Share an update, ask a question, or start a discussion..."
                                  rows="3"
                                  value={newComment}
                                  onChange={(e) =>
                                    setNewComment(e.target.value)
                                  }
                                  style={{
                                    resize: "none",
                                    borderRadius: "1.25rem",
                                    backgroundColor: "#f8fafc",
                                    border: "2px solid #e2e8f0",
                                    padding: "1.25rem 4.5rem 1.25rem 1.25rem",
                                    fontSize: "0.95rem",
                                    lineHeight: "1.5",
                                    transition:
                                      "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                    fontFamily:
                                      "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
                                    outline: "none",
                                    minHeight: "120px",
                                  }}
                                  onFocus={(e) => {
                                    e.target.style.backgroundColor = "#ffffff";
                                    e.target.style.borderColor = "#3b82f6";
                                    e.target.style.boxShadow =
                                      "0 0 0 4px rgba(59, 130, 246, 0.08), 0 8px 32px rgba(0, 0, 0, 0.06)";
                                    e.target.style.transform =
                                      "translateY(-2px)";
                                  }}
                                  onBlur={(e) => {
                                    e.target.style.backgroundColor = "#f8fafc";
                                    e.target.style.borderColor = "#e2e8f0";
                                    e.target.style.boxShadow =
                                      "0 4px 16px rgba(0, 0, 0, 0.04)";
                                    e.target.style.transform = "translateY(0)";
                                  }}
                                />

                                <button
                                  className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center position-absolute"
                                  onClick={handleAddComment}
                                  disabled={!newComment.trim()}
                                  style={{
                                    bottom: "12px",
                                    right: "12px",
                                    width: "55px",
                                    height: "55px",
                                    border: "none",
                                    backgroundColor: !newComment.trim()
                                      ? "#f1f5f9"
                                      : "#3b82f6",
                                    color: !newComment.trim()
                                      ? "#94a3b8"
                                      : "#ffffff",
                                    transition:
                                      "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                    cursor: !newComment.trim()
                                      ? "not-allowed"
                                      : "pointer",
                                    zIndex: 10,
                                  }}
                                  onMouseOver={(e) => {
                                    if (!e.currentTarget.disabled) {
                                      e.currentTarget.style.transform =
                                        "translateY(-3px) scale(1.08)";
                                      e.currentTarget.style.backgroundColor =
                                        "#2563eb";
                                    }
                                  }}
                                  onMouseOut={(e) => {
                                    if (!e.currentTarget.disabled) {
                                      e.currentTarget.style.transform =
                                        "translateY(0) scale(1)";
                                      e.currentTarget.style.backgroundColor =
                                        "#3b82f6";
                                    }
                                  }}
                                >
                                  <svg
                                    width="120%"
                                    height="120%"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    style={{
                                      transform: "rotate(-45deg)",
                                      transition: "transform 0.2s ease",
                                    }}
                                  >
                                    <path
                                      d="M22 2L11 13"
                                      stroke="currentColor"
                                      strokeWidth="2.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    <path
                                      d="M22 2L15 22L11 13L2 9L22 2Z"
                                      stroke="currentColor"
                                      strokeWidth="2.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </button>

                                {/* Subtle background pattern */}
                                <div
                                  className="position-absolute"
                                  style={{
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    borderRadius: "1.25rem",
                                    pointerEvents: "none",
                                    background: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f1f5f9' fill-opacity='0.4'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
                                    opacity: 0.3,
                                    zIndex: -1,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Comments List */}
                      <div className="comments-container">
                        {comments.length === 0 ? (
                          <div className="text-center py-5">
                            <div className="mb-3">
                              <i
                                className="fas fa-comments"
                                style={{
                                  fontSize: "4rem",
                                  color: "#e9ecef",
                                  background: styles.brandGradient,
                                  WebkitBackgroundClip: "text",
                                  WebkitTextFillColor: "transparent",
                                  backgroundClip: "text",
                                }}
                              ></i>
                            </div>
                            <h5 className="text-muted mb-2">No comments yet</h5>
                            <p className="text-muted">
                              Start the conversation by posting the first
                              comment!
                            </p>
                          </div>
                        ) : (
                          <div className="d-flex flex-column gap-4">
                            {comments.map((comment) => (
                              <div key={comment.id}>
                                <div
                                  className="card border-0 shadow-sm hover-shadow"
                                  style={{
                                    borderRadius: "1rem",
                                    transition: "all 0.3s ease",
                                    background: "white",
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.transform =
                                      "translateY(-2px)";
                                    e.currentTarget.style.boxShadow =
                                      "0 8px 25px rgba(0,0,0,0.1)";
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.transform =
                                      "translateY(0)";
                                    e.currentTarget.style.boxShadow =
                                      "0 2px 10px rgba(0,0,0,0.05)";
                                  }}
                                >
                                  <div className="card-body p-4">
                                    <div className="d-flex align-items-start gap-3">
                                      <LetterAvatar
                                        name={comment.author.name}
                                        size={44}
                                      />
                                      <div className="flex-grow-1">
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                          <div>
                                            <h6 className="mb-0 fw-bold text-dark">
                                              {comment.author.name}
                                            </h6>
                                            <small className="text-muted d-flex align-items-center gap-2">
                                              <i className="fas fa-clock"></i>
                                              {formatTimestamp(
                                                comment.timestamp
                                              )}
                                              {comment.edited && (
                                                <span className="badge bg-light text-muted">
                                                  edited
                                                </span>
                                              )}
                                            </small>
                                          </div>
                                        </div>

                                        {editingComment === comment.id ? (
                                          <div className="edit-comment">
                                            <textarea
                                              className="form-control mb-3"
                                              rows="3"
                                              value={editCommentText}
                                              onChange={(e) =>
                                                setEditCommentText(
                                                  e.target.value
                                                )
                                              }
                                              style={{
                                                borderRadius: "0.75rem",
                                              }}
                                            />
                                            <div className="d-flex gap-2">
                                              <button
                                                className="btn btn-sm btn-primary rounded-pill"
                                                onClick={handleSaveEditComment}
                                              >
                                                Save Changes
                                              </button>
                                              <button
                                                className="btn btn-sm btn-light rounded-pill"
                                                onClick={
                                                  handleCancelEditComment
                                                }
                                              >
                                                Cancel
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <>
                                            <div
                                              className="comment-content mb-3"
                                              style={{
                                                lineHeight: "1.6",
                                                color: "#344767",
                                              }}
                                            >
                                              {comment.content}
                                            </div>

                                            <div className="d-flex align-items-center gap-3">
                                              <button
                                                className="btn btn-sm btn-light rounded-pill d-flex align-items-center gap-2"
                                                onClick={() =>
                                                  handleLikeComment(comment.id)
                                                }
                                                style={{
                                                  border: "none",
                                                  backgroundColor:
                                                    comment.likedByUser
                                                      ? "#ffe6e6"
                                                      : "transparent",
                                                  transition: "all 0.3s ease",
                                                }}
                                              >
                                                <svg
                                                  width="16"
                                                  height="16"
                                                  viewBox="0 0 24 24"
                                                  fill={
                                                    comment.likedByUser
                                                      ? "#dc3545"
                                                      : "#6c757d"
                                                  }
                                                  stroke={
                                                    comment.likedByUser
                                                      ? "#dc3545"
                                                      : "#6c757d"
                                                  }
                                                  strokeWidth="1.5"
                                                  style={{
                                                    transform:
                                                      comment.likedByUser
                                                        ? "scale(1.1)"
                                                        : "scale(1)",
                                                    transition: "all 0.3s ease",
                                                  }}
                                                >
                                                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                                </svg>
                                                {comment.likes > 0 && (
                                                  <span className="small fw-bold">
                                                    {comment.likes}
                                                  </span>
                                                )}
                                              </button>
                                              <button
                                                className="btn btn-sm rounded-pill d-flex align-items-center gap-1"
                                                style={{
                                                  backgroundColor: "#8dc71e",
                                                  color: "white",
                                                }}
                                                onClick={() =>
                                                  setReplyingTo(comment.id)
                                                }
                                              >
                                                Reply
                                              </button>
                                            </div>

                                            {replyingTo === comment.id && (
                                              <div className="mt-3">
                                                <div className="d-flex gap-3">
                                                  <LetterAvatar
                                                    name="John Michael"
                                                    size={36}
                                                  />
                                                  <div className="flex-grow-1">
                                                    <textarea
                                                      className="form-control border-0 shadow-sm"
                                                      placeholder={`Reply to ${comment.author.name}...`}
                                                      rows="3"
                                                      value={replyText}
                                                      onChange={(e) =>
                                                        setReplyText(
                                                          e.target.value
                                                        )
                                                      }
                                                      style={{
                                                        borderRadius: "0.75rem",
                                                        resize: "none",
                                                      }}
                                                    />
                                                    <div className="d-flex justify-content-end gap-2 mt-2">
                                                      <button
                                                        className="btn btn-sm btn-light rounded-pill"
                                                        onClick={() => {
                                                          setReplyingTo(null);
                                                          setReplyText("");
                                                        }}
                                                      >
                                                        Cancel
                                                      </button>
                                                      <button
                                                        className="btn btn-sm d-flex align-items-center justify-content-center"
                                                        style={{
                                                          width: "5rm",
                                                          height: "3rm",
                                                          background:
                                                            styles.brandGradient,
                                                          color: "white",
                                                          border: "none",
                                                          borderRadius: "20px",
                                                        }}
                                                        onClick={() =>
                                                          handleReply(
                                                            comment.id
                                                          )
                                                        }
                                                        disabled={
                                                          !replyText.trim()
                                                        }
                                                      >
                                                        Send
                                                      </button>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Render replies */}
                                {renderReplies(comment.replies, 1, comment.id)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

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
                                <DraggableTask
                                  key={task.id}
                                  task={task}
                                  handleDragStart={handleDragStart}
                                />
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
                                <DraggableTask
                                  key={task.id}
                                  task={task}
                                  handleDragStart={handleDragStart}
                                />
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
                                <DraggableTask
                                  key={task.id}
                                  task={task}
                                  handleDragStart={handleDragStart}
                                />
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
                  <div className="row g-4">
                    {/* Project Overview Card */}
                    <div className="col-12">
                      <div className="card shadow-xs border">
                        <div className="card-header pb-0">
                          <div className="d-sm-flex align-items-center mb-3">
                            <div>
                              <h6 className="font-weight-semibold text-lg mb-0">
                                Project Progress Overview
                              </h6>
                              <p className="text-sm mb-sm-0 mb-2">
                                Track your project completion and team
                                productivity.
                              </p>
                            </div>
                            <div className="ms-auto d-flex">
                              <button
                                type="button"
                                className="btn btn-sm btn-white mb-0 me-2"
                              >
                                <i className="fas fa-download me-1"></i>
                                Export Report
                              </button>
                            </div>
                          </div>
                          <div className="d-sm-flex align-items-center">
                            <h3 className="mb-0 font-weight-semibold">
                              {Math.round(
                                (tasks.filter((task) => task.status === "Done")
                                  .length /
                                  tasks.length) *
                                  100
                              )}
                              % Complete
                            </h3>
                            <span
                              className={`badge badge-sm border ms-sm-3 px-2 ${
                                tasks.filter((task) => task.status === "Done")
                                  .length /
                                  tasks.length >=
                                0.5
                                  ? "border-success text-success bg-success"
                                  : "border-warning text-warning bg-warning"
                              } border-radius-sm`}
                            >
                              <svg
                                width="9"
                                height="9"
                                viewBox="0 0 10 9"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M0.46967 4.46967C0.176777 4.76256 0.176777 5.23744 0.46967 5.53033C0.762563 5.82322 1.23744 5.82322 1.53033 5.53033L0.46967 4.46967ZM5.53033 1.53033C5.82322 1.23744 5.82322 0.762563 5.53033 0.46967C5.23744 0.176777 4.76256 0.176777 4.46967 0.46967L5.53033 1.53033ZM5.53033 0.46967C5.23744 0.176777 4.76256 0.176777 4.46967 0.46967C4.17678 0.762563 4.17678 1.23744 4.46967 1.53033L5.53033 0.46967ZM8.46967 5.53033C8.76256 5.82322 9.23744 5.82322 9.53033 5.53033C9.82322 5.23744 9.82322 4.76256 9.53033 4.46967L8.46967 5.53033ZM1.53033 5.53033L5.53033 1.53033L4.46967 0.46967L0.46967 4.46967L1.53033 5.53033ZM4.46967 1.53033L8.46967 5.53033L9.53033 4.46967L5.53033 0.46967L4.46967 1.53033Z"
                                  fill="currentColor"
                                ></path>
                              </svg>
                              {
                                tasks.filter((task) => task.status === "Done")
                                  .length
                              }{" "}
                              of {tasks.length} tasks
                            </span>
                          </div>
                        </div>
                        <div className="card-body p-3">
                          <div className="chart mt-n6">
                            <canvas
                              id="progress-chart"
                              className="chart-canvas"
                              height="300"
                              ref={(canvas) => {
                                if (canvas && !canvas.chartInstance) {
                                  const ctx = canvas.getContext("2d");
                                  // Simulated progress data over time
                                  const progressData = [
                                    {
                                      date: "2025-05-01",
                                      completed: 0,
                                      total: 3,
                                    },
                                    {
                                      date: "2025-05-10",
                                      completed: 0,
                                      total: 3,
                                    },
                                    {
                                      date: "2025-05-15",
                                      completed: 1,
                                      total: 3,
                                    },
                                    {
                                      date: "2025-05-20",
                                      completed: 1,
                                      total: 3,
                                    },
                                    {
                                      date: "2025-05-25",
                                      completed: 1,
                                      total: 3,
                                    },
                                    {
                                      date: "2025-05-30",
                                      completed: 1,
                                      total: 3,
                                    },
                                    {
                                      date: "2025-06-05",
                                      completed: 1,
                                      total: 3,
                                    },
                                  ];

                                  // Simple canvas drawing for progress line
                                  const width = canvas.width;
                                  const height = canvas.height;
                                  const padding = 40;

                                  ctx.clearRect(0, 0, width, height);
                                  ctx.strokeStyle = styles.brandColor;
                                  ctx.lineWidth = 3;
                                  ctx.beginPath();

                                  progressData.forEach((point, index) => {
                                    const x =
                                      padding +
                                      (index * (width - 2 * padding)) /
                                        (progressData.length - 1);
                                    const y =
                                      height -
                                      padding -
                                      (point.completed / point.total) *
                                        (height - 2 * padding);

                                    if (index === 0) {
                                      ctx.moveTo(x, y);
                                    } else {
                                      ctx.lineTo(x, y);
                                    }
                                  });

                                  ctx.stroke();
                                  canvas.chartInstance = true;
                                }
                              }}
                            ></canvas>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Task Distribution and Team Performance */}
                    <div className="col-lg-6 col-md-6">
                      <div className="card shadow-xs border h-100">
                        <div className="card-header pb-0">
                          <h6 className="font-weight-semibold text-lg mb-0">
                            Task Distribution
                          </h6>
                          <p className="text-sm">
                            Breakdown of tasks by status and priority.
                          </p>
                        </div>
                        <div className="card-body py-3">
                          {/* Task Status Distribution */}
                          <div className="mb-4">
                            <h6 className="text-sm font-weight-semibold mb-3">
                              By Status
                            </h6>
                            <div className="row">
                              <div className="col-4 text-center">
                                <div
                                  className="rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center"
                                  style={{
                                    width: "60px",
                                    height: "60px",
                                    background:
                                      "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                                    color: "white",
                                  }}
                                >
                                  <span className="font-weight-bold">
                                    {
                                      tasks.filter(
                                        (task) => task.status === "To Do"
                                      ).length
                                    }
                                  </span>
                                </div>
                                <p className="text-xs text-muted mb-0">To Do</p>
                              </div>
                              <div className="col-4 text-center">
                                <div
                                  className="rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center"
                                  style={{
                                    width: "60px",
                                    height: "60px",
                                    background:
                                      "linear-gradient(135deg, #ffc107, #e0a800)",
                                    color: "white",
                                  }}
                                >
                                  <span className="font-weight-bold">
                                    {
                                      tasks.filter(
                                        (task) => task.status === "In Progress"
                                      ).length
                                    }
                                  </span>
                                </div>
                                <p className="text-xs text-muted mb-0">
                                  In Progress
                                </p>
                              </div>
                              <div className="col-4 text-center">
                                <div
                                  className="rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center"
                                  style={{
                                    width: "60px",
                                    height: "60px",
                                    background:
                                      "linear-gradient(135deg, #198754, #146c43)",
                                    color: "white",
                                  }}
                                >
                                  <span className="font-weight-bold">
                                    {
                                      tasks.filter(
                                        (task) => task.status === "Done"
                                      ).length
                                    }
                                  </span>
                                </div>
                                <p className="text-xs text-muted mb-0">Done</p>
                              </div>
                            </div>
                          </div>

                          {/* Priority Distribution */}
                          <div className="mb-3">
                            <h6 className="text-sm font-weight-semibold mb-3">
                              By Priority
                            </h6>
                            {["High", "Medium", "Low"].map((priority) => {
                              const count = tasks.filter(
                                (task) => task.priority === priority
                              ).length;
                              const percentage =
                                tasks.length > 0
                                  ? (count / tasks.length) * 100
                                  : 0;
                              const colors = {
                                High: "#dc3545",
                                Medium: "#ffc107",
                                Low: "#28a745",
                              };

                              return (
                                <div key={priority} className="mb-2">
                                  <div className="d-flex justify-content-between">
                                    <span className="text-sm">{priority}</span>
                                    <span className="text-sm font-weight-semibold">
                                      {count} tasks
                                    </span>
                                  </div>
                                  <div
                                    className="progress"
                                    style={{ height: "6px" }}
                                  >
                                    <div
                                      className="progress-bar"
                                      style={{
                                        width: `${percentage}%`,
                                        backgroundColor: colors[priority],
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Team Performance */}
                    <div className="col-lg-6 col-md-6">
                      <div className="card shadow-xs border h-100">
                        <div className="card-header pb-0">
                          <h6 className="font-weight-semibold text-lg mb-0">
                            Team Performance
                          </h6>
                          <p className="text-sm">
                            Individual task assignments and completion rates.
                          </p>
                          <div className="btn-group btn-group-sm" role="group">
                            <input
                              type="radio"
                              className="btn-check"
                              name="teamview"
                              id="teamview1"
                              autoComplete="off"
                              defaultChecked
                            />
                            <label
                              className="btn btn-white px-3 mb-0"
                              htmlFor="teamview1"
                            >
                              Tasks
                            </label>
                            <input
                              type="radio"
                              className="btn-check"
                              name="teamview"
                              id="teamview2"
                              autoComplete="off"
                            />
                            <label
                              className="btn btn-white px-3 mb-0"
                              htmlFor="teamview2"
                            >
                              Completion
                            </label>
                          </div>
                        </div>
                        <div className="card-body py-3">
                          {(() => {
                            const teamStats = {};
                            tasks.forEach((task) => {
                              if (!teamStats[task.assignee.name]) {
                                teamStats[task.assignee.name] = {
                                  total: 0,
                                  completed: 0,
                                  inProgress: 0,
                                  todo: 0,
                                };
                              }
                              teamStats[task.assignee.name].total++;
                              if (task.status === "Done")
                                teamStats[task.assignee.name].completed++;
                              if (task.status === "In Progress")
                                teamStats[task.assignee.name].inProgress++;
                              if (task.status === "To Do")
                                teamStats[task.assignee.name].todo++;
                            });

                            return Object.entries(teamStats).map(
                              ([name, stats]) => {
                                const completionRate =
                                  stats.total > 0
                                    ? (stats.completed / stats.total) * 100
                                    : 0;

                                return (
                                  <div
                                    key={name}
                                    className="d-flex align-items-center mb-3"
                                  >
                                    <div className="me-3">
                                      <div
                                        className="avatar avatar-sm rounded-circle d-flex align-items-center justify-content-center"
                                        style={{
                                          background: styles.brandGradient,
                                          color: "white",
                                          fontSize: "0.75rem",
                                          fontWeight: "bold",
                                        }}
                                      >
                                        {name
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                      </div>
                                    </div>
                                    <div className="flex-grow-1">
                                      <div className="d-flex justify-content-between">
                                        <h6 className="text-sm mb-1">{name}</h6>
                                        <span className="text-xs text-muted">
                                          {stats.total} tasks
                                        </span>
                                      </div>
                                      <div
                                        className="progress"
                                        style={{ height: "4px" }}
                                      >
                                        <div
                                          className="progress-bar bg-success"
                                          style={{
                                            width: `${
                                              (stats.completed / stats.total) *
                                              100
                                            }%`,
                                          }}
                                        ></div>
                                        <div
                                          className="progress-bar bg-warning"
                                          style={{
                                            width: `${
                                              (stats.inProgress / stats.total) *
                                              100
                                            }%`,
                                          }}
                                        ></div>
                                      </div>
                                      <div className="d-flex justify-content-between mt-1">
                                        <small className="text-muted">
                                          {stats.completed} done,{" "}
                                          {stats.inProgress} in progress
                                        </small>
                                        <small className="text-muted">
                                          {Math.round(completionRate)}%
                                        </small>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity & Upcoming Deadlines */}
                    <div className="col-lg-6 col-md-6">
                      <div className="card shadow-xs border h-100">
                        <div className="card-header pb-0">
                          <h6 className="font-weight-semibold text-lg mb-0">
                            Recent Activity
                          </h6>
                          <p className="text-sm">
                            Latest project updates and changes.
                          </p>
                        </div>
                        <div className="card-body py-3">
                          <div className="timeline timeline-one-side">
                            {tasks.slice(0, 4).map((task, index) => (
                              <div
                                key={task.id}
                                className="timeline-block mb-3"
                              >
                                <span
                                  className="timeline-step"
                                  style={{
                                    background:
                                      task.status === "Done"
                                        ? "#28a745"
                                        : task.status === "In Progress"
                                        ? "#ffc107"
                                        : "#8b5cf6",
                                    width: "12px",
                                    height: "12px",
                                  }}
                                ></span>
                                <div className="timeline-content">
                                  <h6 className="text-dark text-sm font-weight-bold mb-0">
                                    {task.name}
                                  </h6>
                                  <p className="text-secondary font-weight-bold text-xs mt-1 mb-0">
                                    {task.status} • Assigned to{" "}
                                    {task.assignee.name}
                                  </p>
                                  <p className="text-sm mt-1 mb-2">
                                    Due:{" "}
                                    {new Date(
                                      task.dueDate
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <button className="btn btn-white btn-sm mb-0 ms-auto d-block">
                            View All Activity
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Project Health Metrics */}
                    <div className="col-lg-6 col-md-6">
                      <div className="card shadow-xs border h-100">
                        <div className="card-header pb-0">
                          <h6 className="font-weight-semibold text-lg mb-0">
                            Project Health
                          </h6>
                          <p className="text-sm">
                            Key performance indicators and metrics.
                          </p>
                        </div>
                        <div className="card-body py-3">
                          {(() => {
                            const overdueTasks = tasks.filter(
                              (task) =>
                                new Date(task.dueDate) < new Date() &&
                                task.status !== "Done"
                            ).length;

                            const avgDaysToComplete =
                              tasks.filter((task) => task.status === "Done")
                                .length > 0
                                ? Math.round(
                                    tasks
                                      .filter((task) => task.status === "Done")
                                      .reduce((acc, task) => {
                                        const created = new Date(
                                          task.createdAt
                                        );
                                        const due = new Date(task.dueDate);
                                        return (
                                          acc +
                                          Math.abs(due - created) /
                                            (1000 * 60 * 60 * 24)
                                        );
                                      }, 0) /
                                      tasks.filter(
                                        (task) => task.status === "Done"
                                      ).length
                                  )
                                : 0;

                            const healthScore = Math.max(
                              0,
                              100 -
                                overdueTasks * 20 -
                                tasks.filter(
                                  (task) =>
                                    task.priority === "High" &&
                                    task.status !== "Done"
                                ).length *
                                  15
                            );

                            return (
                              <>
                                <div className="row text-center mb-4">
                                  <div className="col-6">
                                    <h4
                                      className="font-weight-bolder"
                                      style={{
                                        color:
                                          overdueTasks === 0
                                            ? "#28a745"
                                            : "#dc3545",
                                      }}
                                    >
                                      {overdueTasks}
                                    </h4>
                                    <span className="text-sm">
                                      Overdue Tasks
                                    </span>
                                  </div>
                                  <div className="col-6">
                                    <h4
                                      className="font-weight-bolder"
                                      style={{ color: styles.brandColor }}
                                    >
                                      {avgDaysToComplete}
                                    </h4>
                                    <span className="text-sm">
                                      Avg Days to Complete
                                    </span>
                                  </div>
                                </div>

                                <div className="mb-3">
                                  <div className="d-flex justify-content-between">
                                    <span className="text-sm">
                                      Project Health Score
                                    </span>
                                    <span className="text-sm font-weight-semibold">
                                      {healthScore}%
                                    </span>
                                  </div>
                                  <div
                                    className="progress"
                                    style={{ height: "8px" }}
                                  >
                                    <div
                                      className="progress-bar"
                                      style={{
                                        width: `${healthScore}%`,
                                        background:
                                          healthScore >= 80
                                            ? "linear-gradient(90deg, #28a745, #20c997)"
                                            : healthScore >= 60
                                            ? "linear-gradient(90deg, #ffc107, #fd7e14)"
                                            : "linear-gradient(90deg, #dc3545, #fd7e14)",
                                      }}
                                    ></div>
                                  </div>
                                  <small className="text-muted mt-1">
                                    {healthScore >= 80
                                      ? "Excellent progress!"
                                      : healthScore >= 60
                                      ? "Good progress, room for improvement"
                                      : "Needs attention - consider adjusting timeline"}
                                  </small>
                                </div>

                                <div
                                  className="alert alert-light border-0"
                                  style={{ backgroundColor: "#f8f9fa" }}
                                >
                                  <div className="d-flex align-items-center">
                                    <i className="fas fa-lightbulb text-warning me-2"></i>
                                    <div>
                                      <strong className="text-dark">
                                        Recommendations:
                                      </strong>
                                      <ul className="mb-0 mt-1 text-sm">
                                        {overdueTasks > 0 && (
                                          <li>
                                            Address {overdueTasks} overdue task
                                            {overdueTasks > 1 ? "s" : ""}
                                          </li>
                                        )}
                                        {tasks.filter(
                                          (task) =>
                                            task.priority === "High" &&
                                            task.status !== "Done"
                                        ).length > 0 && (
                                          <li>
                                            Focus on{" "}
                                            {
                                              tasks.filter(
                                                (task) =>
                                                  task.priority === "High" &&
                                                  task.status !== "Done"
                                              ).length
                                            }{" "}
                                            high-priority task
                                            {tasks.filter(
                                              (task) =>
                                                task.priority === "High" &&
                                                task.status !== "Done"
                                            ).length > 1
                                              ? "s"
                                              : ""}
                                          </li>
                                        )}
                                        {healthScore >= 80 && (
                                          <li>
                                            Maintain current pace for on-time
                                            delivery
                                          </li>
                                        )}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
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
