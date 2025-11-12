import React, { useState } from 'react';
import type { CalendarEvent } from '../types';

interface CalendarProps {
  events?: CalendarEvent[];
}

const Calendar: React.FC<CalendarProps> = ({ events = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startOfMonth.getDay());
  const endDate = new Date(endOfMonth);
  endDate.setDate(endDate.getDate() + (6 - endOfMonth.getDay()));

  const calendarDays = [];
  let day = new Date(startDate);
  while (day <= endDate) {
    calendarDays.push(new Date(day));
    day.setDate(day.getDate() + 1);
  }

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const getEventsForDay = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  }

  const today = new Date();
  const isToday = (date: Date) => 
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
    
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Previous month">&larr;</button>
        <h2 className="text-lg font-semibold">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Next month">&rarr;</button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-500">
        {daysOfWeek.map(day => <div key={day}>{day}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1 mt-1">
        {calendarDays.map((date, index) => {
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const dayEvents = getEventsForDay(date);
          return (
            <div key={index} className={`relative p-2 h-28 border rounded overflow-hidden ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'}`}>
              <span className={`flex items-center justify-center absolute top-1 right-1 text-xs w-5 h-5 ${isToday(date) ? 'bg-teal-500 text-white rounded-full' : ''}`}>
                {date.getDate()}
              </span>
              <div className="mt-6 text-xs space-y-1">
                {dayEvents.slice(0, 2).map(event => (
                    <div key={event.id} title={event.title} className={`p-1 rounded truncate text-left ${event.type === 'appointment' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                        {event.title}
                    </div>
                ))}
                {dayEvents.length > 2 && <div className="text-gray-500 text-left">+{dayEvents.length - 2} more</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
