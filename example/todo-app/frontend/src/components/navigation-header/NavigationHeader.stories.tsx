import {Meta, StoryObj} from '@storybook/react';
import {NavigationHeader} from './NavigationHeader';
import {action} from '@storybook/addon-actions';
import {UserContext} from '../../contexts/UserContext';
import React, {useState} from 'react';

const MockUserContextProvider: React.FC<{userName: string; isLoggedIn: boolean; children: React.ReactNode}> = ({
  userName,
  isLoggedIn,
  children,
}) => {
  const [currentUserName, setCurrentUserName] = useState(userName);

  const mockContextValue = {
    userName: currentUserName,
    // 実際のUserContextでは、「ログアウト」ボタンを押下時に、ログイン状態(isLoggedIn)がfalseに変更される。
    // StoryBook上では、「ログアウト」ボタン押下時にログイン状態をfalseにすると、prefetchが行われることによる無駄な表示がされる。
    // そのため、モックではログイン状態を変更しない。
    isLoggedIn: isLoggedIn,
    signup: async () => {},
    login: async () => {},
    logout: async () => {
      setCurrentUserName('');
      action('logout')({
        message: 'Storybookの画面の中にStoryBookの画面が二重に現れる（遷移先が"/"のため、初期画面に遷移する）',
      });
    },
  };

  return <UserContext.Provider value={mockContextValue}>{children}</UserContext.Provider>;
};

const meta: Meta<typeof MockUserContextProvider> = {
  component: NavigationHeader,
  title: 'NavigationHeader',
  decorators: [
    (Story, {args, parameters}) => {
      return (
        <MockUserContextProvider userName={args.userName} isLoggedIn={parameters.isLoggedIn}>
          <Story />
        </MockUserContextProvider>
      );
    },
  ],
} satisfies Meta<typeof MockUserContextProvider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LoggedIn: Story = {
  parameters: {
    isLoggedIn: true,
  },
  args: {
    userName: 'テストユーザ',
  },
  argTypes: {
    userName: {control: 'text'},
  },
};

export const LoggedOut: Story = {
  parameters: {
    isLoggedIn: false,
  },
};
