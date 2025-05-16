import {Meta, StoryObj} from '@storybook/react';
import {TodoItem} from './TodoItem';
import {useState, useEffect} from 'react';
import {action} from '@storybook/addon-actions';

const meta: Meta<typeof TodoItem> = {
  component: TodoItem,
  title: 'TodoItem',
  args: {
    id: 1,
    text: '洗い物をする',
    completed: false,
  },
} satisfies Meta<typeof TodoItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  argTypes: {
    completed: {control: 'boolean'},
  },

  render: function Render(args) {
    const [completed, setCompleted] = useState(args.completed);

    useEffect(() => {
      setCompleted(args.completed);
    }, [args.completed]);

    return (
      <ul style={{listStyle: 'none'}}>
        <TodoItem
          {...args}
          completed={completed}
          toggleTodoCompletion={() => {
            action('toggleTodoCompletion')(!completed);
            setCompleted(!completed);
          }}
          deleteTodo={action('deleteTodo')}
        />
      </ul>
    );
  },
};

export const Completed: Story = {
  render: args => {
    return (
      <ul style={{listStyle: 'none'}}>
        <TodoItem {...args} completed={true} toggleTodoCompletion={() => {}} deleteTodo={() => {}} />
      </ul>
    );
  },
};

export const Uncompleted: Story = {
  render: args => {
    return (
      <ul style={{listStyle: 'none'}}>
        <TodoItem {...args} toggleTodoCompletion={() => {}} deleteTodo={() => {}} />
      </ul>
    );
  },
};
