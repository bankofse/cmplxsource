#!/bin/bash

HOST="localhost:3000";
DB="http://localhost:3001";
echo "Creating User Accounts";

NUMUSERS=$(cat ./data.json | jsawk 'return this.accounts.length - 1');

<<<<<<< Updated upstream
for i in $(seq 0 $NUMUSERS); do 
  PAYLOAD=$(cat ./data.json | jsawk "return this.accounts[$i]");
  cat ./data.json | jsawk "return this.accounts[$i].user";
  curl -H "Content-Type:application/json" -XPOST  $HOST/auth/create -d "$PAYLOAD";
  #echo -ne "\r $?| Done  $(jot -b ' ' -s '' $COLUMNS - 10)\n";
done
=======
# for i in $(seq 0 $NUMUSERS); do 
#   PAYLOAD=$(cat ./data.json | jsawk "return this.accounts[$i]");
#   cat ./data.json | jsawk "return this.accounts[$i].user";
#   curl -H "Content-Type:application/json" -XPOST  $HOST/auth/create -d "$PAYLOAD";
#   echo -ne "\r $?| Done  $(jot -b ' ' -s '' $COLUMNS - 10)\n";
# done
>>>>>>> Stashed changes

NUMACCOUNTS=$(curl -s -H "Content-Type:application/json" $DB/accounts | jsawk -a 'return this.length');
echo "Total monitary accounts in system is $NUMACCOUNTS";
echo "Give each how much?";
read AMOUNT;
for i in $(seq 0 $NUMACCOUNTS); do 
	TRANS=$(cat data.json| jsawk "this.transaction.amount = $AMOUNT; this.transaction.account=$i; return this.transaction");
	curl -H "Content-Type:application/json" -XPOST  $DB/transactions -d "$TRANS";
done

echo "Done";
