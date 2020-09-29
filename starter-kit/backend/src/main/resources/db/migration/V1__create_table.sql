CREATE SEQUENCE todo_id
    INCREMENT BY 1
    MAXVALUE 9223372036854775807
    START WITH 1
    NO CYCLE;

CREATE TABLE account
(
    user_id   VARCHAR(40) NOT NULL,
    password  VARCHAR(20) NOT NULL,
    PRIMARY KEY (user_id)
);

CREATE TABLE user_profile
(
    user_id   VARCHAR(40) NOT NULL,
    name      VARCHAR(20) NOT NULL,
    PRIMARY KEY (user_id),
    FOREIGN KEY (user_id) REFERENCES account (user_id)
);


CREATE TABLE todo
(
    todo_id   BIGINT      NOT NULL,
    text      VARCHAR(20) NOT NULL,
    completed BOOLEAN     NOT NULL,
    user_id   VARCHAR(40) NOT NULL,
    PRIMARY KEY (todo_id),
    FOREIGN KEY (user_id) REFERENCES account (user_id)
);
