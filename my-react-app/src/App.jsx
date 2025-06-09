import { useState } from 'react';
import './App.css';
import { auth } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import TodoApp from './TodoApp';
import { useEffect } from 'react';

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user || null);
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async () => {
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (user) {
    return (
      <div>
        <div className="header">
          <span>👋 Welcome, {user.email}</span>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
        <TodoApp user={user} />
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h2>{isRegistering ? 'Create an Account' : 'Login'}</h2>
      <input
        type="email"
        placeholder="Email"
        className="auth-input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="auth-input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleAuth} className="auth-button">
        {isRegistering ? 'Sign Up' : 'Login'}
      </button>
      <p>
        {isRegistering ? 'Already have an account?' : "Don't have an account?"}
        <button onClick={() => setIsRegistering(!isRegistering)} className="toggle-button">
          {isRegistering ? 'Login' : 'Sign up'}
        </button>
      </p>
    </div>
  );
}

export default App;
