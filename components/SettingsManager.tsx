import React from 'react';
import type { Athlete, Team, Event, AttendanceRecord } from '../types';
import { SettingsIcon, DownloadIcon } from './icons';

interface SettingsManagerProps {
  athletes: Athlete[];
  teams: Team[];
  events: Event[];
  attendance: AttendanceRecord[];
}

const SettingsManager: React.FC<SettingsManagerProps> = ({ athletes, teams, events, attendance }) => {

  const escapeCsvCell = (cell: string | undefined | null) => {
    if (cell === undefined || cell === null) {
      return '';
    }
    const str = String(cell);
    if (str.includes(',')) {
      return `"${str}"`;
    }
    return str;
  };

  const downloadCsv = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExportAthletes = () => {
    const headers = ['ID Atleta', 'Nome', 'Cognome', 'Data di Nascita'];
    const rows = athletes.map(a => [a.id, a.firstName, a.lastName, a.dateOfBirth]);
    const csvContent = [headers.join(','), ...rows.map(row => row.map(escapeCsvCell).join(','))].join('\n');
    downloadCsv(csvContent, 'atleti.csv');
  };

  const handleExportTeams = () => {
    const headers = ['ID Squadra', 'Nome Squadra', 'ID Atleta', 'Nome Atleta', 'Cognome Atleta'];
    const rows: string[][] = [];
    teams.forEach(team => {
      team.athleteIds.forEach(athleteId => {
        const athlete = athletes.find(a => a.id === athleteId);
        if (athlete) {
          rows.push([team.id, team.name, athlete.id, athlete.firstName, athlete.lastName]);
        }
      });
    });
    const csvContent = [headers.join(','), ...rows.map(row => row.map(escapeCsvCell).join(','))].join('\n');
    downloadCsv(csvContent, 'squadre.csv');
  };
  
  const handleExportAttendance = () => {
    const headers = ['Data Evento', 'Orario Evento', 'Titolo Evento', 'Nome Squadra', 'Nome Atleta', 'Cognome Atleta', 'Stato', 'Note'];
    const rows = attendance.map(record => {
        const event = events.find(e => e.id === record.eventId);
        const athlete = athletes.find(a => a.id === record.athleteId);
        const team = teams.find(t => t.id === event?.teamId);

        if (!event || !athlete || !team) return null;

        return [
            event.date,
            event.time,
            event.title,
            team.name,
            athlete.firstName,
            athlete.lastName,
            record.status,
            record.notes || ''
        ];
    }).filter((row): row is string[] => row !== null);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.map(escapeCsvCell).join(','))].join('\n');
    downloadCsv(csvContent, 'presenze.csv');
  };


  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-700 flex items-center"><SettingsIcon className="mr-3"/> Impostazioni & Esporta</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
            <h2 className="text-xl font-semibold text-gray-800">Esporta Dati</h2>
            <p className="text-gray-500 mt-1">Scarica i dati della tua applicazione in formato CSV.</p>
        </div>
        
        <div className="space-y-3 pt-2">
            <button
                onClick={handleExportAthletes}
                className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg shadow hover:bg-blue-600 flex items-center justify-center transition-colors text-lg"
            >
                <DownloadIcon className="mr-3" />
                Esporta Atleti
            </button>
            <button
                onClick={handleExportTeams}
                className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg shadow hover:bg-blue-600 flex items-center justify-center transition-colors text-lg"
            >
                <DownloadIcon className="mr-3" />
                Esporta Squadre
            </button>
            <button
                onClick={handleExportAttendance}
                className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg shadow hover:bg-blue-600 flex items-center justify-center transition-colors text-lg"
            >
                <DownloadIcon className="mr-3" />
                Esporta Presenze
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsManager;
