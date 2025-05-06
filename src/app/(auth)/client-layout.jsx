'use client';

import { useEffect } from 'react';

export default function AuthClientLayout() {
    useEffect(() => {
        require('bootstrap/dist/js/bootstrap.bundle.min.js');
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }, []);

    return null;
}