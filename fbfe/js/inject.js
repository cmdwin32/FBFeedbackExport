console.log("inject loaded");
function dispatch(el, type){
    try{
        var evt = document.createEvent('Event');
        evt.initEvent(type,true,true);
        el.dispatchEvent(evt);
    }catch(e){alert(e)};
}
function expansContent(type){

	// 只在2的时候查找更多分享
	if (type == 2) {
		var expBtn = document.getElementsByClassName("UFIPagerLink");
	}
	else{
		var expBtn = []
	}

	// 查找所有的“查看更多” 总是展开用户回复的隐藏内容
	var moreBtns = document.getElementsByClassName("fss");
	console.log("more btn:"+moreBtns.length);
	if (expBtn.length <= 0 && moreBtns.length <= 0) {
		findAllData();
	}
	else{
		for (var i = 0; i < expBtn.length;i++){
			dispatch(expBtn[i], 'click');
		}
		for (var i = 0; i < moreBtns.length; i++) {
			dispatch(moreBtns[i], 'click');
		}
		setTimeout(expansContent,1000);
	}
}

function findAllFeedBack(type)
{
	expansContent(type);
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

function realText(text){
	return text.replace(/[\r\n]/g,"").replace(/,/g,"，");
}

function strNum(text){
	if (text.indexOf("萬") > 0) {
		text = text.replace(/,/g,"");
		text = text.match(/\d+/g).map(Number);
		text = text.join('.');
		text = text + "W";
		// text = text[0]*10000+text[1]*1000;
		return [text]
	}
	return text.replace(/,/g,"");
}

function realNum(text){
	// console.log(text);
	// console.log(text.replace(/,/g,""));
	if (text.indexOf("萬") > 0) {
		text = text.replace(/,/g,"");
		text = text.match(/\d+/g).map(Number);
		text = text.join('.');
		text = text + "W";
		// console.log(text)
		// text = text[0]*10000+text[1]*1000;
		// console.log(text);
		return [text];
	}
	// console.log(text.replace(/,/g,"").match(/\d+/g).map(Number));
	return text.replace(/,/g,"").match(/\d+/g).map(Number);
}

// 在图片类分享页面查找数据
function findAllDataInPhotoContextualLayer(){

}

// 在影片类分享页面查找数据
function findAllDataInVideoContextualLayer(){

}

function findAllData()
{
	var nL = document.getElementsByClassName("userContentWrapper");
	var resData = [];
	var keys = ["id","类型","内容","作者姓名","发布日期","发布时间","分享次数","总点讚","讚","大心","哇","哈","嗚","怒","",""];
	resData.push(keys);
	var index = {
		id : 0,
		type : 1,
		content : 2,
		author : 3,
		date : 4,
		time : 5,
		shareTimes : 6,
		totleLike : 7,
		like : 8,
		sheart : 9,
		wa : 10,
		wu : 11,
		angry : 12
	};
	var data = "";
	var pIdx = 1;
	for (var i = 0; i < nL.length; i++) {
		console.log("nl:"+i+":"+nL.length);
		var line = new Array(keys.length);
		line[index.id] = pIdx;
		pIdx++;
		// 分享的内容
		var cN = nL[i].getElementsByClassName("userContent")
		var title = "";
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
						// text += "["+cNS[l].innerText+"]#"+cNS[l].href+"#";
						text += cNS[l].innerText;
					}
					else if(cNS[l].nodeName == "BR"){
						text += " ";
					}
					else{
						console.log(i+""+j+""+k+""+l+":");
						console.log(cNS[l]);
					}
				}
				// data += "title,"+realText(text)+",\n";
				title += realText(text);

			}
			// console.log("pN"+pN.length);
		}
		line[index.type]="分享内容";
		line[index.content] = title;
		// console.log("cN"+cN.length);
		// 发布时间
		var timeNode = nL[i].getElementsByClassName("livetimestamp");
		if (timeNode && timeNode.length > 0) {
			var time = timeNode[0].getAttribute("title");	
			time = time.split(" ");
			line[index.date] = time[0];
			line[index.time] = time[1];
		}
		//data += ",timestamp,"+timeNode[0].getAttribute("title")+"\n";
		
		// 分享的次数
		var sN = nL[i].getElementsByClassName("UFIShareLink");
		// data += ",shareTimes,"+sN[0].textContent+"\n";
		if (sN && sN.length > 0) {
			line[index.shareTimes] = realNum(sN[0].textContent);	
		}
		
		// console.log(sN[0]);
		// 用户名称
		// var actorName = nL[i].getElementsByClassName("UFICommentActorName");
		// if (actorName && actorName.length > 0) {
		// 	var acName = "";
		// 	for(var acNIdx = 0; acNIdx < actorName.length; ++ acNIdx){
		// 		acName = actorName[acNIdx].textContent;
		// 	}
		// }
		// line[index.author] = acName;
		// 点赞次数
		var zanN = nL[i].getElementsByClassName("UFILikeSentence");
		if (zanN && zanN.length > 0) {

			var azanN = zanN[0].getElementsByTagName("a");
			var totleLike = 0;
			for(var z = 0; z < azanN.length; ++z){
				var zanData = azanN[z].getAttribute("aria-label");
				if (zanData) {
					// 从赞遍历到
					for(var idx = index.like; idx < index.angry; ++idx){
						// 匹配到第一个点赞类型
						if (zanData.indexOf(keys[idx]) >= 0) {
							// console.log(zanData);
							var numLike = realNum(zanData);
							// console.log(numLike);
							if (numLike && numLike.length >0) {
								totleLike += numLike[0];
								line[idx] = "" + numLike[0];
								break;
							}
							// console.log(totleLike);
							// console.log(line[idx]);
							// console.log(keys[idx]);
						}
					}
					//data += ",zan,"+azanN[z].getAttribute("aria-label")+"\n";
				}
			}
			// 获取总赞
			var tZanNode = zanN[0].getElementsByTagName("span");
			for(var zIdx = 0; zIdx < tZanNode.length; ++zIdx){
				if (tZanNode[zIdx].getAttribute("data-hover") == "tooltip") {
					var tData = tZanNode[zIdx].innerText;
					if (tData.indexOf("你和其他") >= 0 || strNum(tData) == realNum(tData)[0]) {
						line[index.totleLike] = realNum(tData);
					}
				}
			}
		}
		// line[index.totleLike] = totleLike;
		resData.push(line);
		// 遍历一级分享和二级分享集合
		if ( nL[i].getElementsByClassName("UFIList") &&  nL[i].getElementsByClassName("UFIList").length > 0) {
			var fLCN = nL[i].getElementsByClassName("UFIList")[0].childNodes;
			console.log("fLCN.lenght"+fLCN.length);
			for(var z = 0; z < fLCN.length; ++z){
				if (fLCN[z].nodeName == "DIV") {
					if (fLCN[z].childNodes.length == 1 && fLCN[z].childNodes[0].classList.length == 0) {
						console.log("found fLCN");
						fLCN = fLCN[z].childNodes[0].childNodes;
						break;
					}
				}
			}
			console.log("fLCN.lenght"+fLCN.length);
			for(var j = 0;j < fLCN.length; ++j){
				console.log(j+fLCN[j].classList);
				if (fLCN[j].classList.contains("UFIComment")) {
					var bB = fLCN[j].getElementsByClassName("UFICommentBody");
					console.log("xx:"+bB.length);
					line = new Array(keys.length);
					line[index.id] = pIdx;
					pIdx++;
					// 分享的文字内容
					// console.log(bB[j].innerHTML);
					// 只会有一个内容
					var bCN = bB[0].childNodes;
					var text = "";
					// console.log("text##");
					for(var l = 0;l < bCN.length; l++){
						if (bCN[l].nodeName == "#text") {
							text += bCN[l].nodeValue;
						}
						else if(bCN[l].nodeName == "SPAN"){
							text += bCN[l].innerText;
						}
						else if(bCN[l].nodeName == "A"){
							text += bCN[l].innerText;
						}
						else if(bCN[l].nodeName == "BR"){
							text += " ";
						}
						else{
							console.log(i+""+j+""+k+""+l+":");
							console.log(bCN[l]);
						}
					}
					line[index.content] = realText(text);
					// data += ",text,"+realText(text)+",";
					console.log(data);
					// 获得评论的时间
					var timeNode = fLCN[j].getElementsByClassName("UFISutroCommentTimestamp");
					// data += timeNode[0].getAttribute("title")+",";
					var time = timeNode[0].getAttribute("title");
					time = time.split(" ");
					line[index.date] = time[0];
					line[index.time] = time[1];
					// 获得点赞数
					var zanN = fLCN[j].getElementsByClassName("UFICommentReactionsBling");
					var totleLike = 0;
					if(zanN && zanN.length >0){
						var azanN = zanN[0].getElementsByTagName("span");
						for(var z = 0; z < azanN.length; ++z){
							var zanData = azanN[z].getAttribute("aria-label");
							if (zanData) {
								// 从赞遍历到
								for(var idx = index.like; idx < index.angry; ++idx){
									// 匹配到第一个点赞类型
									if (zanData.indexOf(keys[idx]) >= 0) {
										var numLike = realNum(zanData);
										if (numLike && numLike.length >0) {
											totleLike += numLike[0];
											line[idx] = "" + numLike[0];
											break;
										}
									}
								}
							}
						}
						// 获取总赞
						var tZanNode = zanN[0].getElementsByClassName("UFICommentLikeButton");
						for(var zIdx = 0; zIdx < tZanNode.length; ++zIdx){
							// if (tZanNode[zIdx].getAttribute("data-hover") == "tooltip") {
							var tData = tZanNode[zIdx].innerText;
							if (tData.indexOf("你和其他") >= 0 || strNum(tData) == realNum(tData)[0]) {
								line[index.totleLike] = realNum(tData);
							}
							// }
						}
					}
					line[index.type] = "一级回复";
					// line[index.totleLike] = totleLike;
					resData.push(line);
					// data += "\n";
					// console.log(data);
				}
				else if(fLCN[j].classList.contains("UFIReplyList")){
					console.log("二级回复");
					var rN = fLCN[j].getElementsByClassName("UFICommentContentBlock");
					for(var k = 0;k < rN.length; ++k){
						// 获得回复内容
						line = new Array(keys.length);
						line[index.id] = pIdx;
						pIdx++;
						var bB = rN[k].getElementsByClassName("UFICommentBody");
						var bCN = bB[0].childNodes;
						var text = "";
						// console.log("text##");
						for(var l = 0;l < bCN.length; l++){
							if (bCN[l].nodeName == "#text") {
								text += bCN[l].nodeValue;
							}
							else if(bCN[l].nodeName == "SPAN"){
								text += bCN[l].innerText;
							}
							else if(bCN[l].nodeName == "A"){
								text += bCN[l].innerText;
							}
							else if(bCN[l].nodeName == "BR"){
								text += " ";
							}
							else{
								console.log(i+""+j+""+k+""+l+":");
								console.log(bCN[l]);
							}
						}
						// data += ",,reply,"+realText(text)+",";
						line[index.type] = "二级回复";
						line[index.content] = realText(text);
						// 获得时间
						var timeNode = rN[k].getElementsByClassName("UFISutroCommentTimestamp");
						if (timeNode.length > 0) {
							// data += timeNode[0].getAttribute("title")+",";	
							var time = timeNode[0].getAttribute("title");
							time = time.split(" ");
							line[index.date] = time[0];
							line[index.time] = time[1];
						}
						// 获得点赞
						var zanN = rN[k].getElementsByClassName("UFICommentReactionsBling");
						var totleLike = 0;
						if(zanN && zanN.length >0){
							var azanN = zanN[0].getElementsByTagName("span");
							for(var z = 0; z < azanN.length; ++z){
								var zanData = azanN[z].getAttribute("aria-label");
								if (zanData) {

									// 从赞遍历到
									for(var idx = index.like; idx < index.angry; ++idx){
										// 匹配到第一个点赞类型
										if (zanData.indexOf(keys[idx]) >= 0) {
											var numLike = realNum(zanData);
											if (numLike && numLike.length >0) {
												totleLike += numLike[0];
												line[idx] = "" + numLike[0];
												break;
											}
										}
									}	
								}
							}
							var tZanNode = zanN[0].getElementsByClassName("UFICommentLikeButton");
							for(var zIdx = 0; zIdx < tZanNode.length; ++zIdx){
								// if (tZanNode[zIdx].getAttribute("data-hover") == "tooltip") {
								var tData = tZanNode[zIdx].innerText;
								if (tData.indexOf("你和其他") >= 0 || strNum(tData) == realNum(tData)[0]) {
									line[index.totleLike] = realNum(tData);
								}
								// }
							}
						}
						// line[index.totleLike] = ""+totleLike;
						// data += "\n";
						resData.push(line);
					}
				}
			}

		}


	}
	// console.log("##data:");
	// console.log(data);
	// console.log("######");
	var d = new Date();
	var fileName = "FBData_"+d.toLocaleTimeString()+".csv";
	var cvsData = "";
	for(var i = 0; i < resData.length; ++i){
		if (resData[i]) {

			for (var j = 0; j < resData[i].length; ++j){
				if (resData[i][j]) {
					cvsData += resData[i][j]+",";
				}
				else{
					cvsData += ",";
				}
			}
		}
		cvsData += "\n";
	}
	download(fileName,cvsData);
	// exportExcel(resData,"FBData_"+d.toLocaleTimeString()+".xlsx")
}

function exportExcel(data,filename){
	var msg = {
		data:data,
		filename:filename
	};
	// window.postMessage({cmd: 'exportExcel', data: msg}, '*');

	// console.log(document.body);
	// console.log(XLSX);
	// console.log(XLSX.utils);
	// var wb = XLSX.utils.book_new();
	// var ws = XLSX.utils.aoa_to_sheet(data);
	// XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
	// XLSX.writeFile(wb, filename);
}

