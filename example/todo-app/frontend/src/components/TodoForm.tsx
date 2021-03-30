import React from 'react';
import './TodoForm.css';
import { useInput } from '../hooks/useInput';
import { BackendService } from '../backend/BackendService';

type Todo = {
  id: number
  text: string
  completed: boolean
}

type Props = {
  addTodo: (todo: Todo) => void
}

export const TodoForm: React.FC<Props> = ({addTodo}) => {
  const [text, textAttributes, setText] = useInput('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!text) {
      return;
    }
    BackendService.postTodo(text)
      .then(response => addTodo(response));
    setText('');
  };

  return (
    <div className="TodoForm_content">
      <form onSubmit={handleSubmit} className="TodoForm_form">
        <div className="TodoForm_input">
          <input type="text" {...textAttributes} placeholder="タスクを入力してください"/>
        </div>
        <div className="TodoForm_button">
          <button type="submit">追加</button>
        </div>
      </form>
    </div>
  );
};