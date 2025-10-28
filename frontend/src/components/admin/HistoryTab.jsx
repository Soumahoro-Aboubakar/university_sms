import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { smsService } from '../../services/api';

const HistoryTab = () => {
  const [smsHistory, setSmsHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await smsService.getSMSHistory();
      setSmsHistory(data);
    } catch (error) {
      console.error('Erreur chargement historique:', error);
      alert('Erreur lors du chargement de l\'historique');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Historique des SMS</h3>
      <div className="space-y-4">
        {smsHistory.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun SMS envoyé pour le moment</p>
          </div>
        ) : (
          smsHistory.map(sms => (
            <div 
              key={sms._id} 
              className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm text-gray-500">
                  {new Date(sms.createdAt).toLocaleString('fr-FR')}
                </span>
                <div className="flex gap-2">
                  <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                    {sms.recipientCount} destinataire(s)
                  </span>
                  <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                    sms.status === 'sent' 
                      ? 'bg-blue-100 text-blue-800' 
                      : sms.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {sms.status === 'sent' ? '✓ Envoyé' : sms.status === 'failed' ? '✗ Échec' : '⏳ En cours'}
                  </span>
                </div>
              </div>
              <p className="text-gray-800 mb-3 bg-gray-50 p-3 rounded-lg">{sms.message}</p>
              <details className="text-sm">
                <summary className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                  Voir les destinataires
                </summary>
                <div className="mt-3 space-y-2 pl-4">
                  {sms.recipients.map((r, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-600">
                      <div className={`w-2 h-2 rounded-full ${
                        r.type === 'student' ? 'bg-blue-500' : 'bg-green-500'
                      }`} />
                      <span>{r.name} - {r.phone}</span>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryTab;