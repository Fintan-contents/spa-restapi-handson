package com.example.authentication.api;

import com.example.authentication.application.AccountRegistrationService;
import com.example.authentication.application.AuthenticationResult;
import com.example.authentication.application.AuthenticationService;
import com.example.authentication.application.AccountRegistrationResult;
import nablarch.common.web.session.SessionUtil;
import nablarch.core.repository.di.config.externalize.annotation.SystemRepositoryComponent;
import nablarch.core.validation.ee.ValidatorUtil;
import nablarch.fw.ExecutionContext;
import nablarch.fw.web.HttpErrorResponse;
import nablarch.fw.web.HttpResponse;

import javax.validation.constraints.NotNull;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.core.MediaType;

@Path("/")
@SystemRepositoryComponent
public class AuthenticationAction {

    private final AccountRegistrationService registrationService;

    private final AuthenticationService authenticationService;

    public AuthenticationAction(AccountRegistrationService registrationService,
                                AuthenticationService authenticationService) {
        this.registrationService = registrationService;
        this.authenticationService = authenticationService;
    }

    @Path("/signup")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public void signup(SignupRequest requestBody) {
        ValidatorUtil.validate(requestBody);

        AccountRegistrationResult result = registrationService.register(requestBody.userName, requestBody.password);
        if (result == AccountRegistrationResult.NAME_CONFLICT) {
            throw new HttpErrorResponse(HttpResponse.Status.CONFLICT.getStatusCode());
        }
    }

    @Path("/login")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public void login(ExecutionContext executionContext, LoginRequest requestBody) {
        ValidatorUtil.validate(requestBody);

        AuthenticationResult result = authenticationService.authenticate(requestBody.userName, requestBody.password);
        if (result.isFailed()) {
            throw new HttpErrorResponse(HttpResponse.Status.UNAUTHORIZED.getStatusCode());
        }
        SessionUtil.invalidate(executionContext);
        SessionUtil.put(executionContext, "user.id", result.userId());
    }

    @Path("/logout")
    @POST
    public void logout(ExecutionContext executionContext) {
        SessionUtil.invalidate(executionContext);
    }

    public static class SignupRequest {
        @NotNull
        public String userName;

        @NotNull
        public String password;
    }

    public static class LoginRequest {
        @NotNull
        public String userName;

        @NotNull
        public String password;
    }
}
