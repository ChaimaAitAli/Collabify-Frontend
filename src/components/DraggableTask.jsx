import getPriorityBadge from "./getPriorityBadge";
import LetterAvatar from "./LetterAvatar";

const DraggableTask = ({ task, handleDragStart }) => {
  const getDisplayName = (user) => {
    if (!user) return "Unknown User";

    const fullName = `${user.firstname || ""} ${user.lastname || ""}`.trim();
    return fullName || user.email?.split("@")[0] || "Unknown User";
  };

  const getDisplayEmail = (user) => {
    if (!user || !user.email) return "No email";
    return user.email;
  };

  const renderAssigneeSection = () => {
    if (!task.assignee) {
      return (
        <div className="d-flex align-items-center">
          <LetterAvatar name="Unassigned" size="sm" />
          <div className="ms-2 d-flex flex-column justify-content-center">
            <h6 className="mb-0 text-sm font-weight-semibold">Unassigned</h6>
            <p className="text-sm text-secondary mb-0">No assignee</p>
          </div>
        </div>
      );
    }

    return (
      <div className="d-flex align-items-center">
        <LetterAvatar name={getDisplayName(task.assignee)} size="sm" />
        <div className="ms-2 d-flex flex-column justify-content-center">
          <h6 className="mb-0 text-sm font-weight-semibold">
            {getDisplayName(task.assignee)}
          </h6>
          <p className="text-sm text-secondary mb-0">
            {getDisplayEmail(task.assignee)}
          </p>
        </div>
      </div>
    );
  };

  return (
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
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
      }}
    >
      <div className="card-body p-3">
        <h6 className="mb-2 fw-semibold text-dark">
          {task.name}
          {getPriorityBadge(task.priority)}
        </h6>
        <div className="d-flex align-items-center justify-content-between">
          {renderAssigneeSection()}
          <small className="text-muted">{task.dueDate}</small>
        </div>
      </div>
    </div>
  );
};

export default DraggableTask;
