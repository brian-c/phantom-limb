javascript:void(function() {
	var script = document.createElement('script');
	script.src = 'http://dl.dropbox.com/u/557187/phantomLimb/phantomLimb.js';
	script.type = 'text/javascript';
	script.addEventListener('load', function() {
		if ('phantomLimb' in window) {
			phantomLimb.init();
		} else {
			console.error('Phantom Limb could not be loaded');
		}
	}, false);
	
	document.getElementsByTagName('head')[0].appendChild(script);
}());