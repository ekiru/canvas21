var Module = {};

(function () {
	// Helper for exporting.
	function export (module, name, val) {
		module[name] = val;
	}
	export(Module, 'export', export);
})();
