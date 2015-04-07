-- Table: accounts
CREATE TABLE accounts
(
  id serial NOT NULL,
  uid character varying(40),
  card_id int,
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
  card_number VARCHAR(40),
  pin VARCHAR(4),
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

-- Table: transactions
CREATE TABLE transactions
(
  id serial NOT NULL,
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
CREATE MATERIALIZED VIEW amounts AS 
 SELECT transactions.account,
    sum(transactions.amount) AS amount,
    max(transactions.completed) AS lastest_recieved
   FROM transactions
  GROUP BY transactions.account
WITH DATA;

ALTER TABLE amounts
  OWNER TO accounts;

--- Auto Update Amounts view
create or replace function refresh_mat_view()
returns trigger language plpgsql
as $$
begin
    refresh materialized view amounts;
    return null;
end $$;

create trigger refresh_mat_view
after insert or update or delete or truncate
on transactions for each statement 
execute procedure refresh_mat_view();
