import React, { useState, useCallback, useEffect } from 'react';
import type { View, Athlete, Team, Event, AttendanceRecord } from './types';
import AthleteManager from './components/AthleteManager';
import TeamManager from './components/TeamManager';
import CalendarManager from './components/CalendarManager';
import SettingsManager from './components/SettingsManager';
import WelcomePopup from './components/WelcomePopup';
import { CalendarIcon, UsersIcon, UserGroupIcon, SettingsIcon } from './components/icons';

// Custom hook for persisting state to localStorage
function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

const BottomNavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${isActive ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
    >
        {icon}
        <span className="text-xs">{label}</span>
    </button>
);

const App: React.FC = () => {
  const [view, setView] = useState<View>('calendar');
  const [athletes, setAthletes] = useLocalStorage<Athlete[]>('athletes', []);
  const [teams, setTeams] = useLocalStorage<Team[]>('teams', []);
  const [events, setEvents] = useLocalStorage<Event[]>('events', []);
  const [attendance, setAttendance] = useLocalStorage<AttendanceRecord[]>('attendance', []);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasSeenWelcomePopup');
    if (!hasVisited) {
      setIsWelcomeOpen(true);
    }
  }, []);

  const handleWelcomeClose = () => {
    localStorage.setItem('hasSeenWelcomePopup', 'true');
    setIsWelcomeOpen(false);
  };
  
  const handleAddAthlete = useCallback((athleteData: Omit<Athlete, 'id'>) => {
    setAthletes(prev => [...prev, { ...athleteData, id: Date.now().toString() }]);
  }, [setAthletes]);

  const handleUpdateAthlete = useCallback((updatedAthlete: Athlete) => {
    setAthletes(prev => prev.map(a => a.id === updatedAthlete.id ? updatedAthlete : a));
  }, [setAthletes]);
  
  const handleDeleteAthlete = useCallback((id: string) => {
    setAthletes(prev => prev.filter(a => a.id !== id));
    // Also remove from teams
    setTeams(prevTeams => prevTeams.map(team => ({
        ...team,
        athleteIds: team.athleteIds.filter(athleteId => athleteId !== id)
    })));
  }, [setAthletes, setTeams]);

  const handleAddTeam = useCallback((teamData: Omit<Team, 'id'>) => {
    setTeams(prev => [...prev, { ...teamData, id: Date.now().toString() }]);
  }, [setTeams]);

  const handleUpdateTeam = useCallback((updatedTeam: Team) => {
    setTeams(prev => prev.map(t => t.id === updatedTeam.id ? updatedTeam : t));
  }, [setTeams]);
  
  const handleDeleteTeam = useCallback((id: string) => {
    setTeams(prev => prev.filter(t => t.id !== id));
  }, [setTeams]);
  
  const handleAddEvent = useCallback((eventData: Omit<Event, 'id'>) => {
    setEvents(prev => [...prev, { ...eventData, id: Date.now().toString() }]);
  }, [setEvents]);

  const handleUpdateEvent = useCallback((updatedEvent: Event) => {
    setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
  }, [setEvents]);

  const handleUpdateAttendance = useCallback((record: AttendanceRecord) => {
    setAttendance(prev => {
        const index = prev.findIndex(r => r.eventId === record.eventId && r.athleteId === record.athleteId);
        if (index > -1) {
            const newAttendance = [...prev];
            newAttendance[index] = record;
            return newAttendance;
        }
        return [...prev, record];
    });
  }, [setAttendance]);

  const renderView = () => {
    const calendarProps = {
        events,
        teams,
        athletes,
        attendance,
        onAddEvent: handleAddEvent,
        onUpdateEvent: handleUpdateEvent,
        onUpdateAttendance: handleUpdateAttendance
    };

    switch (view) {
      case 'calendar':
        return <CalendarManager {...calendarProps} />;
      case 'teams':
        return <TeamManager teams={teams} athletes={athletes} onAddTeam={handleAddTeam} onUpdateTeam={handleUpdateTeam} onDeleteTeam={handleDeleteTeam}/>;
      case 'athletes':
        return <AthleteManager athletes={athletes} onAddAthlete={handleAddAthlete} onUpdateAthlete={handleUpdateAthlete} onDeleteAthlete={handleDeleteAthlete}/>;
      case 'settings':
        return <SettingsManager athletes={athletes} teams={teams} events={events} attendance={attendance} />;
      default:
        return <CalendarManager {...calendarProps} />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col font-sans max-w-4xl mx-auto bg-gray-100 shadow-lg">
      {isWelcomeOpen && <WelcomePopup onClose={handleWelcomeClose} />}
      <main className="flex-grow overflow-y-auto pb-20">
        {renderView()}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 max-w-4xl mx-auto h-16 bg-white border-t border-gray-200 flex justify-around items-stretch shadow-top z-10">
        <BottomNavItem label="Calendario" icon={<CalendarIcon />} isActive={view === 'calendar'} onClick={() => setView('calendar')} />
        <BottomNavItem label="Squadre" icon={<UserGroupIcon />} isActive={view === 'teams'} onClick={() => setView('teams')} />
        <BottomNavItem label="Atleti" icon={<UsersIcon />} isActive={view === 'athletes'} onClick={() => setView('athletes')} />
        <BottomNavItem label="Impostazioni" icon={<SettingsIcon />} isActive={view === 'settings'} onClick={() => setView('settings')} />
      </nav>
    </div>
  );
};

export default App;