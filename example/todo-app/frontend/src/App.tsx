import React, { useEffect, useState } from 'react';
import './App.css';
import { NavigationHeader } from './components/NavigationHeader';
import { TodoBoard } from './components/TodoBoard';
import { Route, Switch } from 'react-router-dom';
import { Signup } from './components/Signup';
import { Login } from './components/Login';
import { Welcome } from './components/Welcome';
import { UserContextProvider } from './contexts/UserContext';
import { BackendService } from './backend/BackendService';

function App() {

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    BackendService.refreshCsrfToken()
      .finally(() => setInitialized(true));
  }, []);

  if (!initialized) {
    return (
      <React.Fragment />
    );
  }
  
  return (
    <UserContextProvider>
      <NavigationHeader />
      <Switch>
        <Route path="/board">
          <TodoBoard />
        </Route>
        <Route path="/signup">
          <Signup />
        </Route>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/">
          <Welcome />
        </Route>
      </Switch>
    </UserContextProvider>
  );
}

export default App;