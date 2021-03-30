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
import org.junit.BeforeClass;
import org.junit.Test;

import javax.ws.rs.core.MediaType;
import java.nio.file.Paths;
import java.util.Map;

import static com.jayway.jsonpath.matchers.JsonPathMatchers.hasJsonPath;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;

public class TodoUpdateRestApiTest extends SimpleRestTestSupport {

    public static OpenApiValidator openApiValidator = new OpenApiValidator(Paths.get("rest-api-specification/openapi.yaml"));

    @BeforeClass
    public static void setUpClass() {
        FlywayExecutor flywayExecutor = SystemRepository.get("dbMigration");
        flywayExecutor.migrate(true);
    }

    @Test
    public void RESTAPIでToDoの状態を更新できる() throws Exception {
        ExecutionContext executionContext = new ExecutionContext();
        SessionUtil.put(executionContext, "user.id", "1001");

        RestMockHttpRequest request = put("/api/todos/2002")
                .setHeader("Content-Type", MediaType.APPLICATION_JSON)
                .setBody(Map.of("completed", true));
        attachCsrfToken(request, executionContext);
        HttpResponse response = sendRequestWithContext(request, executionContext);

        assertStatusCode("ToDoのステータス更新", HttpResponse.Status.OK, response);

        assertThat(response.getBodyString(), hasJsonPath("$.id", equalTo(2002)));
        assertThat(response.getBodyString(), hasJsonPath("$.text", equalTo("やること２")));
        assertThat(response.getBodyString(), hasJsonPath("$.completed", equalTo(true)));

        openApiValidator.validate("putTodo", request, response);
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
