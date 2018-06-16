let progress = 0;
// 接受content-script的消息
chrome.runtime.onMessage.addListener(
function(req,sender,sendRsp){
	console.log("get content-script message");
	console.log(req,sender,sendRsp);
	// exportExcel(req.greeting.data,req.greeting.filename);
    if (req.type == "openDefaultPage") {
        // 打开默认页面
        openDefaultPage();
    }
    else if (req.type == "ExportPRogressUpdate"){
        // 更新导出进度
        if (progress == 0){
            chrome.notifications.create("1234",{
                    type: 'progress',
                    iconUrl: '../img/icon.png',
                    title: '1234',
                    message: 'message',
                    progress:progress,
                }
            );
        }
        else{
            chrome.notifications.update("1234",{
                progress:progress,
            });
        }
        progress += 20;
    }
    else if (req.type == "StartExportPerPage"){
        // 逐个文件导出
    }
	if (sendRsp) {
		sendRsp("ok");
	}
});

function exportExcel(data,filename){
	console.log(document.body);
	console.log(XLSX);
	console.log(XLSX.utils);
	let wb = XLSX.utils.book_new();
	let ws = XLSX.utils.aoa_to_sheet(data);
	XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
	XLSX.writeFile(wb, filename);
}


function  openDefaultPage() {
    console.log("openDefaultPage");
    chrome.tabs.create(
        {url:"https://www.facebook.com/pg/ROVTH/posts/"}
    );
}