import React, { useState } from 'react';
import type { Athlete } from '../types';
import Modal from './Modal';
import { PlusIcon, TrashIcon, PencilIcon, UsersIcon } from './icons';

interface AthleteManagerProps {
  athletes: Athlete[];
  onAddAthlete: (athlete: Omit<Athlete, 'id'>) => void;
  onUpdateAthlete: (athlete: Athlete) => void;
  onDeleteAthlete: (id: string) => void;
}

const AthleteManager: React.FC<AthleteManagerProps> = ({ athletes, onAddAthlete, onUpdateAthlete, onDeleteAthlete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAthlete, setCurrentAthlete] = useState<Athlete | null>(null);
  const [formState, setFormState] = useState({ firstName: '', lastName: '', dateOfBirth: '' });

  const openModalForAdd = () => {
    setCurrentAthlete(null);
    setFormState({ firstName: '', lastName: '', dateOfBirth: '' });
    setIsModalOpen(true);
  };

  const openModalForEdit = (athlete: Athlete) => {
    setCurrentAthlete(athlete);
    setFormState({ firstName: athlete.firstName, lastName: athlete.lastName, dateOfBirth: athlete.dateOfBirth });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentAthlete(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAthlete) {
      onUpdateAthlete({ ...currentAthlete, ...formState });
    } else {
      onAddAthlete(formState);
    }
    closeModal();
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-700 flex items-center"><UsersIcon className="mr-3"/> Anagrafica Atleti</h1>
        <button
          onClick={openModalForAdd}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 flex items-center transition-colors"
        >
          <PlusIcon className="mr-2" />
          Aggiungi Atleta
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {athletes.length > 0 ? athletes.map(athlete => (
            <li key={athlete.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
              <div>
                <p className="font-semibold text-lg">{athlete.firstName} {athlete.lastName}</p>
                <p className="text-sm text-gray-500">Nato il: {new Date(athlete.dateOfBirth).toLocaleDateString('it-IT')}</p>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => openModalForEdit(athlete)} className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-100 transition-colors"><PencilIcon /></button>
                <button onClick={() => onDeleteAthlete(athlete.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors"><TrashIcon /></button>
              </div>
            </li>
          )) : (
            <li className="p-4 text-center text-gray-500">Nessun atleta inserito.</li>
          )}
        </ul>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={currentAthlete ? 'Modifica Atleta' : 'Aggiungi Atleta'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Nome</label>
            <input type="text" name="firstName" id="firstName" value={formState.firstName} onChange={handleChange} required className="mt-1 block w-full bg-gray-600 text-white border border-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Cognome</label>
            <input type="text" name="lastName" id="lastName" value={formState.lastName} onChange={handleChange} required className="mt-1 block w-full bg-gray-600 text-white border border-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Data di Nascita</label>
            <input type="date" name="dateOfBirth" id="dateOfBirth" value={formState.dateOfBirth} onChange={handleChange} required className="mt-1 block w-full bg-gray-600 text-white border border-gray-500 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" style={{colorScheme: 'dark'}} />
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={closeModal} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg mr-2 hover:bg-gray-300">Annulla</button>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">{currentAthlete ? 'Salva Modifiche' : 'Aggiungi'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AthleteManager;