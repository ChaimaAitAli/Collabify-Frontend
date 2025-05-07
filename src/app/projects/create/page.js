'use client';

import { useState } from 'react';
import "@/assets/css/nucleo-icons.css";
import "@/assets/css/nucleo-svg.css";
import "@/assets/css/corporate-ui-dashboard.css?v=1.0.0";

export default function CreateProject() {
    const [formData, setFormData] = useState({
        projectName: '',
        visibility: 'public',
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.projectName.trim()) {
            newErrors.projectName = 'Project name is required';
        }

        if (!formData.visibility) {
            newErrors.visibility = 'Visibility is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            setIsSubmitting(true);
            try {
                // Simulate API call
                console.log('Creating project:', formData);
                await new Promise(resolve => setTimeout(resolve, 1000));
                // Optionally redirect or show success
            } catch (error) {
                console.error('Error creating project:', error);
                setErrors({ form: 'Failed to create the project. Please try again.' });
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <main className="main-content mt-0">
            <section>
                <div className="page-header min-vh-100">
                    <div className="container">
                        <div className="row justify-content-center align-items-center min-vh-100">
                            <div className="col-xl-4 col-md-6 col-12 d-flex flex-column mx-auto">
                                <div className="card card-plain mt-7">
                                    <div className="card-header pb-0 text-left bg-transparent">
                                        <h3 className="font-weight-black text-dark display-6">Create Project</h3>
                                        <p className="mb-0">Please enter the details of the new project</p>
                                        {errors.form && (
                                            <div className="alert alert-danger text-white mt-2" role="alert">
                                                {errors.form}
                                            </div>
                                        )}
                                    </div>
                                    <div className="card-body">
                                        <form onSubmit={handleSubmit}>
                                            <label>Project Name</label>
                                            <div className="mb-3">
                                                <input
                                                    type="text"
                                                    name="projectName"
                                                    className={`form-control ${errors.projectName ? 'is-invalid' : ''}`}
                                                    placeholder="Enter project name"
                                                    value={formData.projectName}
                                                    onChange={handleChange}
                                                />
                                                {errors.projectName && <div className="invalid-feedback">{errors.projectName}</div>}
                                            </div>

                                            <label>Visibility</label>
                                            <div className="mb-3">
                                                <select
                                                    name="visibility"
                                                    className={`form-control custom-select ${errors.visibility ? 'is-invalid' : ''}`}
                                                    value={formData.visibility}
                                                    onChange={handleChange}
                                                >
                                                    <option value="public">Public</option>
                                                    <option value="private">Private</option>
                                                </select>
                                                {errors.visibility && <div className="invalid-feedback">{errors.visibility}</div>}
                                            </div>

                                            <div className="text-center">
                                                <button
                                                    type="submit"
                                                    className="btn btn-dark w-100 mt-4 mb-3"
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? 'Creating...' : 'Create Project'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6 d-none d-md-block">
                                <div className="position-absolute w-40 top-0 end-0 h-100">
                                    <div
                                        className="oblique-image position-absolute fixed-top ms-auto h-100 z-index-0 bg-cover ms-n8"
                                        style={{
                                            backgroundImage: "url('/image-sign-in.jpg')",
                                            backgroundPosition: "center",
                                            backgroundSize: "cover"
                                        }}
                                    >
                                        <div className="mt-10 p-4 text-start max-width-700 position-absolute m-8">
                                            <h1 className="mt-3 text-white font-weight-bolder">Collaborate & Innovate</h1>
                                            <p className="text-white font-weight-bold text-lg mt-2 mb-4">
                                                Create your next project and lead your agile team to success.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
