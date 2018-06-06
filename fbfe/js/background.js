// 接受content-script的消息
chrome.runtime.onMessage.addListener(
function(req,sender,sendRsp){
	console.log("get content-script message");
	console.log(req,sender,sendRsp);
	if (sendRsp) {
		sendRsp("ok");
	}
});