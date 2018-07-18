console.log("fbfe-content-script-load-succesfull");

// indexCustomJS2();

document.addEventListener('DOMContentLoaded',function()
{
	injectCustomJs();
	// initCustomPanel();
	console.log("dom loaded");
}
);

// 向页面注入js执行查找逻辑
function injectCustomJs(){
	let allPaths = ["js/config.js","js/utils.js","js/inject.js"];
	for(let i = 0; i< allPaths.length; ++i){
		let jsPath = allPaths[i];

		let tmp = document.createElement("script");
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
    console.log(window.location.href);
    let panel = document.createElement('div');
    panel.className = 'chrome-plugin-demo-panel';
    panel.style.cssText = `z-index:  10000;`;
    if (window.location.href.indexOf("videos") > 0){
        // 视频页面
        panel.innerHTML = `
        <h2>插件操作区：</h2>
        <style type="text/css">
    		#GreatMountainDialog{
    			z-index:100;
    		}    
		</style>
                <div id="GreatMountainDialog">
                    <div>开始日期: <input type="date" id="startTime" /></div>
                    <div>结束日期: <input type="date" id="endTime" /></div>
                    <a href="javascript:exportVideoFeedback(2)">>>导出视频回复<<</a><br>
                    <a href="javascript:ignore()">>>跳过<<</a><br>
                </div>
                <div id="my_custom_log">
                </div>
                <br/>
        </html>
            `;
    }
    else if(window.location.href.indexOf("photos") > 0){
		panel.innerHTML = `
		        <h2>插件操作区：</h2>
                <style type="text/css">
                    #GreatMountainDialog{
                    z-index:10000;
                    }    
                </style>
                <div id="GreatMountainDialog">
                    <div>开始日期: <input type="date" id="startTime" /></div>
                    <div>结束日期: <input type="date" id="endTime" /></div>
                    <a href="javascript:exportPhotoFeedback(2)">>>圖片分析回復<</a><br>
                    <a href="javascript:ignore()">>>跳过<<</a><br>
                </div>
                <div id="my_custom_log">
                </div>
                <br/>
        </html>
		`;
	}
    else{
         panel.innerHTML = `
        <h2>插件操作区：</h2>
                <div id="GreatMountainDialog">
                    <div>开始日期: <input type="date" id="startTime" /></div>
                    <div>结束日期: <input type="date" id="endTime" /></div>
                    <a href="javascript:findAllUrl()">>>>>>自动导出<<<<<</a><br>
                    <a href="javascript:autoExportStart()">>>>>>测试<<<<<</a><br>
                    <a href="javascript:ignore()">>>跳过<<</a><br>
                </div>
                <div id="my_custom_log">
                </div>
                <br/>
        </html>
            `;
    }

	document.body.appendChild(panel);
}


const forward_event_list = [
	'exportExcel',
	'StartExportPerPage',
	'finishExport',
	'ExportNotReady',
	'autoExportIsStared',
	'ExportPRogressUpdate',
    "autoExportWithDataRange",
	"ignore",
    "reStartExport"
];

window.addEventListener("message", function(e)
{
	// console.log('收到消息：', e.data);
    // console.log(e.data);
	if(e.data && ( forward_event_list.indexOf(e.data.cmd) >= 0 ) ){
	    console.log("get message");
	    console.log(e.data);
		chrome.runtime.sendMessage(e.data, function(response) {
			console.log('收到来自后台的回复：' );
			console.log(response);
		});
	}
    else if(e.data && e.data.cmd == "startExport"){

    }
}, false);

// 发送消息到inject
function sendInJectMsg(req) {
    window.postMessage(req
        ,'*');
}

const listenList = [
	"autoExportWithDataRange"
	,"autoExport"
	,"startExport"
    ,"reStartExport"
];
// 添加与background的通讯监听
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
    console.log("bg event:");
    console.log(request);
    console.log(listenList.includes(request.cmd));
    if (listenList.includes(request.cmd)){
    	console.log("send:"+request.cmd);
    	sendInJectMsg(request);
	}
});

