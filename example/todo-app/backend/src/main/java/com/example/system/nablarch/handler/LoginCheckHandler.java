package com.example.system.nablarch.handler;

import nablarch.core.ThreadContext;
import nablarch.core.log.Logger;
import nablarch.core.log.LoggerManager;
import nablarch.fw.ExecutionContext;
import nablarch.fw.Handler;
import nablarch.fw.web.HttpErrorResponse;
import nablarch.fw.web.HttpRequest;
import nablarch.fw.web.HttpResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

public class LoginCheckHandler implements Handler<HttpRequest, Object> {

    private final WhitePatterns whitePatterns = new WhitePatterns();

    private static final Logger logger = LoggerManager.get("DEV");

    public LoginCheckHandler() {
        whitePatterns
                .add("/api/signup", HttpMethod.POST)
                .add("/api/login", HttpMethod.POST)
                .add("/api/csrf_token", HttpMethod.GET);
    }

    @Override
    public Object handle(HttpRequest request, ExecutionContext context) {
        if (!whitePatterns.matches(request)) {
            if (ThreadContext.getUserId().equals("guest")) {
                String path = request.getRequestPath();
                String method = request.getMethod();
                logger.logWarn(String.format("Unauthorized access to path. path=[%s] method=[%s]", path, method));
                throw new HttpErrorResponse(HttpResponse.Status.FORBIDDEN.getStatusCode());
            }
        }
        return context.handleNext(request);
    }

    private enum HttpMethod {
        ALL, GET, POST, PUT, DELETE
    }

    private static class WhitePatterns {

        private final List<WhitePattern> list = new ArrayList<>();

        WhitePatterns add(String url, HttpMethod httpMethod) {
            list.add(new WhitePattern(url, httpMethod));
            return this;
        }

        boolean matches(HttpRequest request) {
            return list.stream()
                    .anyMatch(whitePattern -> whitePattern.matches(request));
        }
    }

    private static class WhitePattern {

        private final Pattern urlPattern;

        private final HttpMethod httpMethod;

        WhitePattern(String url, HttpMethod httpMethod) {
            this.urlPattern = Pattern.compile("^" + url.replaceAll("\\*\\*", ".+").replaceAll("\\*", "[^/]+") + "$");
            this.httpMethod = httpMethod;
        }

        boolean matches(HttpRequest request) {
            String path = request.getRequestPath();
            if (urlPattern.matcher(path).matches()) {
                if (httpMethod == HttpMethod.ALL) {
                    return true;
                }
                return httpMethod.name().equals(request.getMethod());
            }
            return false;
        }
    }
}
