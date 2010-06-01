var Module = {};

(function () {
	// Helper for exporting.
	function _export (module, name, val) {
		module[name] = val;
	}
	_export(Module, '_export', _export);
})();
