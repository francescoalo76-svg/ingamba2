import React, { useState, useEffect } from 'react';
import type { Team, Athlete } from '../types';
import Modal from './Modal';
import { PlusIcon, TrashIcon, PencilIcon, UserGroupIcon } from './icons';

interface TeamManagerProps {
  teams: Team[];
  athletes: Athlete[];
  onAddTeam: (team: Omit<Team, 'id'>) => void;
  onUpdateTeam: (team: Team) => void;
  onDeleteTeam: (id: string) => void;
}

const TeamManager: React.FC<TeamManagerProps> = ({ teams, athletes, onAddTeam, onUpdateTeam, onDeleteTeam }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');
  const [selectedAthleteIds, setSelectedAthleteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (currentTeam) {
      setTeamName(currentTeam.name);
      setSelectedAthleteIds(new Set(currentTeam.athleteIds));
    } else {
      setTeamName('');
      setSelectedAthleteIds(new Set());
    }
  }, [currentTeam]);

  const openModalForAdd = () => {
    setCurrentTeam(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (team: Team) => {
    setCurrentTeam(team);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentTeam(null);
  };

  const handleAthleteToggle = (athleteId: string) => {
    setSelectedAthleteIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(athleteId)) {
        newSet.delete(athleteId);
      } else {
        newSet.add(athleteId);
      }
      return newSet;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const teamData = { name: teamName, athleteIds: Array.from(selectedAthleteIds) };
    if (currentTeam) {
      onUpdateTeam({ ...currentTeam, ...teamData });
    } else {
      onAddTeam(teamData);
    }
    closeModal();
  };
  
  const getAthleteName = (id: string) => {
    const athlete = athletes.find(a => a.id === id);
    return athlete ? `${athlete.firstName} ${athlete.lastName}` : 'Sconosciuto';
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-700 flex items-center"><UserGroupIcon className="mr-3"/> Gestione Squadre</h1>
        <button onClick={openModalForAdd} className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 flex items-center transition-colors">
          <PlusIcon className="mr-2" />
          Crea Squadra
        </button>
      </div>
      
      <div className="space-y-4">
        {teams.length > 0 ? teams.map(team => (
          <div key={team.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-bold text-xl text-blue-600">{team.name}</h2>
                <p className="text-sm text-gray-500">{team.athleteIds.length} atleti</p>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => openModalForEdit(team)} className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-100 transition-colors"><PencilIcon /></button>
                <button onClick={() => onDeleteTeam(team.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors"><TrashIcon /></button>
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-sm font-semibold text-gray-600">Componenti:</h3>
              <ul className="text-sm text-gray-800 list-disc list-inside">
                {team.athleteIds.map(id => <li key={id}>{getAthleteName(id)}</li>)}
              </ul>
            </div>
          </div>
        )) : (
           <div className="p-4 text-center text-gray-500 bg-white rounded-lg shadow">Nessuna squadra creata.</div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={currentTeam ? 'Modifica Squadra' : 'Crea Squadra'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">Nome Squadra</label>
            <input type="text" name="teamName" id="teamName" value={teamName} onChange={(e) => setTeamName(e.target.value)} required className="mt-1 block w-full bg-gray-600 text-white border border-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <h3 className="block text-sm font-medium text-gray-700">Seleziona Atleti</h3>
            <div className="mt-2 border border-gray-300 rounded-md max-h-60 overflow-y-auto">
              {athletes.map(athlete => (
                <div key={athlete.id} className="flex items-center p-2 border-b last:border-b-0">
                  <input
                    type="checkbox"
                    id={`athlete-${athlete.id}`}
                    checked={selectedAthleteIds.has(athlete.id)}
                    onChange={() => handleAthleteToggle(athlete.id)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={`athlete-${athlete.id}`} className="ml-3 block text-sm text-gray-900">{athlete.firstName} {athlete.lastName}</label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={closeModal} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg mr-2 hover:bg-gray-300">Annulla</button>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">{currentTeam ? 'Salva Modifiche' : 'Crea'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeamManager;