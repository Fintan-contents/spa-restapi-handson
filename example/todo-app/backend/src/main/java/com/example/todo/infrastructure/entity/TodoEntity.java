package com.example.todo.infrastructure.entity;

import javax.persistence.*;

@Entity
@Table(name = "todo")
@Access(AccessType.FIELD)
public class TodoEntity {

    @Id
    private Long todoId;

    private String text;

    private Boolean completed;

    private String userId;

    public Long getTodoId() {
        return todoId;
    }

    public void setTodoId(Long todoId) {
        this.todoId = todoId;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
