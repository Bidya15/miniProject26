import { useState, useEffect } from "react";
import styles from "../pages/Home.module.css";

export default function QuickWidgets() {
    return (
        <div className={styles.widgetsWrapper}>
            <LiveClock />
            <MiniCalendar />
        </div>
    );
}

function LiveClock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const hours24 = time.getHours();
    const ampm = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 || 12;
    const hh = hours12.toString().padStart(2, '0');
    const mm = time.getMinutes().toString().padStart(2, '0');
    const ss = time.getSeconds().toString().padStart(2, '0');

    const dayName = time.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div className={styles.widgetGlass}>
            <div className={styles.clockTime}>
                {hh}:{mm}<span className={styles.clockSec}>{ss}</span>
                <span className={styles.clockAmpm}>{ampm}</span>
            </div>
            <div className={styles.clockDate}>
                {dayName}, {dateStr}
            </div>
        </div>
    );
}

function MiniCalendar() {
    const [viewDate, setViewDate] = useState(new Date());
    const today = new Date();

    const monthName = viewDate.toLocaleString('default', { month: 'long' });
    const year = viewDate.getFullYear();

    // Navigation Handlers
    const changeMonth = (offset) => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
    };

    const changeYear = (offset) => {
        setViewDate(new Date(viewDate.getFullYear() + offset, viewDate.getMonth(), 1));
    };

    const resetToToday = () => setViewDate(new Date());

    // Calendar Grid Logic
    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <div className={styles.widgetGlass}>
            <div className={styles.miniCalendar}>
                <div className={styles.calNav}>
                    <button onClick={() => changeYear(-1)} className={styles.calBtn} title="Previous Year">«</button>
                    <button onClick={() => changeMonth(-1)} className={styles.calBtn} title="Previous Month">‹</button>

                    <div className={styles.calTitle} onClick={resetToToday} title="Click to reset to today">
                        <span className={styles.calMonth}>{monthName}</span>
                        <span className={styles.calYear}>{year}</span>
                    </div>

                    <button onClick={() => changeMonth(1)} className={styles.calBtn} title="Next Month">›</button>
                    <button onClick={() => changeYear(1)} className={styles.calBtn} title="Next Year">»</button>
                </div>

                <div className={styles.calWeekdays}>
                    {weekdays.map((w, i) => <div key={i} className={styles.calWd}>{w}</div>)}
                </div>
                <div className={styles.calGrid}>
                    {days.map((d, i) => {
                        const isToday = d === today.getDate() &&
                            viewDate.getMonth() === today.getMonth() &&
                            viewDate.getFullYear() === today.getFullYear();
                        return (
                            <div
                                key={i}
                                className={`${styles.calDay} ${isToday ? styles.calToday : ""} ${d === null ? styles.calDayEmpty : ""}`}
                            >
                                {d}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
