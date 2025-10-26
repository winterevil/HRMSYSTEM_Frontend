export const metadata = {
    title: "Login Page",
    description: "MyHRM Login Page",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="auth-wrapper">
            {children}
        </div>
    );
}
