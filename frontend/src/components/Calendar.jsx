const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Calendar({ selectedDate, onSelect }) {
  const today = new Date();
  const base = selectedDate || today;

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() - base.getDay() + 1 + i);
    return d;
  });

  return (
    <div className="calendar card">
      <div className="calendar-header">
        <h3>Calendar</h3>
        <span>
          {base.toLocaleString("default", {
            month: "long",
            year: "numeric"
          })}
        </span>
      </div>
      <div className="calendar-grid">
        {days.map((d) => (
          <div key={d} className="calendar-day-label">
            {d}
          </div>
        ))}
        {week.map((d) => {
          const isToday =
            d.toDateString() === today.toDateString();
          const isSelected =
            selectedDate &&
            d.toDateString() === selectedDate.toDateString();
          return (
            <button
              key={d.toISOString()}
              className={
                "calendar-cell" +
                (isToday ? " calendar-today" : "") +
                (isSelected ? " calendar-selected" : "")
              }
              onClick={() => onSelect?.(d)}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}


