import React from 'react';
import './TodoItem.css';

type Props = {
  id: number
  text: string
  completed: boolean
  toggleTodoCompletion: (id: number) => void
  deleteTodo: (id: number) => void
}

export const TodoItem: React.FC<Props> = ({id, text, completed, toggleTodoCompletion, deleteTodo}) => {
  return (
    <li className="TodoItem_item">
      <div className="TodoItem_todo">
        <label>
          <input type="checkbox"
                 className="TodoItem_checkbox"
                 checked={completed}
                 onChange={() => toggleTodoCompletion(id)} />
          <span>{text}</span>
        </label>
      </div>
      <div className="TodoItem_delete">
        <button className="TodoItem_button" onClick={() => deleteTodo(id)}>x</button>
      </div>
    </li>
  );
};