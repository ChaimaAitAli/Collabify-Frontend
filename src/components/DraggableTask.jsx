import getPriorityBadge from "./getPriorityBadge";
import LetterAvatar from "./LetterAvatar";
const DraggableTask = ({ task, handleDragStart }) => {
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
          <div className="d-flex align-items-center">
            <LetterAvatar name={task.assignee.name} size="sm" />
            <div className="ms-2">
              <small className="text-dark fw-semibold d-block">
                {task.assignee.name}
              </small>
              <small className="text-muted">{task.function}</small>
            </div>
          </div>
          <small className="text-muted">{task.dueDate}</small>
        </div>
      </div>
    </div>
  );
};

export default DraggableTask;
