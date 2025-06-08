import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';

function App() {
  const [task, setTask] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks');
    return saved
      ? JSON.parse(saved, (key, value) => {
          if (key === 'startTime' || key === 'completionTime') {
            return value ? new Date(value) : null;
          }
          return value;
        })
      : [];
  });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAdd = () => {
    if (task.trim() === '' || !startTime) return;

    const dateString = selectedDate.toISOString().split('T')[0];

    setTasks([
      ...tasks,
      {
        text: task,
        completed: false,
        date: dateString,
        startTime,
        completionTime: null,
        duration: null,
      },
    ]);

    setTask('');
    setStartTime(new Date());
  };

  const handleDelete = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const toggleComplete = (index) => {
    const newTasks = [...tasks];
    const task = newTasks[index];

    if (!task.completed) {
      const now = new Date();
      const durationMs = now - new Date(task.startTime);
      const minutes = Math.floor(durationMs / 60000);
      const seconds = Math.floor((durationMs % 60000) / 1000);

      task.completed = true;
      task.completionTime = now;
      task.duration = `${minutes}m ${seconds}s`;
    } else {
      task.completed = false;
      task.completionTime = null;
      task.duration = null;
    }

    setTasks(newTasks);
  };

  const dateString = selectedDate.toISOString().split('T')[0];

  const filteredTasks = tasks.filter((task) => {
    const matchesDate = task.date === dateString;
    if (filter === 'completed') return task.completed && matchesDate;
    if (filter === 'active') return !task.completed && matchesDate;
    return matchesDate;
  });

  return (
    <div className="app-container">
      <div className="todo-box">
        <h2>📅 Tisha's To-Do List</h2>

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
              <th>Start Time</th>
              <th>Completed</th>
              <th>Duration</th>
              <th>🗑️</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((t, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => toggleComplete(index)}
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
                    onClick={() => handleDelete(index)}
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

export default App;
