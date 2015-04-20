insert into users 
	(username, password_hash)
values
	('test1', ''),
	('test2', ''),
	('test3', ''),
	('test4', ''),
	('test5', '')
;

insert into accounts
	(uid)
values
	(1),
	(2),
	(3),
	(4),
	(5)
;

insert into accounts
	(uid)
values
	(1),
	(2),
	(3)
;

insert into cards
	(card_number, pin)
values
	('340823475234', '1234'),
	('750230437592', '1234'),
	('413550472649', '1234'),
	('097026420842', '1234')
;

update accounts
	set card_id = 1
	where id = 4
;

update accounts
	set card_id = 2
	where id = 5
;

update accounts
	set card_id = 3
	where id = 6
;

update accounts
	set card_id = 4
	where id = 7
;