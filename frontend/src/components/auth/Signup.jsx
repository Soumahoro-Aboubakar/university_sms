import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { authService } from '../../services/api';

const Signup = ({ onBackToLogin }) => {
  const [userType, setUserType] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSpecialization, setShowSpecialization] = useState(false);

  const levels = ['L1', 'L2', 'L3', 'M1', 'M2'];
  const specializations = ['Mathématique', 'Informatique'];
  const grades = ['Professeur', 'Maître de Conférences', 'Assistant', 'Chargé de Cours', 'Doctorant'];

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    const ip = e.target.ip.value;
    const phone = e.target.phone.value;

    if (!ip || !phone) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);

    try {
      if (userType === 'student') {
        const level = e.target.level.value;
        const specialization = showSpecialization ? e.target.specialization.value : null;

        await authService.signupStudent({
          ip,
          phone,
          level,
          specialization,
        });
      } else {
        const grade = e.target.grade.value;
        const specialization = e.target.specialization.value;

        await authService.signupTeacher({
          ip,
          phone,
          grade,
          specialization,
        });
      }

      alert('Inscription réussie ! Veuillez vous connecter.');
      onBackToLogin();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const handleLevelChange = (e) => {
    const level = e.target.value;
    setShowSpecialization(level === 'L3' || level === 'M1' || level === 'M2');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <UserPlus className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Inscription</h1>
          <p className="text-gray-600">Département Science et Technique</p>
          <p className="text-sm text-gray-500">Filière Mathématique et Informatique</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setUserType('student')}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              userType === 'student'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            👨‍🎓 Étudiant
          </button>
          <button
            onClick={() => setUserType('teacher')}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              userType === 'teacher'
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            👨‍🏫 Enseignant
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Identifiant Permanent (IP) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="ip"
                placeholder="Ex: IP2024001"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="+225 XX XX XX XX XX"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={loading}
                required
              />
            </div>
          </div>

          {userType === 'student' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Niveau <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="level"
                    onChange={handleLevelChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    disabled={loading}
                    required
                  >
                    {levels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                {showSpecialization && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Spécialisation <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="specialization"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      disabled={loading}
                      required
                    >
                      {specializations.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <p><strong>Note :</strong> L1 et L2 = Tronc commun (Mathématique et Informatique)</p>
                <p>À partir de L3 : choisir votre spécialisation</p>
              </div>
            </>
          )}

          {userType === 'teacher' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade <span className="text-red-500">*</span>
                </label>
                <select
                  name="grade"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  disabled={loading}
                  required
                >
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spécialisation <span className="text-red-500">*</span>
                </label>
                <select
                  name="specialization"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  disabled={loading}
                  required
                >
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>

          <button
            type="button"
            onClick={onBackToLogin}
            disabled={loading}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all"
          >
            Retour à la connexion
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-gray-600">
          <p className="font-semibold mb-2">ℹ️ Informations importantes :</p>
          <p>• Votre IP et téléphone doivent être valides</p>
          <p>• Vous devrez compléter votre nom et prénom lors de la première connexion</p>
          <p>• Format téléphone : +2250712345678 (sans espaces)</p>
        </div>
      </div>
    </div>
  );
};

export default Signup;