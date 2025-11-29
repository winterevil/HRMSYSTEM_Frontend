'use client';
import { sidebarData, SidebarItemType } from './SidebarData';
import SidebarItem from './SidebarItem';

export default function SidebarMenu() {
    return (
        <ul className="metismenu">
            {sidebarData.map((item: SidebarItemType, idx: number) => (
                <SidebarItem key={idx} item={item} />
            ))}
        </ul>
    );
}