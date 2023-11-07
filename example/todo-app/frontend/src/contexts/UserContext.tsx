import React, { useContext, useState } from 'react';
import { BackendService } from '../backend/BackendService';

export class AccountConflictError {}

export class AuthenticationFailedError {}

/**
 * React v18からpropsを定義する際にchildrenプロパティを明示的に列挙する必要がある。
 * 
 * @See https://ja.react.dev/blog/2022/03/08/react-18-upgrade-guide#updates-to-typescript-definitions
 */
type Props = {
  children?: React.ReactNode,
}

type ContextValueType = {
  signup: (userName: string, password: string) => Promise<void | AccountConflictError>,
  login: (userName: string, password: string) => Promise<void | AuthenticationFailedError>,
  logout: () => Promise<void>,
  userName: string
  isLoggedIn: boolean,
}

export const UserContext = React.createContext<ContextValueType>({} as ContextValueType);

export const useUserContext = () => useContext(UserContext);

export const UserContextProvider: React.FC<Props> = ({ children }) => {
  const [userName, setUserName] = useState<string>('');

  const contextValue: ContextValueType = {
    signup: async (userName, password) => {
      try {
        await BackendService.signup(userName, password);
      } catch(error) {
        if (error.status === 409) {
          return new AccountConflictError();
        }
        throw error;
      }
    },
    login: async (userName, password) => {
      try {
        await BackendService.login(userName, password);
        await BackendService.refreshCsrfToken();
        setUserName(userName);
      } catch(error) {
        if (error.status === 401) {
          return new AuthenticationFailedError();
        }
        throw error;
      }
    },
    logout: async () => {
      await BackendService.logout();
      await BackendService.refreshCsrfToken();
      setUserName('');
    },
    userName: userName,
    isLoggedIn: userName !== ''
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};