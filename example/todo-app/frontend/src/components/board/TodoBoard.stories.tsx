import {Meta, StoryObj} from '@storybook/react';
import {TodoBoard} from './TodoBoard';
import {BackendService} from '../../backend/BackendService';
import {action} from '@storybook/addon-actions';
import {useState, useRef, useEffect} from 'react';

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

const meta: Meta<typeof TodoBoard> = {
  title: 'TodoBoard',
  component: TodoBoard,
} satisfies Meta<typeof TodoBoard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  decorators: [
    Story => {
      const initialTodos: Todo[] = [
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
      ];

      const currentId = useRef(initialTodos.length + 1);
      const allTodos = useRef<Todo[]>(initialTodos);

      // TodoBoard.tsxのuseEffect実行前にBackendServiceのメソッドを差し替えるために、Stateで読み込み完了を管理。
      const [isPrimaryStoryLoaded, setIsPrimaryStoryLoaded] = useState(false);

      useEffect(() => {
        // モックとして変更したBackendServiceのメソッドをクリーンにする(元に戻す)ため
        // BackendServiceのメソッドを保存する。
        const originalBackendService = {...BackendService};

        BackendService.getTodos = async () => {
          action('getTodos')({message: '最初のレンダー時に呼び出し'});
          return allTodos.current;
        };

        BackendService.putTodo = async (id: number, completed: boolean): Promise<Todo> => {
          action('putTodo')(id, completed);

          const todo = allTodos.current.find(todo => todo.id === id);
          if (todo) {
            const updatedTodo = {...todo, completed};
            allTodos.current = allTodos.current.map(t => (t.id === id ? updatedTodo : t));
            return Promise.resolve(updatedTodo);
          } else {
            return Promise.reject(new Error('putTodo:指定されたidのTodoが存在しません'));
          }
        };

        BackendService.deleteTodo = async id => {
          const index = allTodos.current.findIndex(todo => todo.id === id);
          if (index !== -1) {
            allTodos.current = allTodos.current.filter(todo => todo.id !== id);
            action('deleteTodo')(id);
          } else {
            return Promise.reject(new Error('deleteTodo:指定されたidのTodoが存在しません'));
          }
        };

        BackendService.postTodo = async text => {
          const newTodo = {id: currentId.current++, text, completed: false};
          allTodos.current = [...allTodos.current, newTodo];
          action('postTodo')(newTodo);
          return newTodo;
        };

        setIsPrimaryStoryLoaded(true);

        // 動作確認のために変更したBackendServiceのメソッドを保存していたものに戻す。
        return () => {
          Object.assign(BackendService, originalBackendService);
        };
      }, []);

      return isPrimaryStoryLoaded ? <Story /> : <div>Loading...</div>;
    },
  ],
};
