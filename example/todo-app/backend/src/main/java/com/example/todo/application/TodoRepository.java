package com.example.todo.application;

import com.example.todo.domain.Todo;
import com.example.todo.domain.TodoId;
import com.example.todo.domain.UserId;

import java.util.List;

public interface TodoRepository {

    List<Todo> list(UserId userId);

    TodoId nextId();

    void add(UserId userId, Todo todo);

    Todo get(TodoId todoId);

    void update(UserId userId, Todo todo);
}
