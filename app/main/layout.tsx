import HeaderTop from "../components/HeaderTop";
import ThemeSwitcher from "../components/ThemeSwitcher";
import UserPanel from "../components/UserPanel";
import SidebarLeft from "../components/sidebar/SidebarLeft";
import PageTop from "../components/PageTop";
import Footer from "../components/Footer";

export const metadata = {
    title: "MyHRM Dashboard",
    description: "HRMS application main layout",
};

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div id="main_content">
            <HeaderTop />
            <ThemeSwitcher />
            <UserPanel />
            <SidebarLeft />
            <div className="page">
                <PageTop />
                {children}
                <Footer />
            </div>
        </div>
    );
}
