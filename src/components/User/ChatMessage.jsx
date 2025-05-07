import React from 'react';
import Image from 'next/image';

const ChatMessage = ({ user }) => {
    return (
        <li className="list-group-item border-0 d-flex align-items-center px-0 mb-1">
            <div className="avatar avatar-sm rounded-circle me-2">
                <Image src={user.avatar} alt={user.name} width={36} height={32} className="w-100" />
            </div>
            <div className="d-flex align-items-start flex-column justify-content-center">
                <h6 className="mb-0 text-sm font-weight-semibold">{user.name}</h6>
                <p className="mb-0 text-sm text-secondary">{user.message}</p>
            </div>
            {user.online && (
                <span className="p-1 bg-success rounded-circle ms-auto me-3">
                    <span className="visually-hidden">Online</span>
                </span>
            )}
        </li>
    );
};

export default ChatMessage;
