'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import "@/assets/css/nucleo-icons.css";
import "@/assets/css/nucleo-svg.css";
import "@/assets/css/corporate-ui-dashboard.css?v=1.0.0";
import "@/assets/css/corporate-ui-dashboard.min.css";
import team3 from "@/assets/img/team-3.jpg";
import team4 from "@/assets/img/team-4.jpg";
import team1 from "@/assets/img/team-1.jpg";
import google from "@/assets/img/logos/google-logo.svg";

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        agreeTerms: false
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add your registration logic here
        console.log('Form submitted:', formData);
    };

    return (
        <main className="main-content mt-0">
            <section>
                <div className="page-header min-vh-100">
                    <div className="container">
                        <div className="row">
                            {/* Left side with background image */}
                            <div className="col-md-6">
                                <div className="position-absolute w-40 top-0 start-0 h-100 d-md-block d-none">
                                    <div className="position-absolute d-flex fixed-top ms-auto h-100 z-index-0 bg-cover me-n8"
                                        style={{
                                            backgroundImage: `url(/image-sign-up.jpg)`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center'
                                        }}>
                                        <div className="my-auto text-start max-width-350 ms-7">
                                            <h1 className="mt-3 text-white font-weight-bolder">Start your <br /> new journey.</h1>
                                            <p className="text-white text-lg mt-4 mb-4">Collaborate with your team members on innovative projects with ease.</p>
                                            <div className="d-flex align-items-center">
                                                <div className="avatar-group d-flex">
                                                    <a href="#" className="avatar avatar-sm rounded-circle">
                                                        <Image src={team3} alt="Team member" width={32} height={32} className="rounded-circle" />
                                                    </a>
                                                    <a href="#" className="avatar avatar-sm rounded-circle">
                                                        <Image src={team4} alt="Team member" width={32} height={32} className="rounded-circle" />
                                                    </a>
                                                    <a href="#" className="avatar avatar-sm rounded-circle">
                                                        <Image src={team1} alt="Team member" width={32} height={32} className="rounded-circle" />
                                                    </a>
                                                </div>
                                                <p className="font-weight-bold text-white text-sm mb-0 ms-2">Join 2.5M+ users</p>
                                            </div>
                                        </div>
                                        <div className="text-start position-absolute fixed-bottom ms-7 mb-4">
                                            <h6 className="text-white text-sm mb-5">Copyright © 2025 Collabify.</h6>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right side with form */}
                            <div className="col-md-4 d-flex flex-column mx-auto">
                                <div className="card card-plain mt-7">
                                    <div className="card-header pb-0 text-left bg-transparent">
                                        <h3 className="font-weight-black text-dark display-6">Sign up</h3>
                                        <p className="mb-0">Nice to meet you! Please enter your details.</p>
                                    </div>
                                    <div className="card-body">
                                        <form role="form" onSubmit={handleSubmit}>
                                            <label>Name</label>
                                            <div className="mb-3">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Enter your name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <label>Email Address</label>
                                            <div className="mb-3">
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    placeholder="Enter your email address"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <label>Password</label>
                                            <div className="mb-3">
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    placeholder="Create a password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="form-check form-check-info text-left mb-0">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    name="agreeTerms"
                                                    checked={formData.agreeTerms}
                                                    onChange={handleInputChange}
                                                    id="flexCheckDefault"
                                                />
                                                <label className="font-weight-normal text-dark mb-0" htmlFor="flexCheckDefault">
                                                    I agree the <a href="#" className="text-dark font-weight-bold">Terms and Conditions</a>.
                                                </label>
                                            </div>
                                            <div className="text-center">
                                                <button type="submit" className="btn btn-dark w-100 mt-4 mb-3">Sign up</button>
                                                <button type="button" className="btn btn-white btn-icon w-100 mb-3">
                                                    <span className="btn-inner--icon me-1">
                                                        <Image src={google} alt="google-logo" width={20} height={20} className="w-5" />
                                                    </span>
                                                    <span className="btn-inner--text">Sign up with Google</span>
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                    <div className="card-footer text-center pt-0 px-lg-2 px-1">
                                        <p className="mb-4 text-xs mx-auto">
                                            Already have an account?
                                            <Link href="/login" className="text-dark font-weight-bold ms-1">Sign in</Link>
                                        </p>
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