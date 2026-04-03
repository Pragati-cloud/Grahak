import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Lock, ArrowRight, UserPlus, LogIn, X } from 'lucide-react';

export default function AuthPage({ onComplete }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'customer' })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.errors?.[0]?.msg || 'Authentication failed');
      } else {
        // Save to local storage for persistence
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        
        // Pass the user upwards
        if (onComplete) onComplete(data.user);
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-[70vh] flex items-center justify-center p-8 mandala-bg relative"
    >
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border-2 border-accent/10 relative">
        <button 
          onClick={() => onComplete(null)} 
          className="absolute top-4 right-4 text-on-surface/40 hover:text-accent transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-secondary">
            {isLogin ? <LogIn size={24} /> : <UserPlus size={24} />}
          </div>
          <h2 className="text-3xl font-headline font-bold text-on-surface">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <AnimatePresence>
            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/40" size={18} />
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    required={!isLogin}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-surface-container-low pl-12 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body text-sm"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/40" size={18} />
            <input 
              type="email" 
              placeholder="Email Address" 
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-surface-container-low pl-12 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body text-sm"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/40" size={18} />
            <input 
              type="password" 
              placeholder="Password" 
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-surface-container-low pl-12 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body text-sm"
            />
          </div>

          {error && <p className="text-accent text-xs font-bold text-center bg-accent/10 py-2 rounded-lg px-2">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-secondary text-white font-bold py-4 rounded-xl mt-2 flex items-center justify-center gap-2 hover:bg-accent transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-on-surface/50 font-body">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            type="button"
            className="text-secondary font-bold text-sm tracking-wide uppercase mt-1 hover:underline"
          >
            {isLogin ? "Sign Up Now" : "Login Instead"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
