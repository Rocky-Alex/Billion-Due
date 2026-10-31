import React, { useState, useEffect, useRef } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerDropdownProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  isDueDate?: boolean;
  minDate?: string;
}

function parseDate(val: string): Date {
  if (!val) return new Date();
  // check MM/DD/YYYY or M/D/YYYY
  const parts = val.split(/[/.-]/);
  if (parts.length === 3) {
    const p0 = parseInt(parts[0], 10);
    const p1 = parseInt(parts[1], 10);
    const p2 = parseInt(parts[2], 10);
    if (p2 >= 1000 && p0 >= 1 && p0 <= 12 && p1 >= 1 && p1 <= 31) {
      return new Date(p2, p0 - 1, p1);
    }
    if (p0 >= 1000 && p1 >= 1 && p1 <= 12 && p2 >= 1 && p2 <= 31) {
      return new Date(p0, p1 - 1, p2);
    }
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
}

function formatDate(date: Date): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const y = date.getFullYear();
  return `${m}/${d}/${y}`;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_HEADER = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function DatePickerDropdown({
  label,
  value,
  onChange,
  isDueDate = false,
}: DatePickerDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse currently selected date
  const selectedDate = parseDate(value);

  // Month & year currently viewed in the calendar
  const [viewYear, setViewYear] = useState(() => selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => selectedDate.getMonth());

  // Keep view in sync when selected date changes externally
  useEffect(() => {
    const d = parseDate(value);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }, [value]);

  // Click outside listener to close calendar popover
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Navigation handlers
  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Day click handler
  const handleSelectDay = (day: number) => {
    const newD = new Date(viewYear, viewMonth, day);
    onChange(formatDate(newD));
    setIsOpen(false);
  };

  // Quick preset apply
  const applyPresetDays = (daysOffset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    onChange(formatDate(d));
    setIsOpen(false);
  };

  const applyEndOfMonth = () => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    onChange(formatDate(end));
    setIsOpen(false);
  };

  // Build grid of days
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const today = new Date();
  const isCurrentMonthToday =
    today.getFullYear() === viewYear && today.getMonth() === viewMonth;
  const isCurrentMonthSelected =
    selectedDate.getFullYear() === viewYear &&
    selectedDate.getMonth() === viewMonth;

  return (
    <div
      ref={containerRef}
      className="date-picker-wrap"
      style={{ position: "relative", display: "inline-block" }}
    >
      <label
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          color: "#64748b",
          fontWeight: 600,
          fontSize: 11,
          textAlign: "left",
        }}
      >
        <span>{label}</span>
        <div
          className="date-picker-input-wrap"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onClick={() => setIsOpen(true)}
            placeholder="MM/DD/YYYY"
            style={{
              padding: "4px 28px 4px 8px",
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 500,
              width: 108,
              cursor: "pointer",
              background: "#ffffff",
              boxSizing: "border-box",
            }}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen((o) => !o);
            }}
            title="Open dropdown calendar"
            style={{
              position: "absolute",
              right: 4,
              border: 0,
              background: "transparent",
              cursor: "pointer",
              padding: "2px 4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isOpen ? "#047857" : "#64748b",
            }}
          >
            <Calendar size={13} />
          </button>
        </div>
      </label>

      {/* Floating Dropdown Calendar Popover */}
      {isOpen && (
        <div
          className="date-picker-popover"
          style={{
            position: "absolute",
            top: "calc(100% + 5px)",
            right: 0,
            zIndex: 1050,
            width: 250,
            background: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: 12,
            boxShadow:
              "0 12px 30px -4px rgba(15, 23, 42, 0.2), 0 4px 10px -2px rgba(15, 23, 42, 0.08)",
            padding: "12px",
            boxSizing: "border-box",
            color: "#0f172a",
          }}
        >
          {/* Quick Presets for Rapid Date Choosing */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 4,
              marginBottom: 10,
              paddingBottom: 8,
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <button
              type="button"
              onClick={() => applyPresetDays(0)}
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "3px 7px",
                borderRadius: 5,
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                cursor: "pointer",
                color: "#334155",
              }}
            >
              Today
            </button>
            {isDueDate ? (
              <>
                <button
                  type="button"
                  onClick={() => applyPresetDays(7)}
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "3px 7px",
                    borderRadius: 5,
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    cursor: "pointer",
                    color: "#334155",
                  }}
                  title="Net 7 Days"
                >
                  +7 Days
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetDays(14)}
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "3px 7px",
                    borderRadius: 5,
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    cursor: "pointer",
                    color: "#334155",
                  }}
                  title="Net 14 Days"
                >
                  +14 Days
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetDays(30)}
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "3px 7px",
                    borderRadius: 5,
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    cursor: "pointer",
                    color: "#334155",
                  }}
                  title="Net 30 Days"
                >
                  +30 Days
                </button>
                <button
                  type="button"
                  onClick={applyEndOfMonth}
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "3px 7px",
                    borderRadius: 5,
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    cursor: "pointer",
                    color: "#334155",
                  }}
                  title="End of current month"
                >
                  Month-end
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => applyPresetDays(-1)}
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "3px 7px",
                    borderRadius: 5,
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    cursor: "pointer",
                    color: "#334155",
                  }}
                >
                  Yesterday
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    const first = new Date(now.getFullYear(), now.getMonth(), 1);
                    onChange(formatDate(first));
                    setIsOpen(false);
                  }}
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "3px 7px",
                    borderRadius: 5,
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    cursor: "pointer",
                    color: "#334155",
                  }}
                >
                  1st of Month
                </button>
              </>
            )}
          </div>

          {/* Month & Year Header Controls */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <button
              type="button"
              onClick={prevMonth}
              style={{
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                borderRadius: 6,
                padding: "3px 6px",
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
                color: "#475569",
              }}
              title="Previous month"
            >
              <ChevronLeft size={13} />
            </button>

            <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              style={{
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                borderRadius: 6,
                padding: "3px 6px",
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
                color: "#475569",
              }}
              title="Next month"
            >
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Days of Week Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              textAlign: "center",
              fontSize: 10,
              fontWeight: 700,
              color: "#94a3b8",
              marginBottom: 6,
            }}
          >
            {DAYS_HEADER.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 2,
            }}
          >
            {/* Trailing days of previous month */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => {
              const prevDay = daysInPrevMonth - firstDayOfWeek + i + 1;
              return (
                <div
                  key={`prev-${i}`}
                  style={{
                    height: 28,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 10,
                    color: "#cbd5e1",
                  }}
                >
                  {prevDay}
                </div>
              );
            })}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected =
                isCurrentMonthSelected && selectedDate.getDate() === day;
              const isToday = isCurrentMonthToday && today.getDate() === day;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  style={{
                    height: 28,
                    width: "100%",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 11,
                    fontWeight: isSelected || isToday ? 700 : 500,
                    borderRadius: 6,
                    border: isSelected
                      ? "1px solid #047857"
                      : isToday
                      ? "1px solid #94a3b8"
                      : "1px solid transparent",
                    background: isSelected
                      ? "#047857"
                      : isToday
                      ? "#f1f5f9"
                      : "transparent",
                    color: isSelected
                      ? "#ffffff"
                      : isToday
                      ? "#0f172a"
                      : "#334155",
                    cursor: "pointer",
                    padding: 0,
                    transition: "all 0.12s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = "#e2e8f0";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = isToday
                        ? "#f1f5f9"
                        : "transparent";
                    }
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
