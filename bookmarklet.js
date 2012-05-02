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
	
	document.getElementsByTagName('head')[0].appendChild(script);
}('https://raw.github.com/brian-c/phantom-limb/v1.0.0/phantomLimb.js', 'https://raw.github.com/brian-c/phantom-limb/v1.0.0/limb-black.png'));