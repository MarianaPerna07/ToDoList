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
  Stack,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import pt from 'date-fns/locale/pt-BR';

function TodoList({ jwtToken }) {
  const [tasks, setTasks] = useState([]);
  const [baseTasks, setBaseTasks] = useState([]);
  // const [sortedTasks, setSortedTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // const [creation_date, setCreation_date] = useState(null);
  const [deadline, setDeadline] = useState(null);
  const [priority, setPriority] = useState('');
  const [editTaskId, setEditTaskId] = useState(null);
  const [sortOption, setSortOption] = useState('-creation_date');
  const [filterOption, setFilterOption] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    if (jwtToken) {
      fetchTasks(jwtToken);
    }
  }, [jwtToken]);

  // useEffect(() => {
  //   if (baseTasks.length > 0) {
  //     handleFilterChange({ target: { value: filterOption } });
  //     handleSortChange({ target: { value: sortOption } });
  //   }
  // }, [filterOption, baseTasks]);

  useEffect(() => {
    applyCombinedFilters();
  }, [filterOption, priorityFilter, baseTasks, sortOption]);

  // useEffect(() => {
  //   // Sort tasks whenever baseTasks or sortOption changes
  //   const sortedTasks = sortTasks(baseTasks);
  //   setTasks(sortedTasks);
  // }, [baseTasks, sortOption]);

  const fetchTasks = async (token) => {
    try {
      const response = await axios.get('http://localhost:8000/tasks/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks(response.data);
      setBaseTasks(response.data);
      // handleFilterChange({ target: { value: filterOption } });
      console.log("Tasks fetched:", response.data); 
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const addOrUpdateTask = async () => {
    console.log("addOrUpdateTask called, editTaskId:", editTaskId); // Log para verificar qual função será chamada
    if (editTaskId) {
      await updateTask(editTaskId);
    } else {
      await addTask();
    }
  };
  

  const addTask = async () => {
    try {
      const requestData = {
        title,
        description,
        deadline: deadline ? deadline.toISOString() : null, // Converte para ISO
        creation_date: new Date().toISOString(), // Adiciona a data de criação
        priority,
      };

      // Check if deadline is before creation date
      if (deadline && deadline < new Date()) {
        console.error('Deadline must be after creation date');
        alert('Deadline must be after creation date');
        return;
      }
  
      console.log("Adding task with data:", requestData); // Log dos valores antes de enviar
  
      const response = await axios.post(
        'http://localhost:8000/tasks/',
        requestData,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
  
      setTasks([...tasks, response.data]);
      setBaseTasks([...baseTasks, response.data]);
      resetForm();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };
  
  const sortTasks = (tasksToSort) => {
    return [...tasksToSort].sort((a, b) => {
      if (sortOption === 'creation_date') {
        return new Date(a.creation_date) - new Date(b.creation_date);
      } else if (sortOption === '-creation_date') {
        return new Date(b.creation_date) - new Date(a.creation_date);
      } else if (sortOption === 'deadline_date') {
        return new Date(a.deadline) - new Date(b.deadline);
      } else if (sortOption === '-deadline_date') {
        return new Date(b.deadline) - new Date(a.deadline);
      }
      return 0;
    });
  };
  
  const updateTask = async (taskId) => {
    try {
      const requestData = {
        title,
        description,
        deadline: deadline ? deadline.toISOString() : null, // Converte para ISO
        priority,
      };
  
      console.log("Updating task with ID:", taskId);
      console.log("Task data:", requestData); // Log dos valores antes de enviar
  
      const response = await axios.put(
        `http://localhost:8000/tasks/${taskId}`,
        requestData,
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
  
      // setTasks(tasks.map((task) => (task.id === taskId ? response.data : task)));
      setBaseTasks(baseTasks.map((task) => (task.id === taskId ? response.data : task)));

      // Sort tasks after updating
      // const sortedTasks = sortTasks(baseTasks);
      // setTasks(sortedTasks);
      resetForm();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/tasks/${id}`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      setTasks(tasks.filter((task) => task.id !== id));
      setBaseTasks(baseTasks.filter((task) => task.id !== id));
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
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
      setTasks(tasks.map((task) => (task.id === id ? response.data : task)));
      setBaseTasks(baseTasks.map((task) => (task.id === id ? response.data : task)));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  // const handleFilterChange = (event) => {
  //   setFilterOption(event.target.value);
  //   console.log("Filter option changed to:", event.target.value);
  //   if (event.target.value === 'all') {
  //     setTasks(baseTasks);
  //   }
  //   else if (event.target.value === 'completed') {
  //     setTasks(baseTasks.filter((task) => task.is_completed));
  //   }
  //   else if (event.target.value === 'pending') {
  //     setTasks(baseTasks.filter((task) => !task.is_completed));
  //   }
  // };

  const handleFilterChange = (event) => {
    setFilterOption(event.target.value);
  };

  const handlePriorityFilterChange = (event) => {
    setPriorityFilter(event.target.value);
  };

  const applyCombinedFilters = () => {
    let filteredTasks = [...baseTasks];

    // Apply completion filter
    if (filterOption === 'completed') {
      filteredTasks = filteredTasks.filter((task) => task.is_completed);
    } else if (filterOption === 'pending') {
      filteredTasks = filteredTasks.filter((task) => !task.is_completed);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filteredTasks = filteredTasks.filter((task) => task.priority === priorityFilter);
    }

    const sortedFilteredTasks = sortTasks(filteredTasks);
    setTasks(sortedFilteredTasks);
  };

  const startEditing = (task) => {
    console.log("Editing task:", task); // Log da tarefa antes de definir no formulário
  
    setEditTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setDeadline(task.deadline ? new Date(task.deadline) : null); // Converte para Date se necessário
    setPriority(task.priority || '');
  };
  

  const resetForm = () => {
    console.log("Resetting form");
    setTitle('');
    setDescription('');
    setDeadline(null);
    setPriority('');
    setEditTaskId(null);
  };
  

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}  adapterLocale={pt}>
      <Box display="flex" flexDirection="column" alignItems="center" p={3} minHeight="100vh" bgcolor="#6d6875">
        <Paper elevation={3} style={{ 
          padding: 30, 
          maxWidth: 600, 
          width: '100%', 
          borderRadius: '10px',
          backgroundColor: '#f5ebe0',
          boxShadow: '10px 10px 20px rgba(0, 0, 0, 0.35)',
        }}>
          <Typography variant="h4" gutterBottom align="center" style={{ fontWeight: 'bold', color: '#6d6875' }}>
            To-Do List
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <TextField
                label="Title"
                fullWidth
                value={title || ''}
                onChange={(e) => setTitle(e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Description"
                fullWidth
                value={description || ''}
                onChange={(e) => setDescription(e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Deadline"
                  value={deadline || null}
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
                  value={priority || ''}
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
                color={editTaskId ? 'secondary' : 'primary'}
                startIcon={editTaskId ? null : <AddIcon />}
                onClick={addOrUpdateTask}
                fullWidth
                style={{
                  backgroundColor: editTaskId ? '#e76f51' : '#6d6875',
                  color: '#ffffff',
                  padding: '10px 0',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                }}
              >
                {editTaskId ? 'Update Task' : 'ADD TASK'}
              </Button>
            </Grid>
          </Grid>
          <Typography variant="h5" style={{ marginTop: 20, fontWeight: 'bold', color: '#6d6875' }}>
            My Tasks
          </Typography>
          {/* Create a drop down menu to sort the tasks by Creation Date or Deadline Date (both ascending or descending) */}
          <FormControl fullWidth variant="outlined" style={{ marginTop: 10 }}>
            <InputLabel>Sort By</InputLabel>
            <Select value={sortOption} onChange={handleSortChange} label="Sort By">
              <MenuItem value="creation_date">Creation Date (Ascending)</MenuItem>
              <MenuItem value="-creation_date">Creation Date (Descending)</MenuItem>
              <MenuItem value="deadline_date">Deadline Date (Ascending)</MenuItem>
              <MenuItem value="-deadline_date">Deadline Date (Descending)</MenuItem>
            </Select>
          </FormControl>
          {/* Create a drop down menu to filter the tasks by All, Completed or Pending */}
          <FormControl fullWidth variant="outlined" style={{ marginTop: 10 }}>
            <InputLabel>Filter By Status</InputLabel>
            <Select value={filterOption} onChange={handleFilterChange} label="Filter By Status">
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth variant="outlined" style={{ marginTop: 10 }}>
            <InputLabel>Filter By Priority</InputLabel>
            <Select value={priorityFilter} onChange={handlePriorityFilterChange} label="Filter By Priority">
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </Select>
          </FormControl>
          {tasks.length === 0 ? (
            <Box textAlign="center" style={{ marginTop: 20 }}>
            <Typography variant="h6" color="textSecondary">
              No tasks to show 😔
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Add a new task or adjust your filters.
            </Typography>
          </Box>
          ) : (
            tasks.map((task) => (
              <Paper
                key={task.id}
                elevation={1}
                style={{
                  padding: 15,
                  marginTop: 25,
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: task.is_completed === 1 ? '#9d8189' : '#e3d5ca',
                  borderRadius: '8px',
                  boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.20)',
                  alignItems: 'flex-start',
                }}
              >
                <Box flex={1} display="flex" flexDirection="column" justifyContent="space-between" height="100%">
                  <Box>
                    <Typography
                      variant="h6"
                      style={{
                        textDecoration: task.is_completed ? 'line-through' : 'none',
                        color: task.is_completed ? '#e3d5ca' : '#6d6875',
                        fontWeight: task.is_completed ? 'normal' : 'bold',
                        fontStyle: 'italic',
                      }}
                    >
                      {task.title}
                    </Typography>
                    <Typography variant="body" style={{ color: task.is_completed ? '#e3d5ca' : '#6d6875' }}>
                    • {task.description}
                    </Typography>
                  </Box>
                 
                  {/* <Divider sx={{ borderColor: task.is_completed ? '#e3d5ca' : '#6d6875', borderStyle: 'dashed', marginY: 1}}/> */}
                  <Box display="flex" flexDirection="column-reverse" alignItems="flex-start" sx={{ mt: 3 }}>
                    <Typography variant="caption" display="block" style={{ color: task.is_completed ? '#e3d5ca' : '#6d6875' }}>
                      {/* format Creation Date to DD-MM-YYYY withouth HH-MM-SS */}
                      {task.deadline
                        ? `Deadline: ${new Date(task.deadline).toLocaleString('pt-BR', { dateStyle: 'short' })}`
                        : 'No deadline'}
                    </Typography>
                    <Typography variant="caption" display="block" style={{ color: task.is_completed ? '#e3d5ca' : '#6d6875' }}>
                      {/* format Creation Date to DD-MM-YYYY HH-MM-SS as 24-hour format */}
                      Creation Date: {new Date(task.creation_date).toLocaleString('pt-BR')}
                    </Typography>
                    <Typography variant="caption"  display="block" style={{ color: task.is_completed ? '#e3d5ca' : '#6d6875' }}>
                      Priority: {task.priority}
                    </Typography>
                  </Box>
                </Box>


                <Stack direction="column" spacing={0} alignItems="flex-start" style={{ marginRight: -10, marginLeft : 5 }}height="100%">
                  <Checkbox
                    checked={Boolean(task.is_completed)}
                    onChange={() => toggleCompleted(task.id)}
                    style={{ color: task.is_completed ? '#e3d5ca' : '#9d8189'}}
                  />
                  <IconButton onClick={() => startEditing(task)}>
                    <EditIcon style={{ color: task.is_completed ? '#e3d5ca' : '#9d8189' }} />
                  </IconButton>
                  <IconButton onClick={() => deleteTask(task.id)}>
                    <DeleteIcon style={{ color: '#e76f51' }} />
                  </IconButton>
                </Stack>
              </Paper>
            ))
          )}
        </Paper>
      </Box>
    </LocalizationProvider>
  );
}

export default TodoList;
