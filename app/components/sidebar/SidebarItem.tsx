"use client";
import Link from "next/link";
import { SidebarItemType, SidebarChild } from "./SidebarData";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface Props {
    item: SidebarItemType;
    activeMenu: string | null;
    setActiveMenu: (menu: string | null) => void;
}

export default function SidebarItem({ item, activeMenu, setActiveMenu }: Props) {
    const pathname = usePathname();
    const hasChildren = item.children && item.children.length > 0;

    useEffect(() => {
        if (hasChildren && item.children!.some(child => child.link === pathname)) {
            setActiveMenu(item.title);
        }
    }, [pathname]);

    const isOpen = activeMenu === item.title;

    const toggleMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setActiveMenu(isOpen ? null : item.title);
    };

    return (
        <li className={isOpen ? "active" : ""}>
            {hasChildren ? (
                <a href="#" onClick={toggleMenu} className="has-arrow arrow-c">
                    {item.icon && <i className={item.icon}></i>}
                    <span>{item.title}</span>
                </a>
            ) : (
                <Link href={item.link || "#"}>
                    {item.icon && <i className={item.icon}></i>}
                    <span>{item.title}</span>
                </Link>
            )}

            {hasChildren && (
                <ul style={{ display: isOpen ? "block" : "none" }}>
                    {item.children!.map((child: SidebarChild, idx: number) => (
                        <li key={idx} className={pathname === child.link ? "active" : ""}>
                            <Link href={child.link || "#"}>
                                <span>{child.title}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </li>
    );
}
