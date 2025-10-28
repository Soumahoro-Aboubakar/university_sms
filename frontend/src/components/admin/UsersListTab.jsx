import React, { useState } from 'react';
import { Search, Users, GraduationCap, Award, User, Phone } from 'lucide-react';

const UsersListTab = ({ students, teachers }) => {
  const [viewMode, setViewMode] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getFilteredUsers = () => {
    let filtered = viewMode === 'students' 
      ? students.map(s => ({ ...s, userType: 'student' }))
      : viewMode === 'teachers' 
        ? teachers.map(t => ({ ...t, userType: 'teacher' }))
        : [
            ...students.map(s => ({ ...s, userType: 'student' })),
            ...teachers.map(t => ({ ...t, userType: 'teacher' }))
          ];
    
    if (searchTerm) {
      filtered = filtered.filter(u => 
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone.includes(searchTerm)
      );
    }
    
    return filtered;
  };

  const filteredUsers = getFilteredUsers();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Liste des Utilisateurs</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'all' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setViewMode('students')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'students' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Étudiants
            </button>
            <button
              onClick={() => setViewMode('teachers')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'teachers' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Enseignants
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom, IP ou téléphone..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map(user => {
            const isStudent = user.userType === 'student';
            return (
              <div 
                key={`${user.userType}-${user._id}`} 
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isStudent ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {isStudent ? 
                      <GraduationCap className="w-6 h-6 text-blue-600" /> : 
                      <Award className="w-6 h-6 text-green-600" />
                    }
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isStudent ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {isStudent ? user.level : user.grade}
                  </span>
                </div>
                
                <h4 className="font-bold text-gray-800 mb-1">
                  {user.firstName} {user.lastName}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {isStudent ? (user.specialization || 'Tronc commun') : user.specialization}
                </p>
                
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{user.ip}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{user.phone}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    user.profileComplete ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {user.profileComplete ? '✓ Profil complet' : '⚠ Profil incomplet'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun utilisateur trouvé</p>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <GraduationCap className="w-8 h-8" />
            <span className="text-3xl font-bold">{students.length}</span>
          </div>
          <p className="text-blue-100 text-sm font-medium">Total Étudiants</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Award className="w-8 h-8" />
            <span className="text-3xl font-bold">{teachers.length}</span>
          </div>
          <p className="text-green-100 text-sm font-medium">Total Enseignants</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8" />
            <span className="text-3xl font-bold">{students.length + teachers.length}</span>
          </div>
          <p className="text-purple-100 text-sm font-medium">Total Utilisateurs</p>
        </div>
      </div>
    </div>
  );
};

export default UsersListTab;