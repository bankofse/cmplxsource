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

-- View: "joinAccountCard"

CREATE OR REPLACE VIEW "joinAccountCard" AS 
 SELECT accounts.uid,
    cards.card_number
   FROM accounts
     JOIN cards ON accounts.card_id = cards.id;

ALTER TABLE "joinAccountCard"
  OWNER TO accounts;


