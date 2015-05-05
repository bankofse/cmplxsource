select 
	accounts.id as account_number,
	cards.card_number,
	amounts.amount
from accounts
join amounts on
	accounts.id=amounts.account
left join cards on
	accounts.card_id=cards.id
