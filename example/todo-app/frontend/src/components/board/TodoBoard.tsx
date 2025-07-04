import React, {useEffect, useState} from 'react';
import styles from './TodoBoard.module.css';
import {TodoForm} from './form/TodoForm';
import {FilterType, TodoFilter} from './filter/TodoFilter';
import {TodoList} from './list/TodoList';
import {BackendService} from '../../backend/BackendService';

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

type ShowFilter = {
  [K in FilterType]: (todo: Todo) => boolean;
};

const showFilter: ShowFilter = {
  ALL: () => true,
  INCOMPLETE: todo => !todo.completed,
  COMPLETED: todo => todo.completed,
};

export const TodoBoard: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filterType, setFilterType] = useState<FilterType>('ALL');

  useEffect(() => {
    BackendService.getTodos().then(response => setTodos(response));
  }, []);

  const addTodo = (todo: Todo) => {
    setTodos(todos.concat(todo));
  };

  const toggleTodoCompletion = (id: number) => {
    const target = todos.find(todo => todo.id === id);
    if (!target) {
      return;
    }
    BackendService.putTodo(id, !target.completed).then(response =>
      setTodos(todos.map(todo => (todo.id === response.id ? response : todo))),
    );
  };

  const deleteTodo = (id: number) => {
    const target = todos.find(todo => todo.id === id);
    if (!target) {
      return;
    }
    BackendService.deleteTodo(id).then(() => setTodos(todos.filter(todo => todo.id !== id)));
  };

  const showTodos = todos.filter(showFilter[filterType]);

  return (
    <div className={styles.content}>
      <TodoForm addTodo={addTodo} />
      <TodoFilter filterType={filterType} setFilterType={setFilterType} />
      <TodoList todos={showTodos} toggleTodoCompletion={toggleTodoCompletion} deleteTodo={deleteTodo} />
    </div>
  );
};
