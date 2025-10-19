import "./globals.css";

export const metadata = {
    title: "HR Management System",
    description: "HRMS application",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" dir="ltr">
            <body className="font-jakarta theme1">
                {children}
            </body>
        </html>
    );
}
