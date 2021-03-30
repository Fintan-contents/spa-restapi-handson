package com.example.system.nablarch;

import nablarch.fw.ExecutionContext;
import nablarch.fw.jaxrs.cors.BasicCors;
import nablarch.fw.web.HttpRequest;

public class CustomCors extends BasicCors {

    @Override
    public boolean isPreflightRequest(HttpRequest request, ExecutionContext context) {
        return request.getMethod().equals("OPTIONS") &&
                request.getHeader(Headers.ORIGIN) != null &&
                request.getHeader(Headers.ACCESS_CONTROL_REQUEST_METHOD) != null;

    }

    private static final class Headers {
        static final String ORIGIN = "Origin";
        static final String ACCESS_CONTROL_REQUEST_METHOD = "Access-Control-Request-Method";
    }
}
