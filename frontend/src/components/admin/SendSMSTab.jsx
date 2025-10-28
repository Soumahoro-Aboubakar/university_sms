import React, { useState } from 'react';
import { Send, GraduationCap, Award, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { smsService } from '../../services/api';

const SendSMSTab = ({ students, teachers, onRefresh }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [expandedLevel, setExpandedLevel] = useState(null);
  const [showTeachersList, setShowTeachersList] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const levels = ['L1', 'L2', 'L3', 'M1', 'M2'];

  const getStudentsByLevel = (level) => {
    return students.filter(s => s.level === level);
  };

  const getSpecializationLabel = (level) => {
    if (level === 'L1' || level === 'L2') {
      return 'Mathématique et Informatique';
    }
    return null;
  };

  const toggleUserSelection = (user, type) => {
    setSelectedUsers(prev => {
      const exists = prev.find(u => u.id === user._id && u.type === type);
      if (exists) {
        return prev.filter(u => !(u.id === user._id && u.type === type));
      } else {
        return [...prev, { id: user._id, type }];
      }
    });
  };

  const isUserSelected = (userId, type) => {
    return selectedUsers.find(u => u.id === userId && u.type === type);
  };

  const handleSendSMS = async () => {
    if (!message.trim()) {
      alert('Veuillez saisir un message');
      return;
    }

    if (selectedUsers.length === 0) {
      alert('Veuillez sélectionner au moins un destinataire');
      return;
    }

    if (!window.confirm(`Envoyer le SMS à ${selectedUsers.length} destinataire(s) ?`)) {
      return;
    }

    setSending(true);
    try {
      const result = await smsService.sendSMS(message, selectedUsers);
      alert(`SMS envoyé avec succès à ${result.successCount}/${result.totalCount} destinataire(s)`);
      setMessage('');
      setSelectedUsers([]);
      onRefresh();
    } catch (error) {
      console.error('Erreur envoi SMS:', error);
      alert(error.response?.data?.error || 'Erreur lors de l\'envoi du SMS');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Selection des étudiants par niveau */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-500" />
            Sélection par Niveau
          </h3>
          
          <div className="space-y-2">
            {levels.map(level => {
              const studentsInLevel = getStudentsByLevel(level);
              const allSelected = studentsInLevel.every(s => isUserSelected(s._id, 'student'));
              
              return (
                <div key={level} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div 
                    className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all"
                    onClick={() => setExpandedLevel(expandedLevel === level ? null : level)}
                  >
                    <div className="flex items-center gap-3">
                      {expandedLevel === level ? 
                        <ChevronDown className="w-5 h-5 text-gray-500" /> : 
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      }
                      <span className="font-semibold text-gray-800">{level}</span>
                      <span className="text-sm text-gray-500">({studentsInLevel.length} étudiants)</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (allSelected) {
                          setSelectedUsers(prev => 
                            prev.filter(u => !studentsInLevel.find(s => s._id === u.id))
                          );
                        } else {
                          const newUsers = studentsInLevel
                            .filter(s => !isUserSelected(s._id, 'student'))
                            .map(s => ({ id: s._id, type: 'student' }));
                          setSelectedUsers(prev => [...prev, ...newUsers]);
                        }
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        allSelected 
                          ? 'bg-red-500 text-white hover:bg-red-600' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                    </button>
                  </div>
                  
                  {expandedLevel === level && (
                    <div className="p-4 space-y-2 bg-white">
                      {studentsInLevel.map(student => {
                        const isSelected = isUserSelected(student._id, 'student');
                        const levelLabel = getSpecializationLabel(student.level);
                        return (
                          <div 
                            key={student._id}
                            onClick={() => toggleUserSelection(student, 'student')}
                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                              isSelected 
                                ? 'bg-blue-50 border-2 border-blue-500' 
                                : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">
                                  {student.firstName} {student.lastName}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {levelLabel || student.specialization} • {student.phone}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Enseignants */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div 
            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-4 -m-4 rounded-xl transition-all"
            onClick={() => setShowTeachersList(!showTeachersList)}
          >
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Award className="w-5 h-5 text-green-500" />
              Corps Enseignant
              <span className="text-sm font-normal text-gray-500">({teachers.length})</span>
            </h3>
            {showTeachersList ? 
              <ChevronDown className="w-6 h-6 text-gray-500" /> : 
              <ChevronRight className="w-6 h-6 text-gray-500" />
            }
          </div>
          
          {showTeachersList && (
            <div className="mt-4 space-y-2 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-gray-600">Sélectionnez les enseignants à notifier</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const allTeachersSelected = teachers.every(t => 
                      isUserSelected(t._id, 'teacher')
                    );
                    if (allTeachersSelected) {
                      setSelectedUsers(prev => 
                        prev.filter(u => u.type !== 'teacher')
                      );
                    } else {
                      const newTeachers = teachers
                        .filter(t => !isUserSelected(t._id, 'teacher'))
                        .map(t => ({ id: t._id, type: 'teacher' }));
                      setSelectedUsers(prev => [...prev, ...newTeachers]);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    teachers.every(t => isUserSelected(t._id, 'teacher'))
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {teachers.every(t => isUserSelected(t._id, 'teacher')) ? 
                    'Tout désélectionner' : 'Tout sélectionner'}
                </button>
              </div>
              
              {teachers.map(teacher => {
                const isSelected = isUserSelected(teacher._id, 'teacher');
                return (
                  <div 
                    key={teacher._id}
                    onClick={() => toggleUserSelection(teacher, 'teacher')}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-green-50 border-2 border-green-500' 
                        : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected ? 'bg-green-500 border-green-500' : 'border-gray-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {teacher.firstName} {teacher.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {teacher.grade} • {teacher.specialization} • {teacher.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Message Form */}
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Composer le message</h3>
          
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-1">Destinataires sélectionnés</p>
            <p className="text-2xl font-bold text-blue-600">{selectedUsers.length}</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 h-40 resize-none"
              placeholder="Saisissez votre message ici..."
              disabled={sending}
            />
            <p className="text-sm text-gray-500 mt-1">{message.length} caractères</p>
          </div>

          <button
            onClick={handleSendSMS}
            disabled={selectedUsers.length === 0 || !message.trim() || sending}
            className="w-full bg-gradient-to-r from-orange-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
            {sending ? 'Envoi en cours...' : 'Envoyer le SMS'}
          </button>

          {selectedUsers.length > 0 && (
            <button
              onClick={() => setSelectedUsers([])}
              disabled={sending}
              className="w-full mt-2 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all"
            >
              Effacer la sélection
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SendSMSTab;