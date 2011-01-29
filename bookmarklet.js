javascript: void(function(scriptSrc, config) {
	var script = document.createElement('script');
	script.src = scriptSrc;
	script.type = 'text/javascript';
	script.addEventListener('load', function() {
		if ('phantomLimb' in window) {
			phantomLimb.init(config);
		} else {
			console.error('Phantom Limb could not be loaded');
		}
	}, false);
	
	document.head.appendChild(script);
}('https://github.com/brian-c/phantom-limb/raw/master/phantomLimb.js', {src: 'https://github.com/brian-c/phantom-limb/raw/master/limb-black.png', lefty: false}));
