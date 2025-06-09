import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';
import { db } from './firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

function TodoApp({ user }) {
  const [task, setTask] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');

  const dateString = selectedDate.toISOString().split('T')[0];

  useEffect(() => {
    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid),
      where('date', '==', dateString)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTasks(fetchedTasks);
    });
    return () => unsub();
  }, [user.uid, dateString]);

  const handleAdd = async () => {
    if (task.trim() === '' || !startTime) return;

    await addDoc(collection(db, 'tasks'), {
      userId: user.uid,
      text: task,
      completed: false,
      date: dateString,
      startTime: startTime.toISOString(),
      completionTime: null,
      duration: null,
    });

    setTask('');
    setStartTime(new Date());
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'tasks', id));
  };

  const toggleComplete = async (t) => {
    const now = new Date();
    const taskRef = doc(db, 'tasks', t.id);

    if (!t.completed) {
      const durationMs = now - new Date(t.startTime);
      const minutes = Math.floor(durationMs / 60000);
      const seconds = Math.floor((durationMs % 60000) / 1000);
      await updateDoc(taskRef, {
        completed: true,
        completionTime: now.toISOString(),
        duration: `${minutes}m ${seconds}s`,
      });
    } else {
      await updateDoc(taskRef, {
        completed: false,
        completionTime: null,
        duration: null,
      });
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'completed') return task.completed;
    if (filter === 'active') return !task.completed;
    return true;
  });

  return (
    <div className="app-container">
      <div className="todo-box">
        <h2>📅 Mrs Mommo's To-Do List</h2>

        <div className="input-group">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="yyyy-MM-dd"
            className="todo-input"
          />

          <DatePicker
            selected={startTime}
            onChange={(date) => setStartTime(date)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Start Time"
            dateFormat="h:mm aa"
            className="todo-input"
          />

          <input
            type="text"
            value={task}
            placeholder="Enter a task"
            onChange={(e) => setTask(e.target.value)}
            className="todo-input"
          />
        </div>

        <button onClick={handleAdd} className="todo-add-button">
          Add Task
        </button>

        <div className="filter-buttons">
          {['all', 'active', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`filter-button ${filter === f ? 'active' : ''}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <table className="task-table">
          <thead>
            <tr>
              <th>✔️</th>
              <th>Task</th>
              <th>Start</th>
              <th>Completed</th>
              <th>Duration</th>
              <th>🗑️</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((t) => (
              <tr key={t.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => toggleComplete(t)}
                  />
                </td>
                <td className={t.completed ? 'completed' : ''}>{t.text}</td>
                <td>{new Date(t.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td>
                  {t.completed
                    ? new Date(t.completionTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '--'}
                </td>
                <td>{t.completed ? t.duration : '--'}</td>
                <td>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="delete-button"
                    aria-label="Delete task"
                  >
                    ❌
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TodoApp;
