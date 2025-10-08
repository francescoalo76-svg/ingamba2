import React from 'react';
import { UsersIcon, UserGroupIcon, CalendarIcon } from './icons';

interface WelcomePopupProps {
  onClose: () => void;
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="welcome-title"
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md m-4 flex flex-col transform transition-all animate-fade-in-up"
      >
        <header className="text-center p-6 border-b border-gray-200">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                 <svg className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
            </div>
          <h2 id="welcome-title" className="text-2xl font-bold text-gray-800">Benvenuto!</h2>
          <p className="text-gray-500 mt-1">Ecco come iniziare in 3 semplici passi.</p>
        </header>
        <main className="p-6 space-y-6">
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 bg-gray-100 rounded-full p-3">
                    <UsersIcon className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg text-gray-700">1. Aggiungi i tuoi Atleti</h3>
                    <p className="text-gray-600">Vai nella sezione <span className="font-bold text-blue-600">'Atleti'</span> per inserire tutti i componenti della tua società.</p>
                </div>
            </div>
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 bg-gray-100 rounded-full p-3">
                    <UserGroupIcon className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg text-gray-700">2. Crea le Squadre</h3>
                    <p className="text-gray-600">In <span className="font-bold text-blue-600">'Squadre'</span>, raggruppa gli atleti nelle diverse formazioni.</p>
                </div>
            </div>
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 bg-gray-100 rounded-full p-3">
                    <CalendarIcon className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg text-gray-700">3. Gestisci gli Eventi</h3>
                    <p className="text-gray-600">Nel <span className="font-bold text-blue-600">'Calendario'</span>, crea eventi e segna le presenze per ogni atleta.</p>
                </div>
            </div>
        </main>
        <footer className="p-6 bg-gray-50 rounded-b-2xl">
            <button 
                onClick={onClose} 
                className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all font-semibold text-lg"
            >
                Ho capito, iniziamo!
            </button>
        </footer>
      </div>
      <style>{`
        @keyframes fade-in-up {
            0% {
                opacity: 0;
                transform: translateY(20px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default WelcomePopup;
