function Enum () {
	var i, iota;
	if (arguments.length > 0 && typeof arguments[0] === "number") {
		i = 1;
		iota = arguments[0];
	} else {
		i = 0;
		iota = 0;
	}

	for (; i < arguments.length; i++, iota++) {
		this[arguments[i]] = iota;
	}
}
