export interface SidebarChild {
    title: string;
    link?: string;
}

export interface SidebarItemType {
    title: string;
    icon?: string;        
    link?: string;       
    children?: SidebarChild[];
}

export const sidebarData: SidebarItemType[] = [
    {
        title: "HRMS",
        icon: "fa-solid fa-users-gear",
        children: [
            { title: "Dashboard", link: "/main/hrms/dashboard" },
            { title: "Employee Type", link: "/main/hrms/employee-type" },
            { title: "Departments", link: "/main/hrms/department" },
            { title: "Employee", link: "/main/hrms/employee" }
        ]
    },
    {
        title: "Request",
        icon: "fa-solid fa-clipboard-list",
        children: [
            { title: "Overtime", link: "/main/request/overtime" },
            { title: "Leave", link: "/main/request/leave" },
            { title: "Attendance", link: "/main/request/attendance" }
        ]
    },
    {
        title: "Job Portal",
        icon: "fa-solid fa-briefcase",
        children: [
            { title: "Job Dashboard", link: "/main/job-portal/dashboard" },
            { title: "Positions", link: "/main/job-portal/position" },
            { title: "Recruitments", link: "/main/job-portal/recruitment" },
            { title: "Job Post", link: "/main/job-portal/job-post" }
        ]
    }
    //{
    //    title: "Authentication",
    //    icon: "fa-solid fa-lock",
    //    children: [
    //        { title: "Login", link: "/auth/login" },
    //        { title: "Forgot password", link: "/auth/forgot-password" }
    //    ]
    //}
];