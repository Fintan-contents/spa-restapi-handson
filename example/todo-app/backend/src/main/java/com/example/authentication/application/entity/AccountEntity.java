package com.example.authentication.application.entity;

import javax.persistence.*;

@Entity
@Table(name = "account")
@Access(AccessType.FIELD)
public class AccountEntity {

    @Id
    private String userId;

    private String password;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
