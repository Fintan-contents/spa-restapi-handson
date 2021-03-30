package com.example.todo.domain;

public class Todo {

    private final TodoId id;

    private final TodoText text;

    private final TodoStatus status;

    private final UserId userId;

    public Todo(TodoId id, TodoText text, TodoStatus status, UserId userId) {
        this.id = id;
        this.text = text;
        this.status = status;
        this.userId = userId;
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

    public UserId userId() {
        return userId;
    }

    public Todo changeStatus(TodoStatus status) {
        return new Todo(id, text, status, userId);
    }
}
