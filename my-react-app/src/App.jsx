import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAdd = () => {
    if (task.trim() === '') return;
    setTasks([...tasks, { text: task, completed: false }]);
    setTask('');
  };

  const handleDelete = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const toggleComplete = (index) => {
    const newTasks = [...tasks];
    newTasks[index].completed = !newTasks[index].completed;
    setTasks(newTasks);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'active') return !task.completed;
    return true; // 'all'
  });

  return (
    <div className="app-container">
      <div className="todo-box">
        <h2>🧹 Filtered To-Do App</h2>

        <input
          type="text"
          value={task}
          placeholder="Enter a task"
          onChange={(e) => setTask(e.target.value)}
          className="todo-input"
        />
        <button onClick={handleAdd} className="todo-add-button">
          Add Task
        </button>

        {/* Filter Buttons */}
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

        <ul className="task-list">
          {filteredTasks.map((t, index) => (
            <li key={index} className="task-item">
              <label
                className={`task-label ${t.completed ? 'completed' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={() => toggleComplete(index)}
                  className="task-checkbox"
                />
                {t.text}
              </label>
              <button
                onClick={() => handleDelete(index)}
                className="delete-button"
                aria-label="Delete task"
              >
                ❌
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
