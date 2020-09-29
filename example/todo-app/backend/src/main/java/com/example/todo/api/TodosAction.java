package com.example.todo.api;

import com.example.todo.domain.*;
import com.example.todo.application.TodoService;
import nablarch.core.ThreadContext;
import nablarch.core.repository.di.config.externalize.annotation.SystemRepositoryComponent;
import nablarch.core.validation.ee.ValidatorUtil;

import javax.validation.constraints.NotNull;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.List;
import java.util.stream.Collectors;

@SystemRepositoryComponent
@Path("/todos")
public class TodosAction {

    private final TodoService todoService;

    public TodosAction(TodoService todoService) {
        this.todoService = todoService;
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<TodoResponse> get() {
        String userIdValue = ThreadContext.getUserId();
        UserId userId = new UserId(userIdValue);

        List<Todo> todos = todoService.list(userId);
        return todos.stream()
                .map(todo -> new TodoResponse(todo.id(), todo.text(), todo.status()))
                .collect(Collectors.toList());
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public TodoResponse post(PostRequest requestBody) {
        ValidatorUtil.validate(requestBody);

        String userIdValue = ThreadContext.getUserId();
        UserId userId = new UserId(userIdValue);
        TodoText text = new TodoText(requestBody.text);

        Todo todo = todoService.addTodo(userId, text);

        return new TodoResponse(todo.id(), todo.text(), todo.status());
    }

    public static class PostRequest {
        @NotNull
        public String text;
    }

    public static class TodoResponse {

        public final Long id;

        public final String text;

        public final Boolean completed;

        public TodoResponse(TodoId id, TodoText text, TodoStatus status) {
            this.id = id.value();
            this.text = text.value();
            this.completed = status == TodoStatus.COMPLETED;
        }
    }
}
