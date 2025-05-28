import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {useInput} from './useInput';
import {action} from '@storybook/addon-actions';

const DemoForm: React.FC = () => {
  const [text, textAttributes, setText] = useInput('');

  const handleSubmit = () => {
    if (!text) {
      return;
    }
    action('submit button clicked')(text);
    setText('');
  };

  return (
    <div>
      <input type='text' {...textAttributes} placeholder='タスクを入力してください' />
      <button onClick={handleSubmit}>追加</button>
      <p>入力テキスト: {text}</p>
    </div>
  );
};

const meta = {
  title: 'useInput',
  component: DemoForm,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    Story => (
      <div
        style={{
          padding: '20px',
          maxWidth: '400px',
          margin: 'auto',
          height: '100vh',
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DemoForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
