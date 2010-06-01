var Iter = {};

(function () {

	function forEachIn (obj, func) {
		for (prop in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, prop)
				&& Object.prototype.propertyIsEnumerable.call(obj, 
					prop)) {
				func(obj[prop]);
			}
		}
	}
	Module._export(Iter, 'forEachIn', forEachIn);

	function map (array, func) {
		var result = []
		var len = array.length;
		for (var i = 0; i < len; i++) {
			result[i] = func(array[i]);
		}
		return result;
	}
	Module._export(Iter, 'map', map);

	function reduce (array, func, initial) {
		var len = array.length;
		var accum = initial;
		for (var i = 0; i < len; i++) {
			accum = func(accum, array[i]);
		}
		return accum;
	}
	Module._export(Iter, 'reduce', reduce);

})();
