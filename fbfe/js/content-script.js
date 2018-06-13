console.log("fbfe-content-script-load-succesfull");

// indexCustomJS2();

document.addEventListener('DOMContentLoaded',function()
{
	injectCustomJs();
	initCustomPanel();
	console.log("dom loaded");
}
);

function indexCustomJS2(){
	var html = "";
	var allPaths = ["js/lib/shim.min.js","js/lib/xlsx.full.min.js","js/inject.js"];
	for(var i = 0; i< allPaths.length; ++i){
		var jsPath = allPaths[i];
		html += "<script type='text/javascript' src='" + "chrome-extension://"+chrome.runtime.id+"/"+jsPath + "'></script>";
		
	}
	console.log(html);
	document.write(html);
}

// 向页面注入js执行查找逻辑
function injectCustomJs(){
	var allPaths = ["js/lib/shim.min.js","js/lib/xlsx.full.min.js","js/inject.js"];
	for(var i = 0; i< allPaths.length; ++i){
		var jsPath = allPaths[i];

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
			console.log("inject js "+ jsPath +" load finish");
			// do nothing
		};
		document.body.appendChild(tmp);
	}
}

function initCustomPanel()
{
	var panel = document.createElement('div');
	panel.className = 'chrome-plugin-demo-panel';
	panel.innerHTML = `
		<h2>插件操作区：</h2>
		<div class="btn-area">
			<a href="javascript:findAllFeedBack(1)">导出分享</a><br>
			<a href="javascript:findAllFeedBack(2)">导出分享的反馈</a><br>
		</div>
		<div id="my_custom_log">
		</div>
	`;
	document.body.appendChild(panel);
}

window.addEventListener("message", function(e)
{
	// console.log('收到消息：', e.data);
	if(e.data && e.data.cmd == 'exportExcel') {	console.log(document.body);
		// console.log(XLSX);
		// console.log(XLSX.utils);
		// console.log(e.data)
		// console.log(e.data.data)
		// var wb = XLSX.utils.book_new();
		// var ws = XLSX.utils.aoa_to_sheet(e.data.data.data);
		// XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
		// XLSX.writeFile(wb, e.data.data.filename);
		chrome.runtime.sendMessage({greeting: e.data.data}, function(response) {
			console.log('收到来自后台的回复：' + response);
		});
	}
}, false);