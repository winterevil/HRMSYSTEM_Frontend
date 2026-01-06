"use client";

import React, { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

const LUNAR_NEW_YEAR: Record<number, string> = {
    2024: "2024-02-10",
    2025: "2025-01-29",
    2026: "2026-02-17",
    2027: "2027-02-06",
    2028: "2028-01-26",
    2029: "2029-02-13",
    2030: "2030-02-03",
};

type Holiday = {
    date: string;
    localName: string;
    name: string;
    source: "SOLAR" | "LUNAR";
};

function getTetHolidays(year: number): string[] {
    const start = LUNAR_NEW_YEAR[year];
    if (!start) return [];

    const base = new Date(start);
    const result: string[] = [];

    for (let i = 0; i < 5; i++) {
        const d = new Date(base);
        d.setDate(d.getDate() + i);
        result.push(d.toISOString().slice(0, 10));
    }

    return result;
}

export default function CalendarPage() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);

    useEffect(() => {
        fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/VN`)
            .then((res) => res.json())
            .then((data) => {
                const solar: Holiday[] = data.map((h: any) => ({
                    date: h.date,
                    localName: h.localName,
                    name: h.name,
                    source: "SOLAR",
                }));

                const tetDates = getTetHolidays(year);
                const lunar: Holiday[] = tetDates.map((d, idx) => ({
                    date: d,
                    localName: `Tết Nguyên Đán`,
                    name: "Lunar New Year",
                    source: "LUNAR",
                }));

                const merged = [...solar, ...lunar].sort(
                    (a, b) =>
                        new Date(a.date).getTime() - new Date(b.date).getTime()
                );

                setHolidays(merged);
            });
    }, [year]);

    const events = useMemo(
        () =>
            holidays.map((h) => ({
                title: h.name,
                start: h.date,
                allDay: true,
                extendedProps: h,
                backgroundColor: h.source === "LUNAR" ? "#e83e8c" : "#dc3545",
                borderColor: h.source === "LUNAR" ? "#e83e8c" : "#dc3545",
            })),
        [holidays]
    );

    return (
        <>
            <div className="section-body">
                <div className="container-fluid">
                    <div className="row clearfix row-deck">

                        <div className="col-lg-4 col-md-12">
                            <div className="card">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between mb-3">
                                        <h3 className="card-title">Holidays</h3>
                                        <select
                                            className="form-control w-auto"
                                            value={year}
                                            onChange={(e) => setYear(Number(e.target.value))}
                                        >
                                            {[2024, 2025, 2026, 2027, 2028].map((y) => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <ul className="list-group">
                                        {holidays.map((h, i) => (
                                            <li
                                                key={i}
                                                className="list-group-item d-flex justify-content-between align-items-center"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => setSelectedHoliday(h)}
                                            >
                                                <span
                                                    style={{
                                                        fontWeight: h.source === "LUNAR" ? 600 : 600,
                                                        color: h.source === "LUNAR" ? "#e83e8c" : "#212529",
                                                    }}
                                                >
                                                    {h.name}
                                                    
                                                </span>

                                                <span
                                                    className="badge badge-danger"
                                                    style={{
                                                        minWidth: "90px",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {new Intl.DateTimeFormat("vi-VN", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                    }).format(new Date(h.date))}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-8 col-md-12">
                            <div className="card">
                                <div className="card-body">
                                    <FullCalendar
                                        plugins={[dayGridPlugin, interactionPlugin]}
                                        initialView="dayGridMonth"
                                        initialDate={`${year}-01-01`}
                                        locale="en"
                                        height={520}
                                        events={events}
                                        eventClick={(info) =>
                                            setSelectedHoliday(info.event.extendedProps)
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {selectedHoliday && (
                <>
                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            backgroundColor: "rgba(0,0,0,0.4)",
                            zIndex: 1050,
                        }}
                        onClick={() => setSelectedHoliday(null)}
                    />

                    {/* MODAL */}
                    <div
                        className="modal d-block"
                        style={{ position: "fixed", inset: 0, zIndex: 1055 }}
                    >
                        <div className="modal-dialog">
                            <div
                                className="modal-content"
                                style={{ backgroundColor: "#fff", color: "#212529" }}
                            >
                                <div className="modal-header">
                                    <h4 className="modal-title">Holiday Details</h4>
                                    <button
                                        className="close"
                                        onClick={() => setSelectedHoliday(null)}
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="modal-body">
                                    <p><strong>Name (VN):</strong> {selectedHoliday.localName}</p>
                                    <p><strong>Name (EN):</strong> {selectedHoliday.name}</p>
                                    <p>
                                        <strong>Date:</strong>{" "}
                                        {new Date(selectedHoliday.date).toLocaleDateString("vi-VN")}
                                    </p>
                                    <p>
                                        <strong>Type:</strong>{" "}
                                        {selectedHoliday.source === "LUNAR"
                                            ? "Lunar New Year"
                                            : "Public Holiday"}
                                    </p>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setSelectedHoliday(null)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
