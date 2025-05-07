import Image from "next/image";
import "@/assets/css/nucleo-icons.css";
import "@/assets/css/nucleo-svg.css";
import "@/assets/css/corporate-ui-dashboard.css?v=1.0.0";
import ChatMessage from "./ChatMessage";

const InternalChat = () => {
    const chatUsers = [
        {
            name: 'Sarah Lamalo',
            message: 'Hi! I need more information about ...',
            avatar: '/team-1.jpg',
            online: true
        },
        {
            name: 'Vicky Hladynets',
            message: 'Hello, Noah!',
            avatar: '/marie.jpg',
            online: false
        },
        {
            name: 'Charles Deluvio',
            message: 'Great, thank you!',
            avatar: '/team-5.jpg',
            online: true
        },
        {
            name: 'Leio Mclaren',
            message: 'Don\'t worry! 🙏🏻',
            avatar: '/team-4.jpg',
            online: false
        },
        {
            name: 'Mateus Campos',
            message: 'Call me, please.',
            avatar: '/team-3.jpg',
            online: true
        },
        {
            name: 'Miriam Lore',
            message: 'Well done!',
            avatar: '/team-2.jpg',
            online: true
        }
    ];

    return (
        <div className="card border shadow-xs h-100">
            <div className="card-header pb-0 p-3">
                <div className="row mb-sm-0 mb-2">
                    <div className="col-md-8 col-9">
                        <h6 className="mb-0 font-weight-semibold text-lg">Internal chat</h6>
                        <p className="text-sm mb-0">/marketing channel</p>
                    </div>
                    <div className="col-md-4 col-3 text-end">
                        <button type="button" className="btn btn-white btn-icon px-2 py-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path fillRule="evenodd" d="M10.5 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <div className="card-body p-3 pt-0">
                <ul className="list-group">
                    {chatUsers.map((user, index) => (
                        <ChatMessage key={index} user={user} />
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default InternalChat;