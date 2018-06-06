console.log("fbfe-content-script-load-succesfull");

document.addEventListener('DOMContentLoaded',function()
{
	injectCustomJs();
	initCustomPanel();
	console.log("dom loaded");
}
);

// 向页面注入js执行查找逻辑
function injectCustomJs(){
	var jsPath = "js/inject.js"
	var tmp = document.createElement("script");
	tmp.setAttribute('type','text/javascript');
	tmp.scr = chrome.runtime.getURL(jsPath);
	console.log(chrome.runtime.id);
	console.log(tmp.src);
	console.log(jsPath);
	if (!tmp.src) {
		tmp.src = "chrome-extension://"+chrome.runtime.id+"/"+jsPath;
		console.log(tmp.src);
	}
	tmp.onload = function(){
		console.log("inject js load finish");
		// do nothing
	};
	document.body.appendChild(tmp);
}

function initCustomPanel()
{
	var panel = document.createElement('div');
	panel.className = 'chrome-plugin-demo-panel';
	panel.innerHTML = `
		<h2>插件操作区：</h2>
		<div class="btn-area">
			<a href="javascript:findAllFeedBack()">找到所有的分享反馈</a><br>
		</div>
		<div id="my_custom_log">
		</div>
	`;
	document.body.appendChild(panel);
}