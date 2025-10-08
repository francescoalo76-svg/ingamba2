import React, { useState, useMemo } from 'react';
import type { Event, Team, Athlete, AttendanceRecord, AttendanceStatus as AttendanceStatusEnum } from '../types';
import { AttendanceStatus } from '../types';
import Modal from './Modal';
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon, CalendarIcon, PencilIcon } from './icons';

interface CalendarManagerProps {
  events: Event[];
  teams: Team[];
  athletes: Athlete[];
  attendance: AttendanceRecord[];
  onAddEvent: (event: Omit<Event, 'id'>) => void;
  onUpdateEvent: (event: Event) => void;
  onUpdateAttendance: (record: AttendanceRecord) => void;
}

// Helper function to format a Date object to YYYY-MM-DD string without timezone conversion
const toYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const CalendarHeader: React.FC<{
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}> = ({ currentDate, onPrevMonth, onNextMonth }) => (
  <div className="flex justify-between items-center mb-4">
    <button onClick={onPrevMonth} className="p-2 rounded-full hover:bg-gray-200"><ChevronLeftIcon /></button>
    <h2 className="text-xl font-bold text-gray-700 capitalize">
      {currentDate.toLocaleString('it-IT', { month: 'long', year: 'numeric' })}
    </h2>
    <button onClick={onNextMonth} className="p-2 rounded-full hover:bg-gray-200"><ChevronRightIcon /></button>
  </div>
);

const CalendarGrid: React.FC<{
    currentDate: Date;
    events: Event[];
    onDateClick: (date: Date) => void;
    selectedDate: Date;
}> = ({ currentDate, events, onDateClick, selectedDate }) => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const weekDays = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

    const eventsByDate = useMemo(() => {
        const map = new Map<string, number>();
        events.forEach(event => {
            map.set(event.date, (map.get(event.date) || 0) + 1);
        });
        return map;
    }, [events]);

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-7 gap-2 text-center text-sm text-gray-500 mb-2">
                {weekDays.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, day) => {
                    const date = new Date(year, month, day + 1);
                    const dateString = toYYYYMMDD(date);
                    const isSelected = selectedDate.toDateString() === date.toDateString();
                    const isToday = new Date().toDateString() === date.toDateString();
                    const hasEvents = eventsByDate.has(dateString);

                    return (
                        <div
                            key={day}
                            onClick={() => onDateClick(date)}
                            className={`p-2 text-center rounded-full cursor-pointer transition-colors relative ${isSelected ? 'bg-blue-500 text-white' : isToday ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                        >
                            {day + 1}
                            {hasEvents && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full"></div>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const AttendanceSheet: React.FC<{
  event: Event;
  team: Team | undefined;
  athletes: Athlete[];
  attendance: AttendanceRecord[];
  onUpdateAttendance: (record: AttendanceRecord) => void;
  onBack: () => void;
}> = ({ event, team, athletes, attendance, onUpdateAttendance, onBack }) => {
    if (!team) return <p>Squadra non trovata.</p>;
    
    const teamAthletes = athletes.filter(a => team.athleteIds.includes(a.id));

    const getAttendance = (athleteId: string) => {
        return attendance.find(r => r.eventId === event.id && r.athleteId === athleteId) 
               || { eventId: event.id, athleteId, status: AttendanceStatus.Present, notes: '' };
    };
    
    const handleStatusChange = (athleteId: string, status: AttendanceStatusEnum) => {
        const record = getAttendance(athleteId);
        onUpdateAttendance({ ...record, status });
    };

    const handleNotesChange = (athleteId: string, notes: string) => {
        const record = getAttendance(athleteId);
        onUpdateAttendance({ ...record, notes });
    };

    const markAllPresent = () => {
        teamAthletes.forEach(athlete => {
            const record = getAttendance(athlete.id);
            if (record.status !== AttendanceStatus.Present) {
                onUpdateAttendance({ ...record, status: AttendanceStatus.Present, notes: '' });
            }
        });
    };

    return (
        <div className="bg-white rounded-lg shadow p-4 mt-4">
            <button onClick={onBack} className="text-blue-500 hover:underline mb-4">&larr; Torna agli eventi</button>
            <h3 className="text-xl font-bold">{event.title} - {team.name}</h3>
            <p className="text-gray-500 mb-4">{new Date(event.date).toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} alle {event.time}</p>
            
            <button onClick={markAllPresent} className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 mb-4 transition-colors">Segna tutti presenti</button>

            <ul className="space-y-3">
                {teamAthletes.map(athlete => {
                    const record = getAttendance(athlete.id);
                    const isAbsent = record.status === AttendanceStatus.Absent;
                    return (
                        <li key={athlete.id} className={`p-3 rounded-lg ${isAbsent ? 'bg-red-50' : 'bg-green-50'}`}>
                            <div className="flex justify-between items-center">
                                <p className="font-semibold">{athlete.firstName} {athlete.lastName}</p>
                                <div className="flex space-x-2">
                                    <button onClick={() => handleStatusChange(athlete.id, AttendanceStatus.Present)} className={`px-3 py-1 text-sm rounded-full ${!isAbsent ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Presente</button>
                                    <button onClick={() => handleStatusChange(athlete.id, AttendanceStatus.Absent)} className={`px-3 py-1 text-sm rounded-full ${isAbsent ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Assente</button>
                                </div>
                            </div>
                            {isAbsent && (
                                <div className="mt-2">
                                    <input 
                                        type="text" 
                                        placeholder="Note (es. medico, scuola...)" 
                                        value={record.notes}
                                        onChange={(e) => handleNotesChange(athlete.id, e.target.value)}
                                        className="w-full text-sm p-2 bg-gray-600 text-white placeholder-gray-400 border border-red-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                                    />
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};


const CalendarManager: React.FC<CalendarManagerProps> = ({ events, teams, athletes, attendance, onAddEvent, onUpdateEvent, onUpdateAttendance }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [formState, setFormState] = useState({ title: '', date: '', time: '18:00', teamId: '' });

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  
  const handleDateClick = (date: Date) => {
      setSelectedDate(date);
      setSelectedEvent(null);
  };
  
  const openModalForAdd = () => {
    setCurrentEvent(null);
    setFormState({
        title: '',
        date: toYYYYMMDD(selectedDate),
        time: '18:00',
        teamId: teams.length > 0 ? teams[0].id : ''
    });
    setIsModalOpen(true);
  };
  
  const openModalForEdit = (event: Event) => {
    setCurrentEvent(event);
    setFormState({
        title: event.title,
        date: event.date,
        time: event.time,
        teamId: event.teamId,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentEvent(null);
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.teamId) {
        alert("Seleziona una squadra.");
        return;
    }
    if (currentEvent) {
        onUpdateEvent({ ...currentEvent, ...formState });
    } else {
        onAddEvent({
          title: formState.title,
          date: formState.date,
          time: formState.time,
          teamId: formState.teamId,
        });
    }
    closeModal();
  };

  const eventsForSelectedDate = events.filter(e => e.date === toYYYYMMDD(selectedDate));

  if (selectedEvent) {
      const team = teams.find(t => t.id === selectedEvent.teamId);
      return (
          <div className="p-4 md:p-6">
              <AttendanceSheet 
                  event={selectedEvent} 
                  team={team} 
                  athletes={athletes} 
                  attendance={attendance} 
                  onUpdateAttendance={onUpdateAttendance}
                  onBack={() => setSelectedEvent(null)}
              />
          </div>
      );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-700 flex items-center"><CalendarIcon className="mr-3"/> Calendario Eventi</h1>
      </div>
      
      <CalendarHeader currentDate={currentDate} onPrevMonth={handlePrevMonth} onNextMonth={handleNextMonth} />
      <CalendarGrid currentDate={currentDate} events={events} onDateClick={handleDateClick} selectedDate={selectedDate} />

      <div className="mt-6">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-700">
                Eventi per {selectedDate.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h2>
            <button onClick={openModalForAdd} className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 flex items-center transition-colors">
                <PlusIcon className="mr-2" />
                Crea Evento
            </button>
        </div>
        <div className="mt-4 bg-white rounded-lg shadow p-4 space-y-3">
            {eventsForSelectedDate.length > 0 ? eventsForSelectedDate.map(event => (
                <div key={event.id} className="rounded-lg border border-gray-200 flex justify-between items-center">
                    <div onClick={() => setSelectedEvent(event)} className="flex-grow cursor-pointer p-3 rounded-l-lg hover:bg-blue-50 transition-colors">
                        <p className="font-semibold text-blue-600">{event.title}</p>
                        <p className="text-sm text-gray-600">Ore: {event.time} - Squadra: {teams.find(t => t.id === event.teamId)?.name || 'N/D'}</p>
                    </div>
                    <div className="flex space-x-1 pr-2">
                        <button onClick={() => openModalForEdit(event)} className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-100 transition-colors" aria-label="Modifica evento"><PencilIcon /></button>
                    </div>
                </div>
            )) : (
                <p className="text-gray-500">Nessun evento pianificato per questa data.</p>
            )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={currentEvent ? 'Modifica Evento' : 'Crea Evento'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Titolo (es. Allenamento)</label>
            <input type="text" name="title" id="title" value={formState.title} onChange={handleChange} required className="mt-1 block w-full bg-gray-600 text-white border border-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
           <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Data</label>
            <input type="date" name="date" id="date" value={formState.date} onChange={handleChange} required className="mt-1 block w-full bg-gray-600 text-white border border-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" style={{colorScheme: 'dark'}} />
          </div>
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700">Orario</label>
            <input type="time" name="time" id="time" value={formState.time} onChange={handleChange} required className="mt-1 block w-full bg-gray-600 text-white border border-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" style={{colorScheme: 'dark'}} />
          </div>
          <div>
            <label htmlFor="teamId" className="block text-sm font-medium text-gray-700">Squadra</label>
            <select name="teamId" id="teamId" value={formState.teamId} onChange={handleChange} required className="mt-1 block w-full bg-gray-600 text-white border border-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={closeModal} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg mr-2 hover:bg-gray-300">Annulla</button>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">{currentEvent ? 'Salva Modifiche' : 'Crea'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CalendarManager;