javascript:void(function(commit) {
	var scriptTag = document.createElement('script');
	scriptTag.type = 'text/javascript';
	scriptTag.src = 'https://raw.github.com/brian-c/phantom-limb/' + commit + '/phantom-limb.js';
	document.body.appendChild(scriptTag);
}('rewrite'));
