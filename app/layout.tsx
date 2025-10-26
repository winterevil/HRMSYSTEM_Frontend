import "./globals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../public/assets/plugins/bootstrap/css/bootstrap.min.css";
import "../public/assets/plugins/charts-c3/c3.min.css";
import "../public/assets/plugins/jvectormap/jvectormap-2.0.3.css";
import "../public/assets/css/main.css";
import "../public/assets/css/theme1.css";
import Script from "next/script";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "HR Management System",
    description: "HRMS application built with Next.js",
    icons: {
        icon: "/logo.ico",
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" dir="ltr">
            <body className="font-jakarta theme1">
                {children}

                {/* JS vendor */}
                <Script src="/assets/bundles/lib.vendor.bundle.js" strategy="beforeInteractive" />
                <Script src="/assets/bundles/apexcharts.bundle.js" strategy="afterInteractive" />
                <Script src="/assets/bundles/counterup.bundle.js" strategy="afterInteractive" />
                <Script src="/assets/bundles/knobjs.bundle.js" strategy="afterInteractive" />
                <Script src="/assets/bundles/c3.bundle.js" strategy="afterInteractive" />

                {/* Core + custom page scripts */}
                <Script src="/assets/js/core.js" strategy="afterInteractive" />
                <Script src="/assets/js/page/index.js" strategy="afterInteractive" />
                <Script src="/assets/js/page/job-index.js" strategy="afterInteractive" />
                <Script src="/assets/js/page/theme1-js.js" strategy="afterInteractive" />
            </body>
        </html>
    );
}
