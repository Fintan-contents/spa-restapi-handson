package com.example.authentication.application;

import com.example.authentication.application.entity.AccountEntity;
import com.example.authentication.application.entity.UserProfileEntity;
import nablarch.common.dao.UniversalDao;
import nablarch.core.repository.di.config.externalize.annotation.SystemRepositoryComponent;

import java.util.Map;
import java.util.UUID;

@SystemRepositoryComponent
public class AccountRegistrationService {

    public AccountRegistrationResult register(String userName, String password) {
        if (existsAccount(userName)) {
            return AccountRegistrationResult.NAME_CONFLICT;
        }
        String userId = generateUserId();
        insertAccount(userId, password);
        insertUserProfile(userId, userName);
        return AccountRegistrationResult.SUCCESS;
    }

    private boolean existsAccount(String userName) {
        Map<String, String> condition = Map.of("userName", userName);
        return UniversalDao.exists(UserProfileEntity.class, "FIND_BY_USERNAME", condition);
    }
    private String generateUserId() {
        return UUID.randomUUID().toString();
    }

    private void insertAccount(String userId, String password) {
        AccountEntity accountEntity = new AccountEntity();
        accountEntity.setUserId(userId);
        accountEntity.setPassword(password);
        UniversalDao.insert(accountEntity);
    }

    private void insertUserProfile(String userId, String userName) {
        UserProfileEntity userProfileEntity = new UserProfileEntity();
        userProfileEntity.setUserId(userId);
        userProfileEntity.setName(userName);
        UniversalDao.insert(userProfileEntity);
    }
}
