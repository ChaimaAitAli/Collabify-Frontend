import Image from "next/image";
import Link from "next/link";
import "@/assets/css/nucleo-icons.css";
import "@/assets/css/nucleo-svg.css";
import "@/assets/css/corporate-ui-dashboard.css?v=1.0.0";
import logo from "@/assets/img/CollabifyMauve-removebg.png";
import Navbar from "./Navbar";


const DashboardTab = ({ user }) => {
    return (
        <>
            <div className="container-fluid py-4 px-5">
                <div className="row">
                    <div className="col-md-12">
                        <div className="d-md-flex align-items-center mb-3 mx-2">
                            <div className="mb-md-0 mb-3">
                                <h3 className="font-weight-bold mb-0">{`Hello, ${user.firstName}`}</h3>
                                <p className="mb-0">Let's get some work done!</p>
                            </div>
                            <button type="button" className="btn btn-sm btn-white btn-icon d-flex align-items-center mb-0 ms-md-auto mb-sm-0 mb-2 me-2">
                                <span className="btn-inner--icon">
                                    <span className="p-1 bg-success rounded-circle d-flex ms-auto me-2">
                                        <span className="visually-hidden">New</span>
                                    </span>
                                </span>
                                <span className="btn-inner--text">Messages</span>
                            </button>
                            <button type="button" className="btn btn-sm btn-dark btn-icon d-flex align-items-center mb-0">
                                <span className="btn-inner--icon">
                                    <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="d-block me-2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                    </svg>
                                </span>
                                <span className="btn-inner--text">Sync</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>

    )
}
export default DashboardTab;