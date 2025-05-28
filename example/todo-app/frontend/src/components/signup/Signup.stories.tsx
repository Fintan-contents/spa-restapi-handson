import React from 'react';
import {Meta, StoryObj} from '@storybook/react';
import {Signup} from './Signup';
import {UserContext, AccountConflictError} from '../../contexts/UserContext';
import {action} from '@storybook/addon-actions';
import {userEvent, within} from '@storybook/test';

const MockUserContextProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const mockContextValue = {
    userName: '',
    isLoggedIn: false,
    signup: async (userName: string, password: string) => {
      // 名前に'conflict'を入力した場合、名前の重複エラーを返す。
      if (userName === 'conflict') {
        action('名前の重複によるエラー')({userName});
        return new AccountConflictError();
      }
      action('signup success')({userName, password});
    },
    login: async () => {},
    logout: async () => {},
  };

  return <UserContext.Provider value={mockContextValue}>{children}</UserContext.Provider>;
};

const meta: Meta<typeof Signup> = {
  title: 'Signup',
  component: Signup,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    Story => (
      <MockUserContextProvider>
        <style>{`.error {color: red;}`}</style>
        <Story />
      </MockUserContextProvider>
    ),
  ],
} satisfies Meta<typeof Signup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

const getInputElements = (canvasElement: HTMLElement) => {
  // type="text"のinput要素(名前の入力フォーム)を取得。nullチェックを行う。
  const userNameInput = canvasElement.querySelector('input[type="text"]');
  if (!userNameInput) throw new Error('userNameInput not found');

  // type="password"のinput要素(パスワードの入力フォーム)を取得。nullチェックを行う。
  const passwordInput = canvasElement.querySelector('input[type="password"]');
  if (!passwordInput) throw new Error('passwordInput not found');

  return {userNameInput, passwordInput};
};

const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const SignupSuccess: Story = {
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    // タイムスタンプを使用して、パスワードを設定する。
    const timestamp = Date.now().toString();

    await step('Signup Success Interactions', async () => {
      const {userNameInput, passwordInput} = getInputElements(canvasElement);

      await sleep(1000);
      // 名前に"test"、パスワードに"password"を入力し、「登録する」ボタンをクリックする動作。
      await userEvent.type(userNameInput, 'test');
      await userEvent.type(passwordInput, `pass${timestamp}`);
      await userEvent.click(canvas.getByRole('button', {name: '登録する'}));
    });
  },
};

export const Conflict: Story = {
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    // タイムスタンプを使用して、パスワードを設定する。
    const timestamp = Date.now().toString();

    await step('Conflict Interactions', async () => {
      const {userNameInput, passwordInput} = getInputElements(canvasElement);

      await sleep(1000);
      // 名前に"conflict"、パスワードに"password"を入力し、「登録する」ボタンをクリックする動作。名前の重複エラーが発生する。
      await userEvent.type(userNameInput, 'conflict');
      await userEvent.type(passwordInput, `pass${timestamp}`);
      await userEvent.click(canvas.getByRole('button', {name: '登録する'}));
    });
  },
};
