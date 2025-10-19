"use client";
import { useState } from "react";
import SidebarItem from "./SidebarItem";
import { sidebarData } from "./SidebarData";

export default function SidebarLeft() {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    return (
        <div id="left-sidebar" className="sidebar">
            <h5 className="brand-name">My HRM</h5>
            <nav id="left-sidebar-nav" className="sidebar-nav">
                <ul className="metismenu">
                    {sidebarData.map((item, idx) => (
                        <SidebarItem
                            key={idx}
                            item={item}
                            activeMenu={activeMenu}
                            setActiveMenu={setActiveMenu}
                        />
                    ))}
                </ul>
            </nav>
        </div>
    );
}
