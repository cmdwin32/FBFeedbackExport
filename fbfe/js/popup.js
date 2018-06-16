
$("#openDefaultPage").click( e=>{
        console.log("openDefaultPage");
        chrome.runtime.sendMessage({type:"openDefaultPage"}, function(response) {
            console.log('收到来自后台的回复：' + response);
        });
    }
);

$(function(){
    console.log("popup js load finished");
});

function noused() {
    console.log("no used");
}
