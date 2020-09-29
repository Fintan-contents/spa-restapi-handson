package com.example;

import nablarch.core.repository.di.config.externalize.annotation.SystemRepositoryComponent;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import java.util.Map;

@SystemRepositoryComponent
@Path("test")
public class SampleAction {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Object get() {
        return Map.of("status", "ok");
    }
}
