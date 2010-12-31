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
}('http://dl.dropbox.com/u/557187/phantom-limb/phantomLimb.js', 'http://dl.dropbox.com/u/557187/phantom-limb/limb-black.png'));