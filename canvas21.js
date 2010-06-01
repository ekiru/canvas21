var Canvas21 = {};

(function () {

	function Card (rank, suit) {
		this.rank = rank;
		this.suit = suit;
	}
	Module._export(Canvas21, "Card", Card);

	Card.Ranks = new Enum(11, 'Jack', 'Queen', 'King', 'Ace');
	Card.Suits = new Enum('Clubs', 'Diamonds', 'Hearts', 'Spades');

	Card.Width = 30;
	Card.Height = 20;

	Card.prototype.isRed = function () {
		return this.suit === Card.Suits.Diamonds 
			|| this.suit == Card.Suits.Hearts
	};

	Card.prototype.render = function (ctx, x, y, hidden) {
		var oldFill = ctx.fillStyle;
		var oldStroke = ctx.strokeStyle;
		if (hidden) {
			ctx.fillStyle = Colors.CardBack;
			ctx.fillRect(x, y, Card.Width, Card.Height);
		} else {
			ctx.fillStyle = Colors.CardInterior;
			ctx.fillRect(x, y, Card.Width, Card.Height);

			if (this.isRed()) {
				ctx.fillStyle = Colors.RedColor;
			} else {
				ctx.fillStyle = Colors.BlackColor;
			}
			ctx.fillText(this.rankString() + this.suitString(),
				x + 5, y + 10);
		}

		ctx.strokeStyle = Colors.CardBorder;
		ctx.strokeRect(x, y, Card.Width, Card.Height);

		ctx.fillStyle = oldFill;
		ctx.strokeStyle = oldStroke;
	};

	Card.prototype.rankString = function () {
		switch (this.rank) {
		case Card.Ranks.Ace:
			return 'A';
		case Card.Ranks.King:
			return 'K';
		case Card.Ranks.Queen:
			return 'Q';
		case Card.Ranks.Jack:
			return 'J';
		default:
			return this.rank.toString();
		}
	};

	Card.prototype.suitString = function () {
		switch (this.suit) {
		case Card.Suits.Clubs:
			return '\u2663';
		case Card.Suits.Diamonds:
			return '\u2666';
		case Card.Suits.Hearts:
			return '\u2665';
		case Card.Suits.Spades:
			return '\u2660';
		}
	}

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
	Module._export(Canvas21, "Deck", Deck);

	Deck.prototype.shuffle = function () {
		for (var i = this.cards.length - 1; i > 1; i--) {
			var j = Math.round(Math.random() * i);
			var tmp = this.cards[i];
			this.cards[i] = this.cards[j];
			this.cards[j] = tmp;
		}
	};

	Deck.prototype.draw = function () {
		var result = this.cards.pop();
		if (result === undefined) {
			window.deck = this;
			throw new Error(["Undefined draw...", this]);
		}
		return result;
	};

	function Game () {
		this.canvas = document.getElementById('gameCanvas');
		this.ctx = this.canvas.getContext('2d');

		this.deck = new Deck();
		this.deck.shuffle();

		this.dealer = [];
		this.player = [];

		this.hit(this.player);
		this.hit(this.dealer, {hidden: 1});
		this.hit(this.player);
		this.hit(this.dealer);

		this.render();
		console.log('Game initialized.');
	}
	Module._export(Canvas21, 'Game', Game);

	Game.ResultX = 10;
	Game.ResultY = 10;

	Game.PlayerX = 60;
	Game.PlayerY = 30;

	Game.DealerX = 60;
	Game.DealerY = 60;

	Game.prototype.dealerCanPlay = function () {
		return this.score(this.dealer) <= 17;
	};

	Game.prototype.render = function () {
		this.ctx.fillText("Player", 0, Game.PlayerY);
		this.ctx.fillText("Dealer", 0, Game.DealerY);

		var winner;
		if (winner = this.whoWon()) {
			this.ctx.fillText('The ' + winner + ' won.', 
				Game.ResultX, Game.ResultY);
			function unhide(item) {
				item.hidden = false;
			}
			Iter.map(this.player, unhide);
			Iter.map(this.dealer, unhide);
		}

		var ctx = this.ctx;
		var x = Game.PlayerX;
		var y = Game.PlayerY;
		Iter.map(this.player, function (item) {
				if (!item.card) console.log(item);
				item.card.render(ctx, x, y, item.hidden);
				x += Card.Width + 10;
			});

		var x = Game.DealerX;
		var y = Game.DealerY;
		Iter.map(this.dealer, function (item) {
				if (!item.card) console.log(item);
				item.card.render(ctx, x, y, item.hidden);
				x += Card.Width + 10;
			});
	}

	Game.prototype.hasBusted = function (hand) {
		return this.score(hand) > 21;
	};

	Game.prototype.hit = function (hand, options) {
		if (this.deck.cards.length > 0) {
			var card = this.deck.draw();
			hand.push({
				card: card,
				hidden: ((options && options.hidden) ? true : false)
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
		var dealerHit;
		if (playerHit) {
			this.hit(this.player);
		}
		if (dealerHit = this.dealerCanPlay()) {
			this.hit(this.dealer);
		}
		this.render(playerHit, dealerHit);
	};

	Game.prototype.whoWon = function () {
		var dealerScore = this.score(this.dealer);
		var playerScore = this.score(this.player);
		if (dealerScore === 21) {
			return 'dealer';
		} else if (playerScore === 21) {
			return 'player';
		} else if (this.hasBusted(this.player)) {
			return 'dealer';		
		} else if (this.hasBusted(this.dealer)) {
			return 'player';
		} else if (!this.dealerCanPlay() && playerScore > dealerScore) {
			return 'player';
		} else {
			return null;
		}
	};

})();
