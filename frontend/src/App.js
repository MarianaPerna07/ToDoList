import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { fetchAuthSession } from '@aws-amplify/auth';
import TodoList from './components/TodoList';
import { CssBaseline, Container, Typography, Box } from '@mui/material';

Amplify.configure(awsExports);

const App = () => {
  const [jwtToken, setJwtToken] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (user) {
      const fetchJwtToken = async () => {
        try {
          const session = await fetchAuthSession();
          const token = session.tokens?.idToken?.toString();
          setJwtToken(token);
        } catch (error) {
          console.log('Error fetching JWT token:', error);
        }
      };
      fetchJwtToken();
    }
  }, [user]);

  const handleUserChange = (newUser) => {
    if (newUser !== user) setUser(newUser);
  };


  return (
    <Authenticator>
      {({ signOut, user }) => {
        console.log('User object:', user);
        handleUserChange(user); 
        return (
          <>
            <CssBaseline />
            <Box
              sx={{
                backgroundColor: '#6d6875',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <Container maxWidth="sm">
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h4" component="h1" gutterBottom align="center" color="#ffcdb2">
                    Welcome {user.signInDetails?.loginId || user.username || 'Guest'} 👋
                  </Typography>
                  <Box display="flex" justifyContent="flex-end" marginRight={3}>
                    <button onClick={signOut}
                    style={{
                      backgroundColor: '#e3d5ca',
                      color: '#9d8189',
                      border: 'none',
                      padding: '7px 12px',
                      cursor: 'pointer',
                      borderRadius: '7px',
                      fontSize: '16px',
                    }}
                    
                    >Sign out</button>
                  </Box>
                  <TodoList jwtToken={jwtToken} />
                </Box>
              </Container>
            </Box>
            {/* </CssBaseline> */}
          </>
        );
      }}
    </Authenticator>
  );
};

export default App;
