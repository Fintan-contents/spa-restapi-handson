import {Meta, StoryObj} from '@storybook/react';
import {TodoList} from './TodoList';
import {action} from '@storybook/addon-actions';
import {useState} from 'react';

const meta: Meta<typeof TodoList> = {
  component: TodoList,
  title: 'TodoList',
  args: {
    todos: [
      {
        id: 1,
        text: '洗い物をする',
        completed: false,
      },
      {
        id: 2,
        text: '洗濯物を干す',
        completed: true,
      },
      {
        id: 3,
        text: '買い物へ行く',
        completed: false,
      },
    ],
  },
} satisfies Meta<typeof TodoList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: function Render(args) {
    const [todos, setTodos] = useState(args.todos || []);

    const toggleTodoCompletion = (id: number) => {
      action('toggleTodoCompletion')(id);
      setTodos(todos.map(todo => (todo.id === id ? {...todo, completed: !todo.completed} : todo)));
    };

    return <TodoList todos={todos} toggleTodoCompletion={toggleTodoCompletion} deleteTodo={action('deleteTodo')} />;
  },
};

export const FixedTodos: Story = {};
