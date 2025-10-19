import "../globals.css";
import '@fortawesome/fontawesome-free/css/all.min.css'
import "../../public/assets/plugins/bootstrap/css/bootstrap.min.css";
import "../../public/assets/plugins/charts-c3/c3.min.css";
import "../../public/assets/plugins/jvectormap/jvectormap-2.0.3.css"; 
import "../../public/assets/css/main.css";
import "../../public/assets/css/theme1.css";
import HeaderTop from "../components/HeaderTop";
import ThemeSwitcher from "../components/ThemeSwitcher";
import UserPanel from "../components/UserPanel";
import SidebarLeft from "../components/sidebar/SidebarLeft";
import PageTop from "../components/PageTop";
import Footer from "../components/Footer";
import Script from "next/script";

export const metadata = {
    title: "MyHRM",
    description: "HRMS application",
    icons: {
        icon: "/logo.ico",
    },
};

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" dir="ltr">
            <body className="font-jakarta theme1">
                <div id="main_content">
                    <HeaderTop />
                    <ThemeSwitcher />
                    <UserPanel />
                    <SidebarLeft />
                    {/* NỘI DUNG TRANG */}
                    <div className="page">
                        <PageTop />
                        {children}
                        <Footer />
                    </div>
                </div>
                {/* JS vendor */}
                <Script src="/assets/bundles/lib.vendor.bundle.js" strategy="beforeInteractive" />
                <Script src="/assets/bundles/apexcharts.bundle.js" strategy="afterInteractive" />
                <Script src="/assets/bundles/counterup.bundle.js" strategy="afterInteractive" />
                <Script src="/assets/bundles/knobjs.bundle.js" strategy="afterInteractive" />
                <Script src="/assets/bundles/c3.bundle.js" strategy="afterInteractive" />
                <Script src="/assets/bundles/jvectormap1.bundle.css" strategy="afterInteractive" />

                {/* Core + custom page scripts */}
                <Script src="/assets/js/core.js" strategy="afterInteractive" />
                <Script src="/assets/js/page/index.js" strategy="afterInteractive" />
                <Script src="assets/js/page/job-index.js" strategy="afterInteractive" />"
                <Script src="/assets/js/page/theme1-js.js" strategy="afterInteractive" />
            </body>
        </html>
    );
}

