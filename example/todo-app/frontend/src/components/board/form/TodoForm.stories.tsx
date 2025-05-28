import React, {useEffect, useRef} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {TodoForm} from './TodoForm';
import {action} from '@storybook/addon-actions';
import {BackendService} from '../../../backend/BackendService';

const meta: Meta<typeof TodoForm> = {
  title: 'TodoForm',
  component: TodoForm,
  args: {
    addTodo: action('addTodo'),
  },
  argTypes: {
    addTodo: {control: false},
  },
} satisfies Meta<typeof TodoForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  decorators: [
    Story => {
      const currentId = useRef(1);

      useEffect(() => {
        // モックとして変更したBackendService.postTodoをクリーンにする(元に戻す)ため
        // BackendService.postTodoを保存する。
        const originalPostTodo = BackendService.postTodo;

        BackendService.postTodo = async (text: string) => {
          const newTodo = {id: currentId.current++, text, completed: false};
          action('postTodo called')(newTodo);
          return Promise.resolve(newTodo);
        };

        // 動作確認のために変更したBackendService.postTodoを保存していたものに戻す。
        return () => {
          BackendService.postTodo = originalPostTodo;
        };
      }, []);

      return <Story />;
    },
  ],
};
