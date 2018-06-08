// 接受content-script的消息
chrome.runtime.onMessage.addListener(
function(req,sender,sendRsp){
	console.log("get content-script message");
	console.log(req,sender,sendRsp);
	exportExcel(req.greeting.data,req.greeting.filename);
	if (sendRsp) {
		sendRsp("ok");
	}
});

function exportExcel(data,filename){
	console.log(document.body);
	console.log(XLSX);
	console.log(XLSX.utils);
	var wb = XLSX.utils.book_new();
	var ws = XLSX.utils.aoa_to_sheet(data);
	XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
	XLSX.writeFile(wb, filename);
}
