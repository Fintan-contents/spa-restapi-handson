package com.example.system.nablarch.di;

import nablarch.core.repository.di.config.externalize.AnnotationComponentDefinitionLoader;

public class ExampleComponentDefinitionLoader extends AnnotationComponentDefinitionLoader {

    @Override
    protected String getBasePackage() {
        return "com.example";
    }
}
