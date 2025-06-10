import { useState, useEffect } from 'react';
import './App.css';
import { auth } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import TodoApp from './TodoApp';
import { useNavigate } from 'react-router-dom';

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async () => {
    setError('');
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // Show loading fallback while checking auth state
  if (authLoading) {
    return <div className="auth-container">Loading...</div>;
  }

  // If user is logged in
  if (user) {
    return (
      <div className="app-container">
        <header className="header">
          <div className="user-info">👋 Welcome, {user.email}</div>
          <div className="header-buttons">
            <button onClick={() => navigate('/dashboard')} className="auth-button">
              📊 Dashboard
            </button>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </header>
        <main className="main-content">
          <TodoApp user={user} />
        </main>
      </div>
    );
  }

  // If not logged in
  return (
    <div className="auth-container">
      <h2>{isRegistering ? 'Create an Account' : 'Login'}</h2>
      <input
        type="email"
        placeholder="Email"
        className="auth-input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="username"
      />
      <input
        type="password"
        placeholder="Password"
        className="auth-input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete={isRegistering ? 'new-password' : 'current-password'}
      />
      <button onClick={handleAuth} className="auth-button">
        {isRegistering ? 'Sign Up' : 'Login'}
      </button>
      {error && <p className="error-message">{error}</p>}
      <p>
        {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          onClick={() => {
            setIsRegistering(!isRegistering);
            setError('');
          }}
          className="toggle-button"
        >
          {isRegistering ? 'Login' : 'Sign up'}
        </button>
      </p>
    </div>
  );
}

export default App;
