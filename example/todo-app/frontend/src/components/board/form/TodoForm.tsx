import React from 'react';
import styles from './TodoForm.module.css';
import {useInput} from '../../../hooks/useInput';
import {BackendService} from '../../../backend/BackendService';

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

type Props = {
  addTodo: (todo: Todo) => void;
};

export const TodoForm: React.FC<Props> = ({addTodo}) => {
  const [text, textAttributes, setText] = useInput('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!text) {
      return;
    }
    const response = await BackendService.postTodo(text);
    addTodo(response);
    setText('');
  };

  return (
    <div className={styles.content}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.input}>
          <input type='text' {...textAttributes} placeholder='タスクを入力してください' />
        </div>
        <div className={styles.button}>
          <button type='submit'>追加</button>
        </div>
      </form>
    </div>
  );
};
