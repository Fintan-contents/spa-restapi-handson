package com.example.todo.domain;

public class TodoId {

    private final Long value;

    public TodoId(Long value) {
        this.value = value;
    }

    public Long value() {
        return value;
    }
}
