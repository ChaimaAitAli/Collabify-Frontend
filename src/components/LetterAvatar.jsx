// LetterAvatar.jsx
import React from 'react';

const LetterAvatar = ({ name, size = 'sm' }) => {
    // Get first letter of the name
    const firstLetter = name && name.length > 0 ? name.charAt(0).toUpperCase() : '?';

    // Generate a deterministic color based on the name
    const generateColor = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }

        // Generate different hues (in HSL color space)
        const hue = hash % 360;
        return `hsl(${hue}, 70%, 60%)`;
    };

    // Map size to Bootstrap-compatible dimensions
    const getSizeDimensions = (size) => {
        switch (size) {
            case 'xs': return { width: '24px', height: '24px', fontSize: '0.75rem' };
            case 'sm': return { width: '32px', height: '32px', fontSize: '0.875rem' };
            case 'md': return { width: '40px', height: '40px', fontSize: '1rem' };
            case 'lg': return { width: '48px', height: '48px', fontSize: '1.25rem' };
            case 'xl': return { width: '64px', height: '64px', fontSize: '1.5rem' };
            default: return { width: '32px', height: '32px', fontSize: '0.875rem' };
        }
    };

    const color = generateColor(name || 'unknown');
    const dimensions = getSizeDimensions(size);

    // Bootstrap styling with inline styles for the circle
    const avatarStyle = {
        backgroundColor: color,
        color: 'white',
        width: dimensions.width,
        height: dimensions.height,
        borderRadius: '50%', // Make it circular
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '500',
        fontSize: dimensions.fontSize,
        marginRight: "6px"
    };

    return (
        <div style={avatarStyle} className="avatar-letter">
            {firstLetter}
        </div>
    );
};

export default LetterAvatar;