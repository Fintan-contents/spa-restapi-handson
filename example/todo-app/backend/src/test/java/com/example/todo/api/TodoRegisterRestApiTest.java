package com.example.todo.api;

import com.example.openapi.OpenApiValidator;
import com.example.system.nablarch.FlywayExecutor;
import com.jayway.jsonpath.JsonPath;
import nablarch.common.web.WebConfig;
import nablarch.common.web.WebConfigFinder;
import nablarch.common.web.session.SessionUtil;
import nablarch.core.repository.SystemRepository;
import nablarch.fw.ExecutionContext;
import nablarch.fw.web.HttpResponse;
import nablarch.fw.web.RestMockHttpRequest;
import nablarch.test.core.http.SimpleRestTestSupport;
import org.hamcrest.Matchers;
import org.junit.BeforeClass;
import org.junit.Test;

import javax.ws.rs.core.MediaType;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.Map;

import static com.jayway.jsonpath.matchers.JsonPathMatchers.hasJsonPath;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;

public class TodoRegisterRestApiTest extends SimpleRestTestSupport {

    public static OpenApiValidator openApiValidator = new OpenApiValidator(Paths.get("rest-api-specification/openapi.yaml"));

    @BeforeClass
    public static void setUpClass() {
        FlywayExecutor flywayExecutor = SystemRepository.get("dbMigration");
        flywayExecutor.migrate(true);
    }

    @Test
    public void RESTAPIでToDoを登録できる() throws Exception {
        ExecutionContext executionContext = new ExecutionContext();
        SessionUtil.put(executionContext, "user.id", "1001");

        RestMockHttpRequest request = post("/api/todos")
                .setHeader("Content-Type", MediaType.APPLICATION_JSON)
                .setBody(Map.of("text", "テストする"));
        attachCsrfToken(request, executionContext);
        HttpResponse response = sendRequestWithContext(request, executionContext);

        assertStatusCode("ToDoの登録", HttpResponse.Status.OK, response);

        assertThat(response.getBodyString(), hasJsonPath("$.id", Matchers.notNullValue()));
        assertThat(response.getBodyString(), hasJsonPath("$.text", equalTo("テストする")));
        assertThat(response.getBodyString(), hasJsonPath("$.completed", equalTo(false)));

        openApiValidator.validate("postTodo", request, response);
    }

    @Test
    public void ToDo登録時にtext項目が無い場合_登録に失敗して400になる() {
        ExecutionContext executionContext = new ExecutionContext();
        SessionUtil.put(executionContext, "user.id", "1001");

        RestMockHttpRequest request = post("/api/todos")
                .setHeader("Content-Type", MediaType.APPLICATION_JSON)
                .setBody(Collections.emptyMap());
        attachCsrfToken(request, executionContext);
        HttpResponse response = sendRequestWithContext(request, executionContext);

        assertStatusCode("ToDoの登録", HttpResponse.Status.BAD_REQUEST, response);
    }

    private void attachCsrfToken(RestMockHttpRequest request, ExecutionContext context) {
        HttpResponse response = sendRequest(get("/api/csrf_token"));
        assertStatusCode("CSRFトークンの取得", HttpResponse.Status.OK, response);

        String json = response.getBodyString();
        String name = JsonPath.read(json, "$.csrfTokenHeaderName");
        String value = JsonPath.read(json, "$.csrfTokenValue");

        request.setHeader(name, value);

        WebConfig webConfig = WebConfigFinder.getWebConfig();
        String storedVarName = webConfig.getCsrfTokenSessionStoredVarName();
        String storeName = webConfig.getCsrfTokenSavedStoreName();
        if (storeName != null) {
            SessionUtil.put(context, storedVarName, value, storeName);
        } else {
            SessionUtil.put(context, storedVarName, value);
        }
    }
}
