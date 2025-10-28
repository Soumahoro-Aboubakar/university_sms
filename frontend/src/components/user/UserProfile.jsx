import React, { useState, useEffect } from 'react';
import { GraduationCap, Award, LogOut, Edit2, Check, X, Settings, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/api';

const UserProfile = () => {
  const { currentUser, logout, updateUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [needsProfileUpdate, setNeedsProfileUpdate] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const levels = ['L1', 'L2', 'L3', 'M1', 'M2'];
  const specializations = ['Mathématique', 'Informatique'];
  const grades = ['Professeur', 'Maître de Conférences', 'Assistant', 'Chargé de Cours', 'Doctorant'];

  useEffect(() => {
    if (!currentUser.profileComplete) {
      setNeedsProfileUpdate(true);
      setEditMode(true);
      setEditedUser({ ...currentUser });
    }
  }, [currentUser]);

  const handleEditProfile = () => {
    setEditedUser({ ...currentUser });
    setEditMode(true);
  };

  const handleSaveProfile = async () => {
    if (!editedUser.phone || editedUser.phone.trim() === '') {
      alert('Le numéro de téléphone est obligatoire');
      return;
    }

    if (needsProfileUpdate && (!editedUser.firstName || !editedUser.lastName)) {
      alert('Veuillez compléter votre nom et prénom');
      return;
    }

    setSaving(true);
    try {
      if (currentUser.type === 'student') {
        await profileService.updateStudentProfile({
          firstName: editedUser.firstName,
          lastName: editedUser.lastName,
          phone: editedUser.phone,
          level: editedUser.level,
          specialization: editedUser.specialization,
        });
      } else if (currentUser.type === 'teacher') {
        await profileService.updateTeacherProfile({
          firstName: editedUser.firstName,
          lastName: editedUser.lastName,
          phone: editedUser.phone,
          grade: editedUser.grade,
          specialization: editedUser.specialization,
        });
      }

      updateUser({ ...editedUser, profileComplete: true });
      setEditMode(false);
      setNeedsProfileUpdate(false);
      alert('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      alert(error.response?.data?.error || 'Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout();
    }
  };

  const isStudent = currentUser.type === 'student';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className={`${isStudent ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-green-500 to-green-600'} text-white shadow-lg`}>
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${isStudent ? 'bg-blue-700' : 'bg-green-700'} rounded-xl flex items-center justify-center`}>
                {isStudent ? <GraduationCap className="w-6 h-6" /> : <Award className="w-6 h-6" />}
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  {isStudent ? 'Espace Étudiant' : 'Espace Enseignant'}
                </h1>
                <p className="text-sm opacity-90">
                  {currentUser.firstName} {currentUser.lastName}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {needsProfileUpdate && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <Settings className="h-5 w-5 text-orange-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-orange-800 font-medium">
                  Veuillez compléter votre profil en ajoutant votre nom et prénom
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Mon Profil</h2>
            {!editMode ? (
              <button
                onClick={handleEditProfile}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all shadow-md"
              >
                <Edit2 className="w-4 h-4" />
                Modifier
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all shadow-md disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setEditedUser(null);
                  }}
                  disabled={saving || needsProfileUpdate}
                  className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Annuler
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom {needsProfileUpdate && <span className="text-red-500">*</span>}
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={editedUser.firstName}
                    onChange={(e) => setEditedUser({ ...editedUser, firstName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Votre prénom"
                    disabled={saving}
                  />
                ) : (
                  <p className="text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-lg">
                    {currentUser.firstName || '---'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom {needsProfileUpdate && <span className="text-red-500">*</span>}
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={editedUser.lastName}
                    onChange={(e) => setEditedUser({ ...editedUser, lastName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Votre nom"
                    disabled={saving}
                  />
                ) : (
                  <p className="text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-lg">
                    {currentUser.lastName || '---'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Identifiant Permanent
                </label>
                <p className="text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-lg">
                  {currentUser.ip}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                {editMode ? (
                  <input
                    type="tel"
                    value={editedUser.phone}
                    onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={saving}
                  />
                ) : (
                  <p className="text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-lg">
                    {currentUser.phone}
                  </p>
                )}
              </div>

              {isStudent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Niveau</label>
                  {editMode ? (
                    <select
                      value={editedUser.level}
                      onChange={(e) => setEditedUser({ ...editedUser, level: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={saving}
                    >
                      {levels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-lg">
                      {currentUser.level}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spécialisation
                </label>
                {editMode ? (
                  <select
                    value={editedUser.specialization || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, specialization: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={saving || (isStudent && (currentUser.level === 'L1' || currentUser.level === 'L2'))}
                  >
                    {isStudent && (currentUser.level === 'L1' || currentUser.level === 'L2') ? (
                      <option value="">Tronc commun (Math & Info)</option>
                    ) : (
                      specializations.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))
                    )}
                  </select>
                ) : (
                  <p className="text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-lg">
                    {currentUser.specialization || 'Tronc commun (Mathématique et Informatique)'}
                  </p>
                )}
              </div>

              {!isStudent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                  {editMode ? (
                    <select
                      value={editedUser.grade}
                      onChange={(e) => setEditedUser({ ...editedUser, grade: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={saving}
                    >
                      {grades.map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-lg">
                      {currentUser.grade}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Informations importantes
            </h3>
            <p className="text-sm text-blue-800">
              Votre numéro de téléphone est utilisé pour recevoir les notifications SMS importantes de l'université.
              Assurez-vous qu'il est toujours à jour pour ne manquer aucune information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;