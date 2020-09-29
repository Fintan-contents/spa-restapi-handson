package com.example.authentication.application.entity;

import javax.persistence.*;

@Entity
@Table(name = "user_profile")
@Access(AccessType.FIELD)
public class UserProfileEntity {

    @Id
    private String userId;

    private String name;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

}
