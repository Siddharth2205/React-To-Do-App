import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function Dashboard() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      if (!currentUser) return;

      setLoading(true);
      setError(null);

      try {
        const tasksRef = collection(db, 'tasks');
        const q = query(tasksRef, where('userId', '==', currentUser.uid));
        const snapshot = await getDocs(q);

        const fetched = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTasks(fetched);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <Typography
        variant="h6"
        sx={{ mt: 4, textAlign: 'center', color: '#eee' }}
      >
        You need to log in to view the dashboard.
      </Typography>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ mt: 4, textAlign: 'center' }}>
        {error}
      </Typography>
    );
  }

  // Process completed tasks
  const completedTasks = tasks.filter(
    task => task.completed && task.completionTime
  );
  const completedPerDay = completedTasks.reduce((acc, task) => {
    try {
      const date = new Date(task.completionTime).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
    } catch (e) {
      console.warn('Invalid date format in completionTime:', task.completionTime);
    }
    return acc;
  }, {});

  const chartData = Object.entries(completedPerDay).map(([date, count]) => ({
    date,
    count,
  }));

  return (
    <Box
      sx={{
        padding: '2rem 3rem',
        backgroundColor: '#121212',
        minHeight: 'calc(100vh - 80px)',
        color: '#eee',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* Title */}
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: '700',
          color: '#f5f5f5',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        📊 Your Task Dashboard
      </Typography>

      <Grid container spacing={4}>
        {/* Bar Chart Section */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={6}
            sx={{
              padding: 2,
              backgroundColor: '#222',
              borderRadius: '12px',
              boxShadow: '0 6px 15px rgba(0,0,0,0.7)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#eee',
              }}
            >
              Tasks Completed Per Day
            </Typography>
            {chartData.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="date" stroke="#ccc" />
                  <YAxis allowDecimals={false} stroke="#ccc" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#333', borderRadius: 4 }}
                    itemStyle={{ color: '#4caf50' }}
                  />
                  <Bar dataKey="count" fill="#4caf50" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography
                sx={{ mt: 4, color: '#bbb', textAlign: 'center', flexGrow: 1 }}
              >
                No completed tasks yet.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Stats Section */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={6}
            sx={{
              padding: 2,
              backgroundColor: '#222',
              borderRadius: '12px',
              boxShadow: '0 6px 15px rgba(0,0,0,0.7)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
            }}
          >
            <Box>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#fff',
                }}
              >
                Overview
              </Typography>
<Typography sx={{ fontSize: '1.1rem', mb: 0.7, color: '#fff' }}>
  Total Tasks: <strong>{tasks.length}</strong>
</Typography>
<Typography sx={{ fontSize: '1.1rem', mb: 0.7, color: '#fff' }}>
  Completed: <strong>{completedTasks.length}</strong>
</Typography>
<Typography sx={{ fontSize: '1.1rem', color: '#fff' }}>
  Pending: <strong>{tasks.length - completedTasks.length}</strong>
</Typography>

            </Box>

            <Button
              variant="contained"
              sx={{
                mt: 3,
                backgroundColor: '#4caf50',
                '&:hover': {
                  backgroundColor: '#43a047',
                },
                fontWeight: '700',
                textTransform: 'uppercase',
              }}
              onClick={() => navigate('/')}
            >
              Back to To-Do App
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Optional: Add a tasks table here if needed */}
      {/* Example table styling in MUI sx if you want */}
    </Box>
  );
}

export default Dashboard;
