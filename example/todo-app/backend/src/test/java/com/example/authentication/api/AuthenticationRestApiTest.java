package com.example.authentication.api;

import com.example.openapi.OpenApiValidator;
import com.jayway.jsonpath.JsonPath;
import nablarch.common.web.WebConfig;
import nablarch.common.web.WebConfigFinder;
import nablarch.common.web.session.SessionUtil;
import nablarch.fw.ExecutionContext;
import nablarch.fw.web.HttpResponse;
import nablarch.fw.web.RestMockHttpRequest;
import nablarch.test.core.http.SimpleRestTestSupport;
import org.junit.Test;

import javax.ws.rs.core.MediaType;
import java.nio.file.Paths;
import java.util.Map;

public class AuthenticationRestApiTest extends SimpleRestTestSupport {

    public static OpenApiValidator openApiValidator = new OpenApiValidator(Paths.get("rest-api-specification/openapi.yaml"));

    @Test
    public void RESTAPIでサインアップできる() throws Exception {
        ExecutionContext executionContext = new ExecutionContext();
        RestMockHttpRequest request = post("/api/signup")
                .setHeader("Content-Type", MediaType.APPLICATION_JSON)
                .setBody(Map.of(
                        "userName", "signup-test",
                        "password", "pass"));
        attachCsrfToken(request, executionContext);
        HttpResponse response = sendRequestWithContext(request, executionContext);

        assertStatusCode("サインアップ", HttpResponse.Status.NO_CONTENT, response);

        openApiValidator.validate("signup", request, response);
    }

    @Test
    public void 名前が登録済みの場合_サインアップに失敗して409になる() throws Exception {
        ExecutionContext executionContext = new ExecutionContext();
        RestMockHttpRequest firstRequest = post("/api/signup")
                .setHeader("Content-Type", MediaType.APPLICATION_JSON)
                .setBody(Map.of(
                        "userName", "signup-conflict-test",
                        "password", "pass"));
        attachCsrfToken(firstRequest, executionContext);
        sendRequestWithContext(firstRequest, executionContext);

        RestMockHttpRequest secondRequest = post("/api/signup")
                .setHeader("Content-Type", MediaType.APPLICATION_JSON)
                .setBody(Map.of(
                        "userName", "signup-conflict-test",
                        "password", "pass"));
        attachCsrfToken(secondRequest, executionContext);
        HttpResponse response = sendRequestWithContext(secondRequest, executionContext);

        assertStatusCode("サインアップ", HttpResponse.Status.CONFLICT, response);

        openApiValidator.validate("signup", secondRequest, response);
    }

    @Test
    public void RESTAPIでログインできる() throws Exception {
        ExecutionContext executionContext = new ExecutionContext();
        RestMockHttpRequest request = post("/api/login")
                .setHeader("Content-Type", MediaType.APPLICATION_JSON)
                .setBody(Map.of(
                        "userName", "login-test",
                        "password", "pass"));
        attachCsrfToken(request, executionContext);
        HttpResponse response = sendRequestWithContext(request, executionContext);

        assertStatusCode("ログイン", HttpResponse.Status.NO_CONTENT, response);

        openApiValidator.validate("login", request, response);
    }

    @Test
    public void パスワードが不一致の場合_ログインに失敗して401になる() throws Exception {
        ExecutionContext executionContext = new ExecutionContext();
        RestMockHttpRequest request = post("/api/login")
                .setHeader("Content-Type", MediaType.APPLICATION_JSON)
                .setBody(Map.of(
                        "userName", "login-test",
                        "password", "fail"));
        attachCsrfToken(request, executionContext);
        HttpResponse response = sendRequestWithContext(request, executionContext);

        assertStatusCode("ログイン", HttpResponse.Status.UNAUTHORIZED, response);

        openApiValidator.validate("login", request, response);
    }

    @Test
    public void 名前が不一致の場合_ログインに失敗して401になる() throws Exception {
        ExecutionContext executionContext = new ExecutionContext();
        RestMockHttpRequest request = post("/api/login")
                .setHeader("Content-Type", MediaType.APPLICATION_JSON)
                .setBody(Map.of(
                        "userName", "fail-test",
                        "password", "pass"));
        attachCsrfToken(request, executionContext);
        HttpResponse response = sendRequestWithContext(request, executionContext);

        assertStatusCode("ログイン", HttpResponse.Status.UNAUTHORIZED, response);

        openApiValidator.validate("login", request, response);
    }

    @Test
    public void RESTAPIでログアウトできる() throws Exception {
        ExecutionContext executionContext = new ExecutionContext();
        SessionUtil.put(executionContext, "user.id", "1010");

        RestMockHttpRequest request = post("/api/logout");
        attachCsrfToken(request, executionContext);
        HttpResponse response = sendRequestWithContext(request, executionContext);

        assertStatusCode("ログアウト", HttpResponse.Status.NO_CONTENT, response);

        openApiValidator.validate("logout", request, response);
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
