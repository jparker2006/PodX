CREATE TABLE podcasts (
    id int unsigned auto_increment primary key,
    title varchar(150) not null,
    description varchar(1000),
    link varchar(500) not null,
    created timestamp default current_timestamp
);

CREATE TABLE users (
    id int unsigned auto_increment primary key,
    username varchar(60) not null,
    password char(64) not null,
    data varchar(4000),
    created timestamp default current_timestamp,
    last_used timestamp default current_timestamp on update current_timestamp
);

CREATE TABLE bugs (
    id int unsigned auto_increment primary key,
    issue varchar(600),
    started_fix boolean default 0,
    created timestamp default current_timestamp
);



