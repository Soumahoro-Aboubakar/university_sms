import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = ({ onShowSignup }) => {
  const { login } = useAuth();
  const [userType, setUserType] = useState('student');
  const [identifier, setIdentifier] = useState('');
  const [passwordOrPhone, setPasswordOrPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier || !passwordOrPhone) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    const result = await login(identifier, passwordOrPhone, userType);
    setLoading(false);
     console.log("Afficher le resultat de la requette ", result);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Bell className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Plateforme SMS</h1>
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
          <button
            onClick={() => setUserType('admin')}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              userType === 'admin'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🏛️ Admin
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {userType === 'admin' ? 'Email' : 'Identifiant Permanent (IP)'}
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={userType === 'admin' ? 'admin@univ.ci' : 'IP2024001'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {userType === 'admin' ? 'Mot de passe' : 'Numéro de téléphone'}
            </label>
            <input
              type={userType === 'admin' ? 'password' : 'tel'}
              value={passwordOrPhone}
              onChange={(e) => setPasswordOrPhone(e.target.value)}
              placeholder={userType === 'admin' ? '••••••••' : '+2250712345678'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          {userType !== 'admin' && (
            <button
              type="button"
              onClick={onShowSignup}
              disabled={loading}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all"
            >
              Créer un compte
            </button>
          )}
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-gray-600">
          <p className="font-semibold mb-2">Identifiants de test :</p>
          <p>👨‍🎓 Étudiant: IP2023001 / +2250712345678</p>
          <p>👨‍🏫 Enseignant: IP2020T001 / +2250711223344</p>
          <p>🏛️ Admin: admin@univ.ci / admin123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;