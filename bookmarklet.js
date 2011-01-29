javascript: void(function(scriptSrc, imgSrc) {
	var script = document.createElement('script');
	script.src = scriptSrc;
	script.type = 'text/javascript';
	script.addEventListener('load', function() {
		if ('phantomLimb' in window) {
			phantomLimb.init({src: imgSrc});
		} else {
			console.error('Phantom Limb could not be loaded');
		}
	}, false);
	
	document.head.appendChild(script);
}('https://github.com/brian-c/phantom-limb/raw/master/phantomLimb.js', 'https://github.com/brian-c/phantom-limb/raw/master/limb-black.png'));
