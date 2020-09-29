FIND_BY_USERNAME =
select
    user_id
FROM
    user_profile
WHERE
    name = :userName
