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

export default getPriorityBadge;
