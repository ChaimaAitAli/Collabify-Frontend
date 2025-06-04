import React, { useState } from 'react';
import Image from 'next/image';
import Cube from "@/assets/img/3d-cube.png";
import LetterAvatar from './LetterAvatar';

// Custom styles for brand color
const styles = {
    brandColor: '#774dd3',
    brandLight: '#9b7ee2',
    brandGradient: 'linear-gradient(310deg, #774dd3, #9b7ee2)',
    cardHeaderGradient: 'linear-gradient(195deg, #774dd3, #673ab7)',
};

const ProjectTab = ({ project }) => {
    const [activeTab, setActiveTab] = useState('tasks');
    const [tasks, setTasks] = useState([
        {
            id: 1,
            name: 'Design new dashboard',
            assignee: {
                name: 'John Michael',
                email: 'john@creative-tim.com',
                avatar: '../assets/img/team-2.jpg'
            },
            function: 'UI/UX Design',
            details: 'Design',
            status: 'In Progress',
            dueDate: '2025-06-01',
            createdAt: '2025-05-15',
            priority: 'High'
        },
        {
            id: 2,
            name: 'Fix navigation issues',
            assignee: {
                name: 'Alexa Liras',
                email: 'alexa@creative-tim.com',
                avatar: '../assets/img/team-3.jpg'
            },
            function: 'Frontend Dev',
            details: 'Development',
            status: 'To Do',
            dueDate: '2025-05-30',
            createdAt: '2025-05-10',
            priority: 'Medium'
        },
        {
            id: 3,
            name: 'API integration',
            assignee: {
                name: 'Laurent Perrier',
                email: 'laurent@creative-tim.com',
                avatar: '../assets/img/team-1.jpg'
            },
            function: 'Backend Dev',
            details: 'Development',
            status: 'Done',
            dueDate: '2025-05-18',
            createdAt: '2025-05-01',
            priority: 'Low'
        }
    ]);
    const [searchQuery, setSearchQuery] = useState('');

    if (!project) {
        return (
            <div className="container-fluid py-4">
                <div className="alert" style={{ backgroundColor: styles.brandLight, color: 'white' }}>
                    No project selected. Please select a project from the sidebar.
                </div>
            </div>
        );
    }

    // Filter tasks based on search query
    const getFilteredTasks = () => {
        let filtered = [...tasks];

        // Apply search query if exists
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(task =>
                task.name.toLowerCase().includes(query) ||
                task.assignee.name.toLowerCase().includes(query) ||
                task.status.toLowerCase().includes(query) ||
                task.function.toLowerCase().includes(query)
            );
        }

        return filtered;
    };

    const handleAddTask = () => {
        // This would typically open a modal to add a new task
        alert('Add task functionality would open a form modal here');
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Done':
                return 'border-success text-white bg-success';
            case 'In Progress':
                return 'border-info text-white bg-info';
            case 'To Do':
            default:
                return 'border-warning text-white bg-warning';
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'High':
                return <span className="badge bg-danger text-xs text-white ms-2">High</span>;
            case 'Medium':
                return <span className="badge bg-warning text-xs text-white ms-2">Medium</span>;
            case 'Low':
                return <span className="badge bg-success text-xs text-white ms-2">Low</span>;
            default:
                return null;
        }
    };

    return (
        <div className="container-fluid py-4 px-5">
            <div className="row">
                <div className="col-12">
                    <div className="card card-background card-background-after-none align-items-start mt-4 mb-3">
                        <div className="full-background" style={{ backgroundImage: "url('/header-blue-purple.jpg')" }}></div>
                        <div className="card-body text-start p-4 w-100">
                            <h3 className="text-white mb-2">{project.name}</h3>
                            <p className="mb-4 font-weight-semibold">
                                {project.description}
                            </p>
                            {/*
                            <button type="button" className="btn btn-outline-white btn-blur btn-icon d-flex align-items-center mb-0">
                                <span className="btn-inner--icon">
                                    <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                                        className="d-block me-2">
                                        <path fillRule="evenodd" clipRule="evenodd"
                                            d="M7 14C10.866 14 14 10.866 14 7C14 3.13401 10.866 0 7 0C3.13401 0 0 3.13401 0 7C0 10.866 3.13401 14 7 14ZM6.61036 4.52196C6.34186 4.34296 5.99664 4.32627 5.71212 4.47854C5.42761 4.63081 5.25 4.92731 5.25 5.25V8.75C5.25 9.0727 5.42761 9.36924 5.71212 9.52149C5.99664 9.67374 6.34186 9.65703 6.61036 9.47809L9.23536 7.72809C9.47879 7.56577 9.625 7.2926 9.625 7C9.625 6.70744 9.47879 6.43424 9.23536 6.27196L6.61036 4.52196Z" />
                                    </svg>
                                </span>
                                <span className="btn-inner--text">View Details</span>
                            </button> */}
                            <Image src={Cube} alt="3d-cube" height={200} width={150}
                                className="position-absolute top-0 end-1 w-25 max-width-200 mt-n6 d-sm-block d-none" />
                        </div>
                    </div>
                    <div className="card shadow-lg">
                        <div className="card-body">
                            {/* Navigation Tabs */}
                            <div className="nav-wrapper position-relative mb-4 mt-3">
                                <ul className="nav nav-pills nav-fill p-1"
                                    role="tablist"
                                    style={{
                                        background: '#f8f9fa',
                                        borderRadius: '0.75rem',

                                    }}>
                                    <li className="nav-item">
                                        <a
                                            className={`nav-link ${activeTab === 'tasks' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('tasks')}
                                            role="tab"
                                            href="#"
                                            style={activeTab === 'tasks' ? {
                                                background: styles.brandGradient,
                                                color: 'white',
                                                borderRadius: '0.5rem'
                                            } : {}}
                                        >
                                            <i className="fas fa-tasks me-2"></i>Tasks
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a
                                            className={`nav-link ${activeTab === 'board' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('board')}
                                            role="tab"
                                            href="#"
                                            style={activeTab === 'board' ? {
                                                background: styles.brandGradient,
                                                color: 'white',
                                                borderRadius: '0.5rem'
                                            } : {}}
                                        >
                                            <i className="fas fa-columns me-2"></i>Board
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a
                                            className={`nav-link ${activeTab === 'summary' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('summary')}
                                            role="tab"
                                            href="#"
                                            style={activeTab === 'summary' ? {
                                                background: styles.brandGradient,
                                                color: 'white',
                                                borderRadius: '0.5rem'
                                            } : {}}
                                        >
                                            <i className="fas fa-chart-pie me-2"></i>Summary
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            {/* Content Area */}
                            {activeTab === 'tasks' && (
                                <div className="card border shadow-xs mb-4">
                                    <div className="card-body px-0 py-0">
                                        <div className="border-bottom py-3 px-3 d-sm-flex align-items-center">
                                            <div className="input-group w-sm-25 me-auto mt-3 mt-sm-0">
                                                <span className="input-group-text text-body">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="none" viewBox="0 0 24 24"
                                                        strokeWidth="1.5" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"></path>
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
                                            <button type="button" className="btn btn-sm btn-dark btn-icon d-flex align-items-center me-2">
                                                <span className="btn-inner--icon">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" className="bi bi-plus-lg" viewBox="0 0 16 16" style={{ marginRight: "5px" }}>
                                                        <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
                                                    </svg>
                                                </span>
                                                <span className="btn-inner--text">Add Task</span>
                                            </button>

                                        </div>
                                        <div className="table-responsive p-0">
                                            <table className="table align-items-center mb-0">
                                                <thead className="bg-gray-100">
                                                    <tr>
                                                        <th className="text-secondary text-xs font-weight-semibold opacity-7">Task</th>
                                                        <th className="text-secondary text-xs font-weight-semibold opacity-7 ps-2">Assigned To</th>
                                                        <th className="text-center text-secondary text-xs font-weight-semibold opacity-7">Status</th>
                                                        <th className="text-center text-secondary text-xs font-weight-semibold opacity-7">Due Date</th>
                                                        <th className="text-secondary opacity-7"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {getFilteredTasks().map((task) => (
                                                        <tr key={task.id}>
                                                            <td>
                                                                <div className="d-flex px-2 py-1">
                                                                    <div className="d-flex flex-column justify-content-center">
                                                                        <h6 className="mb-0 text-sm font-weight-semibold">{task.name}</h6>
                                                                        <p className="text-sm text-secondary mb-0">{task.function}</p>
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
                                                                        <h6 className="mb-0 text-sm font-weight-semibold">{task.assignee.name}</h6>
                                                                        <p className="text-sm text-secondary mb-0">{task.assignee.email}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="align-middle text-center text-sm">
                                                                <span className={`badge badge-sm border ${task.status === 'Done'
                                                                    ? 'border-success text-success bg-success'
                                                                    : task.status === 'In Progress'
                                                                        ? 'border-info text-info bg-info'
                                                                        : 'border-warning text-warning bg-warning'
                                                                    }`}>
                                                                    {task.status}
                                                                </span>
                                                            </td>
                                                            <td className="align-middle text-center">
                                                                <span className="text-secondary text-sm font-weight-normal">{task.dueDate}</span>
                                                            </td>
                                                            <td className="align-middle">
                                                                <a href="#" className="text-secondary font-weight-bold text-xs" data-bs-toggle="tooltip"
                                                                    data-bs-title="Edit task">
                                                                    <svg width="14" height="14" viewBox="0 0 15 16" fill="none"
                                                                        xmlns="http://www.w3.org/2000/svg">
                                                                        <path
                                                                            d="M11.2201 2.02495C10.8292 1.63482 10.196 1.63545 9.80585 2.02636C9.41572 2.41727 9.41635 3.05044 9.80726 3.44057L11.2201 2.02495ZM12.5572 6.18502C12.9481 6.57516 13.5813 6.57453 13.9714 6.18362C14.3615 5.79271 14.3609 5.15954 13.97 4.7694L12.5572 6.18502ZM11.6803 1.56839L12.3867 2.2762L12.3867 2.27619L11.6803 1.56839ZM14.4302 4.31284L15.1367 5.02065L15.1367 5.02064L14.4302 4.31284ZM3.72198 15V16C3.98686 16 4.24091 15.8949 4.42839 15.7078L3.72198 15ZM0.999756 15H-0.000244141C-0.000244141 15.5523 0.447471 16 0.999756 16L0.999756 15ZM0.999756 12.2279L0.293346 11.5201C0.105383 11.7077 -0.000244141 11.9624 -0.000244141 12.2279H0.999756ZM9.80726 3.44057L12.5572 6.18502L13.97 4.7694L11.2201 2.02495L9.80726 3.44057ZM12.3867 2.27619C12.7557 1.90794 13.3549 1.90794 13.7238 2.27619L15.1367 0.860593C13.9869 -0.286864 12.1236 -0.286864 10.9739 0.860593L12.3867 2.27619ZM13.7238 2.27619C14.0917 2.64337 14.0917 3.23787 13.7238 3.60504L15.1367 5.02064C16.2875 3.8721 16.2875 2.00913 15.1367 0.860593L13.7238 2.27619ZM13.7238 3.60504L3.01557 14.2922L4.42839 15.7078L15.1367 5.02065L13.7238 3.60504ZM3.72198 14H0.999756V16H3.72198V14ZM1.99976 15V12.2279H-0.000244141V15H1.99976ZM1.70617 12.9357L12.3867 2.2762L10.9739 0.86059L0.293346 11.5201L1.70617 12.9357Z"
                                                                            fill="#64748B" />
                                                                    </svg>
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    ))}

                                                    {getFilteredTasks().length === 0 && (
                                                        <tr>
                                                            <td colSpan="5" className="text-center py-4">
                                                                <p className="text-sm mb-0">No tasks found matching your criteria.</p>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                    </div>
                                </div>
                            )}

                            {activeTab === 'board' && (
                                <div className="card border shadow-xs p-3">
                                    <h6 className="mb-4">Board View</h6>
                                    <p className="text-muted">This section will contain the Kanban-style board view showing tasks in To Do, In Progress, and Done columns.</p>
                                </div>
                            )}

                            {activeTab === 'summary' && (
                                <div className="card border shadow-xs p-3">
                                    <h6 className="mb-4">Project Summary</h6>
                                    <p className="text-muted">This section will contain reports and graphs showing project progress statistics.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectTab;