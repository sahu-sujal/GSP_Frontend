import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, LogIn } from 'lucide-react';
import { useAdmin } from '../../store/Admin/useAdmin';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const { adminLogin, loading } = useAdmin();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await adminLogin(credentials);
    if (success) {
      toast.success('Login successful');
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-gray-900 p-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-lg rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Admin Login</h2>
          <p className="text-gray-300">Please sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Username"
                className="w-full pl-12 pr-4 py-3 bg-black/20 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                placeholder="Password"
                className="w-full pl-12 pr-4 py-3 bg-black/20 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 text-white"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium transition-colors duration-200"
          >
            {loading ? (
              'Logging in...'
            ) : (
              <>
                <LogIn size={20} />
                Login
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;