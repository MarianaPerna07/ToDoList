import React from 'react';
import {
  Checkbox,
  IconButton,
  Typography,
  Stack,
  Chip,
  Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function TodoItem({ task, deleteTask, toggleCompleted }) {
  function handleChange() {
    toggleCompleted(task.id);
  }

  const priorityColors = {
    high: 'error',
    medium: 'warning',
    low: 'success',
  };

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Checkbox
          checked={task.is_completed === 1}
          onChange={handleChange}
          color="primary"
        />
        <Stack flexGrow={1}>
          <Typography
            variant="h6"
            className={task.is_completed === 1 ? 'completed' : ''}
            sx={{ textDecoration: task.is_completed === 1 ? 'line-through' : 'none' }}
          >
            {task.title}
          </Typography>
          {task.description && (
            <Typography variant="body2" color="textSecondary">
              {task.description}
            </Typography>
          )}
          <Stack direction="row" spacing={1} mt={1}>
            {task.priority && (
              <Chip
                label={`Priority: ${task.priority}`}
                color={priorityColors[task.priority]}
                size="small"
              />
            )}
            {task.deadline && (
              <Chip
                label={`Deadline: ${new Date(task.deadline).toLocaleDateString()}`}
                size="small"
              />
            )}
          </Stack>
        </Stack>
        <IconButton onClick={() => deleteTask(task.id)}>
          <DeleteIcon />
        </IconButton>
      </Stack>
    </Paper>
  );
}

export default TodoItem;
