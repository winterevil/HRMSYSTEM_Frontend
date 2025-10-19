import type { Metadata } from "next";
import "../globals.css";
import '@fortawesome/fontawesome-free/css/all.min.css'
import "../../public/assets/plugins/bootstrap/css/bootstrap.min.css";
import "../../public/assets/css/main.css";
import "../../public/assets/css/theme1.css";
import Script from "next/script";

export const metadata: Metadata = {
    title: "Login Page",
    description: "MyHRM Dashboard built with Next.js and TailwindCSS",
    icons: {
        icon: "/logo.ico",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" dir="ltr">
            <body className="font-jakarta theme1">
                {children}
                {/* JS vendor */}
                <Script src="/assets/bundles/lib.vendor.bundle.js" strategy="beforeInteractive" />

                {/* Core + custom page scripts */}
                <Script src="/assets/js/core.js" strategy="afterInteractive" />
            </body>
        </html>
    );
}

