FIND_BY_USERNAME =
select
    account.user_id,
    account.password
FROM
    account
INNER JOIN user_profile
    ON account.user_id = user_profile.user_id
WHERE
    user_profile.name = :userName
