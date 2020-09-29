package com.example.authentication.application;

import com.example.authentication.application.entity.AccountEntity;
import nablarch.common.dao.NoDataException;
import nablarch.common.dao.UniversalDao;
import nablarch.core.repository.di.config.externalize.annotation.SystemRepositoryComponent;

import java.util.Map;

@SystemRepositoryComponent
public class AuthenticationService {

    public AuthenticationResult authenticate(String userName, String password) {
        AccountEntity accountEntity = findAccount(userName);
        if (accountEntity == null) {
            return AuthenticationResult.nameNotFound();
        }
        if (!password.equals(accountEntity.getPassword())) {
            return AuthenticationResult.passwordMismatch();
        }
        return AuthenticationResult.success(accountEntity.getUserId());
    }

    private AccountEntity findAccount(String userName) {
        Map<String, String> condition = Map.of("userName", userName);
        try {
            return UniversalDao.findBySqlFile(AccountEntity.class, "FIND_BY_USERNAME", condition);
        } catch (NoDataException e) {
            return null;
        }
    }
}
