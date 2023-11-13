import React, { useEffect, useState } from 'react';
import './App.css';
import { NavigationHeader } from './components/NavigationHeader';
import { TodoBoard } from './components/TodoBoard';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
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
      <BrowserRouter>
        <NavigationHeader />
        <Switch>
          <Route exact path="/board">
            <TodoBoard />
          </Route>
          <Route exact path="/signup">
            <Signup />
          </Route>
          <Route exact path="/login">
            <Login />
          </Route>
          <Route exact path="/">
            <Welcome />
          </Route>
        </Switch>
      </BrowserRouter>
    </UserContextProvider>
  );
}

export default App;