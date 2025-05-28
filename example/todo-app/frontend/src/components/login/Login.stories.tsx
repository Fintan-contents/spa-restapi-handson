import React from 'react';
import {Meta, StoryObj} from '@storybook/react';
import {Login} from './Login';
import {UserContext, AuthenticationFailedError} from '../../contexts/UserContext';
import {action} from '@storybook/addon-actions';

const MockUserContextProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const mockContextValue = {
    userName: '',
    isLoggedIn: false,
    signup: async () => {},
    login: async (userName: string, password: string) => {
      // 名前に値「userName」を入力した場合、パスワードの認証に移る。「userName」以外を入力した場合、名前の認証失敗エラーを返す。
      if (userName !== 'userName') {
        action('名前の認証失敗によるエラー（名前に「userName」を入力した場合、パスワードの認証に移る）')({userName});
        return new AuthenticationFailedError();
      }
      // パスワードに値「password」を入力した場合、ログイン成功。「password」以外を入力した場合、パスワードの認証失敗エラーを返す。
      if (password !== 'password') {
        action('パスワードの認証失敗によるエラー（パスワードに「password」を入力した場合、ログイン成功）')({password});
        return new AuthenticationFailedError();
      }
      action('Login success')({userName, password});
    },
    logout: async () => {},
  };

  return <UserContext.Provider value={mockContextValue}>{children}</UserContext.Provider>;
};

const meta: Meta<typeof Login> = {
  title: 'Login',
  component: Login,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof Login>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  decorators: [
    Story => (
      <MockUserContextProvider>
        <style>{`.error {color: red;}`}</style>
        <Story />
      </MockUserContextProvider>
    ),
  ],
};
