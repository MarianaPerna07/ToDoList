import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  IconButton,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

function TodoList({ jwtToken }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(null);
  const [priority, setPriority] = useState('');
  const [sortOption, setSortOption] = useState('creation_date');
  const [filterOption, setFilterOption] = useState('all');

  useEffect(() => {
    if (jwtToken) {
      fetchTasks(jwtToken);
    }
  }, [jwtToken]);

  const fetchTasks = async (token) => {
    try {
      const response = await axios.get('http://localhost:8000/tasks/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const addTask = async () => {
    try {
      const response = await axios.post(
        'http://localhost:8000/tasks/',
        {
          title,
          description,
          deadline,
          priority,
        },
        {
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
          },
        }
      );
      setTasks([...tasks, response.data]);
      setTitle('');
      setDescription('');
      setDeadline(null);
      setPriority('');
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/tasks/${id}`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
      });
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const toggleCompleted = async (id) => {
    try {
      const response = await axios.put(
        `http://localhost:8000/tasks/${id}/toggle`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
          },
        }
      );
      setTasks(tasks.map((task) => (task.id === id ? response.data : task)));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilterOption(event.target.value);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box display="flex" flexDirection="column" alignItems="center" p={3} minHeight="100vh" bgcolor="#f0f2f5">
        <Paper elevation={3} style={{ padding: 30, maxWidth: 600, width: '100%', borderRadius: '15px' }}>
          <Typography variant="h4" gutterBottom align="center" style={{ fontWeight: 'bold', color: '#1976d2' }}>
            To-Do List
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <TextField
                label="Title"
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Description"
                fullWidth
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Deadline"
                value={deadline}
                onChange={(newDate) => setDeadline(newDate)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  label="Priority"
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={addTask}
                fullWidth
                style={{
                  backgroundColor: '#1976d2',
                  color: '#ffffff',
                  padding: '10px 0',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                }}
              >
                + ADD TASK
              </Button>
            </Grid>
          </Grid>
          <Typography variant="h5" style={{ marginTop: 20, fontWeight: 'bold', color: '#333' }}>
            My Tasks
          </Typography>
          {tasks.map((task) => (
            <Paper
              key={task.id}
              elevation={1}
              style={{
                padding: 15,
                marginTop: 10,
                display: 'flex',
                alignItems: 'center',
                backgroundColor: task.is_completed ? '#e3f2fd' : '#ffffff',
                borderRadius: '10px',
              }}
            >
              <Checkbox
                checked={task.is_completed}
                onChange={() => toggleCompleted(task.id)}
                color="primary"
              />
              <Box flex={1}>
                <Typography
                  variant="h6"
                  style={{
                    textDecoration: task.is_completed ? 'line-through' : 'none',
                    color: task.is_completed ? '#757575' : '#333',
                    fontWeight: task.is_completed ? 'normal' : 'bold',
                  }}
                >
                  {task.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {task.description}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {task.deadline
                    ? `Deadline: ${new Date(task.deadline).toLocaleDateString()}`
                    : 'No deadline'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Priority: {task.priority || 'None'}
                </Typography>
              </Box>
              <IconButton onClick={() => deleteTask(task.id)}>
                <DeleteIcon color="error" />
              </IconButton>
            </Paper>
          ))}
        </Paper>
      </Box>
    </LocalizationProvider>
  );
}

export default TodoList;
