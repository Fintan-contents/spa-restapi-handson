package com.example.todo.domain;

public class Todo {

    private final TodoId id;

    private final TodoText text;

    private final TodoStatus status;

    public Todo(TodoId id, TodoText text, TodoStatus status) {
        this.id = id;
        this.text = text;
        this.status = status;
    }

    public TodoId id() {
        return id;
    }

    public TodoText text() {
        return text;
    }

    public TodoStatus status() {
        return status;
    }

    public Todo changeStatus(TodoStatus status) {
        return new Todo(id, text, status);
    }
}
