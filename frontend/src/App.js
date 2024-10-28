// App.js

import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { fetchAuthSession } from '@aws-amplify/auth';
import TodoList from './components/TodoList';
import { CssBaseline, Container, Typography, Box } from '@mui/material';

Amplify.configure(awsExports);

function App() {
  const [jwtToken, setJwtToken] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchJwtToken = async () => {
      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        setJwtToken(token);
      } catch (error) {
        console.log('Error fetching JWT token:', error);
      }
    };

    if (user) {
      fetchJwtToken();
    }
  }, [user]);

  return (
    <Authenticator
      initialState="signIn"
      components={{
        SignUp: {
          FormFields() {
            return (
              <>
                <Authenticator.SignUp.FormFields />
                <div><label>First name</label></div>
                <input type="text" name="given_name" placeholder="Please enter your first name" />
                <div><label>Last name</label></div>
                <input type="text" name="family_name" placeholder="Please enter your last name" />
                <div><label>Email</label></div>
                <input type="text" name="email" placeholder="Please enter a valid email" />
              </>
            );
          },
        },
      }}
      services={{
        async validateCustomSignUp(formData) {
          if (!formData.given_name) {
            return { given_name: 'First Name is required' };
          }
          if (!formData.family_name) {
            return { family_name: 'Last Name is required' };
          }
          if (!formData.email) {
            return { email: 'Email is required' };
          }
        },
      }}
    >
      {({ signOut, user }) => {
        setUser(user); // Set the user object for useEffect to trigger

        return (
          <CssBaseline>
            <Container maxWidth="sm">
              <Box sx={{ mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                  Welcome, {user.username}
                </Typography>
                <Box display="flex" justifyContent="flex-end">
                  <button onClick={signOut}>Sign out</button>
                </Box>
                <TodoList jwtToken={jwtToken} />
              </Box>
            </Container>
          </CssBaseline>
        );
      }}
    </Authenticator>
  );
}

export default App;
