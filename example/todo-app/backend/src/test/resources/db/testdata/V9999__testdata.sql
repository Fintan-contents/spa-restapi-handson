INSERT INTO account (user_id, password) VALUES ('1001', '');
INSERT INTO user_profile (user_id, name) VALUES ('1001', 'todo-test');
INSERT INTO todo (todo_id, text, completed, user_id) VALUES (2001, 'やること１', true, '1001');
INSERT INTO todo (todo_id, text, completed, user_id) VALUES (2002, 'やること２', false, '1001');

INSERT INTO account (user_id, password) VALUES ('1010', 'pass');
INSERT INTO user_profile (user_id, name) VALUES ('1010', 'login-test');
