import React from 'react';
import './TodoList.css';
import { TodoItem } from './TodoItem';

type Todo = {
  id: number
  text: string
  completed: boolean
}

type Props = {
  todos: Todo[],
  toggleTodoCompletion: (id: number) => void
  deleteTodo: (id: number) => void
}

export const TodoList: React.FC<Props> = ({todos, toggleTodoCompletion, deleteTodo}) => {
  return (
    <ul className="TodoList_list">
      {todos.map(todo =>
        <TodoItem key={todo.id} id={todo.id} text={todo.text} completed={todo.completed} toggleTodoCompletion={toggleTodoCompletion} deleteTodo={deleteTodo}/>
      )}
    </ul>
  );
};