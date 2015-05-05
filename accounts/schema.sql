-- Table: accounts
CREATE TABLE accounts
(
  id serial NOT NULL,
  uid int NOT NULL,
  card_id int,
  created timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT accounts_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE accounts
  OWNER TO accounts;

-- Table: cards
CREATE TABLE cards
(
  id serial NOT NULL,
  card_number VARCHAR(40) NOT NULL,
  pin VARCHAR(4) NOT NULL,
  CONSTRAINT cards_pkey PRIMARY KEY (id)
) WITH (
  OIDS=FALSE
);
ALTER TABLE cards
  OWNER TO accounts;

ALTER TABLE accounts
  ADD CONSTRAINT card_fk FOREIGN KEY (card_id)
      REFERENCES cards (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION;

-- Table: users

-- DROP TABLE users;

CREATE TABLE users
(
  id serial NOT NULL,
  username character varying(20) UNIQUE,
  password_hash character varying(256),
  created timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE users
  OWNER TO accounts;

ALTER TABLE accounts
  ADD CONSTRAINT user_fk FOREIGN KEY (uid)
      REFERENCES users (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION;

-- Table: transactions
CREATE TABLE transactions
(
  id serial NOT NULL,
  from_account integer NOT NULL,
  description character varying(400),
  account integer NOT NULL,
  amount numeric NOT NULL,
  completed timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT account_fk FOREIGN KEY (account)
      REFERENCES accounts (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE transactions
  OWNER TO accounts;

-- Index: fki_account_fk
CREATE INDEX fki_account_fk
  ON transactions
  USING btree
  (account);

-- View: "joinAccountCard"
CREATE OR REPLACE VIEW "joinAccountCard" AS 
 SELECT accounts.uid,
    cards.card_number
   FROM accounts
     JOIN cards ON accounts.card_id = cards.id;

ALTER TABLE "joinAccountCard"
  OWNER TO accounts;

-- Materialized View: amounts
CREATE OR REPLACE VIEW amounts AS 
 SELECT transactions.account,
    sum(transactions.amount) AS amount,
    max(transactions.completed) AS lastest_recieved
   FROM transactions
  GROUP BY transactions.account;

ALTER TABLE amounts
  OWNER TO accounts;

-- View: accountsinfo
CREATE OR REPLACE VIEW accountsinfo AS 
 SELECT users.id AS user_id,
    accounts.id AS account_number,
    cards.card_number,
    COALESCE(amounts.amount, 0::numeric) AS "amount"
   FROM accounts
     LEFT JOIN amounts ON accounts.id = amounts.account
     LEFT JOIN cards ON accounts.card_id = cards.id
     JOIN users ON accounts.uid = users.id;

ALTER TABLE accountsinfo
  OWNER TO accounts;
