console.log("inject loaded");
function dispatch(el, type){
    try{
        var evt = document.createEvent('Event');
        evt.initEvent(type,true,true);
        el.dispatchEvent(evt);
    }catch(e){alert(e)};
}
function expansContent(){
	var expBtn = document.getElementsByClassName("UFIPagerLink");
	if (expBtn.length <= 0) {
		findAllData();
	}
	else{
		for (var i = 0; i < expBtn.length;i++){
			dispatch(expBtn[i], 'click');
		}
		setTimeout(expansContent,1000);
	}
}

function findAllFeedBack()
{
	expansContent();
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function findAllData()
{
	var nL = document.getElementsByClassName("userContentWrapper");
	var data = "";
	for (var i = 0; i < nL.length; i++) {
		// 分享的内容
		var cN = nL[i].getElementsByClassName("userContent")
		for (var j = 0; j < cN.length; j++) {
			var pN = cN[j].getElementsByTagName("p");
			for (var k = 0; k < pN.length; k++) {
				// console.log(pN[k].textContent);
				var cNS = pN[k].childNodes;
				var text = "";
				for(var l = 0; l < cNS.length; l++){
					if (cNS[l].nodeName == "#text") {
						text += cNS[l].nodeValue;
					}
					else if(cNS[l].nodeName == "SPAN")
					{
						text += cNS[l].innerText;
					}
					else if(cNS[l].nodeName == "A"){
						text += "[#]"+cNS[l].href+"[#]";
					}
					else if(cNS[l].nodeName == "BR"){

					}
					else{
						console.log(i+""+j+""+k+""+l+":");
						console.log(cNS[l]);
					}
				}
				data += "title,"+text.replace("\n","")+",\n";
			}
			// console.log("pN"+pN.length);
		}
		// console.log("cN"+cN.length);
		// 分享的评论
		var bB = nL[i].getElementsByClassName("UFICommentBody");
		// console.log("xx:"+bB.length);
		for (var j = 0; j < bB.length; j++) {
			// console.log(bB[j].innerHTML);
			var bCN = bB[j].childNodes;
			var text = "";
			// console.log("text##");
			for(var k = 0;k < bCN.length; k++){
				if (bCN[k].nodeName == "#text") {
					text += bCN[k].nodeValue;
				}
				else if(bCN[k].nodeName == "SPAN"){
					text += bCN[k].innerText;
				}
				else if(bCN[k].nodeName == "A"){
					text += "[#]"+bCN[k].href+"[#]";
				}
				else if(bCN[k].nodeName == "BR"){

				}
				else{
					console.log(i+""+j+""+k+":");
					console.log(bCN[k]);
				}
			}
			data += ",text,"+text.replace("\n","")+",\n";
		}
	}
	console.log("##data:");
	console.log(data);
	console.log("######");
	var d = new Date();
	var fileName = "FBData_"+d.toLocaleTimeString()+".csv";
	download(fileName,data);
}