import React from 'react';
import styles from './TodoItem.module.css';

type Props = {
  id: number;
  text: string;
  completed: boolean;
  toggleTodoCompletion: (id: number) => void;
  deleteTodo: (id: number) => void;
};

export const TodoItem: React.FC<Props> = ({id, text, completed, toggleTodoCompletion, deleteTodo}) => {
  return (
    <li className={styles.item}>
      <div className={styles.todo}>
        <label>
          <input
            type='checkbox'
            className={styles.checkbox}
            checked={completed}
            onChange={() => toggleTodoCompletion(id)}
          />
          <span>{text}</span>
        </label>
      </div>
      <div className={styles.delete}>
        <button className={styles.button} onClick={() => deleteTodo(id)}>
          x
        </button>
      </div>
    </li>
  );
};
