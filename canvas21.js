var Canvas21 = {};

(function () {

	function Card (rank, suit) {
		this.rank = rank;
		this.suit = suit;
	}
	Module.export(Canvas21, "Card", Card);

	Card.Ranks = new Enum(11, 'Jack', 'Queen', 'King', 'Ace');
	Card.Suits = new Enum('Clubs', 'Diamonds', 'Hearts', 'Spades');

	Card.prototype.toString = function () {
		var rank;
		var suit;
		switch (this.rank) {
		case Card.Ranks.Ace:
			rank = 'Ace';
			break;
		case Card.Ranks.King:
			rank = 'King';
			break;
		case Card.Ranks.Queen:
			rank = 'Queen';
			break;
		case Card.Ranks.Jack:
			rank = 'Jack';
			break;
		default:
			rank = this.rank.toString();
		}
		switch (this.suit) {
		case Card.Suits.Clubs:
			suit = 'Clubs';
			break;
		case Card.Suits.Diamonds:
			suit = 'Diamonds';
			break;
		case Card.Suits.Hearts:
			suit = 'Hearts';
			break;
		case Card.Suits.Spades:
			suit = 'Spades';
			break;
		}
		return rank + ' of ' + suit;
   	};

	function Deck () {
		var cards = [];
		this.cards = cards;
		Iter.forEachIn(Card.Suits,
			function (suit) {
				for (var i = 2; i <= 10; i++) {
					cards.push(new Card(i, suit));
				}
				Iter.forEachIn(Card.Ranks,
					function (face) {
						cards.push(new Card(face, suit));
					});
			});
	}
	Module.export(Canvas21, "Deck", Deck);

	Deck.prototype.shuffle = function () {
		for (var i = this.cards.length; i > 1; i--) {
			var j = Math.round(Math.random() * i);
			var tmp = this.cards[i];
			this.cards[i] = this.cards[j];
			this.cards[j] = tmp;
		}
	};

	Deck.prototype.draw = function () {
		return this.cards.pop();
	};

	function Game () {
		this.deck = new Deck();
		this.deck.shuffle();

		this.dealer = [];
		this.player = [];

		this.hit(this.player);
		this.hit(this.dealer, {hidden: 1});
		this.hit(this.player);
		this.hit(this.dealer);

		this.render();
	}
	Module.export(Canvas21, 'Game', Game);

	Game.prototype.dealerCanPlay = function () {
		return this.score(this.dealer) <= 17;
	};

	Game.prototype.render = function () {
		var playerRow = document.getElementById('player');
		var playerScore = document.getElementById('playerScore');
		var dealerRow = document.getElementById('dealer');
		var dealerScore = document.getElementById('dealerScore');

		Iter.map(this.player, function (item) {
				if (!item.shown) {
					var cardElement = document.createElement('td');
					cardElement.innerHTML = item.card.toString();
					playerRow.appendChild(cardElement);
					item.shown = true;
				}
			});

		Iter.map(this.dealer, function (item) {
				if (!item.shown) {
					var cardElement = document.createElement('td');
					cardElement.innerHTML = item.card.toString();
					dealerRow.appendChild(cardElement);
					item.shown = true;
				}
			});

		var winner;
		if (winner = this.whoWon()) {
			var resultElement = document.getElementById('result');
			resultElement.innerHTML = 'The ' + winner + ' won.';
		}
	}

	Game.prototype.hasBusted = function (hand) {
		return this.score(hand) > 21;
	};

	Game.prototype.hit = function (hand, options) {
		if (this.deck.cards.length > 0) {
			var card = this.deck.draw();
			hand.push({
				card: card,
				hidden: (options && options.hidden) ? true : false
				});
		} else {
			throw new Error("Can't hit when the deck is empty.");
		}
	};

	Game.prototype.score = function (hand) {
		var aces = 0;
		var result =
			Iter.reduce(
				Iter.map(hand, function (item) {
						switch (item.card.rank) {
						case Card.Ranks.Ace:
							aces++;
							return 1;
						case Card.Ranks.King:
						case Card.Ranks.Queen:
						case Card.Ranks.Jack:
							return 10;
						default:
							return item.card.rank;
						}
					}),
				Functional.add, 0);
		while (aces && result < 12) {
			aces--;
			result += 10;
		}

		return result;
	};

	Game.prototype.step = function (playerHit) {
		if (playerHit) {
			this.hit(this.player);
		}
		if (this.dealerCanPlay()) {
			this.hit(this.dealer);
		}
		this.render();
	};

	Game.prototype.whoWon = function () {
		var dealerScore = this.score(this.dealer);
		var playerScore = this.score(this.player);
		if (dealerScore === 21) {
			return 'dealer';
		} else if (playerScore === 21) {
			return 'player';		
		} else if (this.hasBusted(this.dealer)) {
			return 'player';
		} else if (this.hasBusted(this.player)) {
			return 'dealer';
		} else if (!this.dealerCanPlay() && playerScore > dealerScore) {
			return 'player';
		} else {
			return null;
		}
	};

})();
