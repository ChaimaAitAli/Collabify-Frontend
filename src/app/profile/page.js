import Footer from '@/components/Profile/Footer'
import ProfileHeader from '@/components/Profile/ProfileHeader'
import UserHeader from '@/components/User/UserHeader'
import Navbar from '@/components/Profile/Navbar'
import NotificationsSettings from '@/components/User/NotificationsSettings'
import ProfileInfo from '@/components/User/ProfileInfo'
import InternalChat from '@/components/User/InternalChat'
import LastArticles from '@/components/Profile/LastArticles'
import "@/assets/css/nucleo-icons.css";
import "@/assets/css/nucleo-svg.css";
import "@/assets/css/corporate-ui-dashboard.css?v=1.0.0";


const ProfilePage = ({ user = {}, articles = [], chatMessages = [] }) => {
    // Default user values if not provided
    const defaultUser = {
        firstName: 'Noah',
        lastName: 'Mclaren',
        email: 'noah_mclaren@mail.com',
        avatar: '/team-2.jpg',
        coverImage: '/header-orange-purple.jpg',
        bio: "Hi, I'm Alec Thompson, Decisions: If you can't decide, the answer is no. If two equally difficult paths, choose the one more painful in the short term (pain avoidance is creating an illusion of equality).",
        mobile: '+(44) 123 1234 123',
        function: 'Manager - Organization',
        location: 'USA',
        social: {
            linkedin: '#',
            github: '#',
            slack: '#'
        }
    };

    // Merge provided user with default values
    const userInfo = { ...defaultUser, ...user };

    return (
        <div className="g-sidenav-show bg-gray-100">
            <div className="main-content position-relative bg-gray-100 max-height-vh-100 h-100">
                {/* Top Navigation */}
                <Navbar />

                {/* Profile Header with Cover Image */}
                <ProfileHeader user={userInfo} />

                {/* Main Content */}
                <div className="container my-3 py-3">
                    <div className="row">
                        {/* Left Column */}
                        <div className="col-12 col-xl-4 mb-4">
                            <NotificationsSettings />
                        </div>

                        {/* Middle Column */}
                        <div className="col-12 col-xl-4 mb-4">
                            <ProfileInfo user={userInfo} />
                        </div>

                        {/* Right Column */}
                        <div className="col-12 col-xl-4 mb-4">
                            <InternalChat messages={chatMessages} />
                        </div>

                        {/* Full Width Articles Section */}
                        <div className="col-12">
                            <LastArticles articles={articles} />
                        </div>
                    </div>

                    {/* Footer */}
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;