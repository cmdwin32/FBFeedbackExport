// console.log("inject loaded");

const langauge = {
	"cht":{
		"wan":"萬",
		"zan":"讚",
		"daxin":"大心",
		"wa":"哇",
		"ha":"哈",
		"wu":"嗚",
		"nu":"怒",
		"playTimes":"",
		"shareTimes":"",
		"youAndOthers":"你和其他",
		"hidden":"隐藏",
		"discuss":"评论",
	},
	"chs":{
		"wan":"万",
		"zan":"赞",
		"daxin":"大爱",
		"wa":"哇",
		"ha":"笑趴",
		"wu":"心碎",
		"nu":"怒",
		"playTimes":"次播放",
		"shareTimes":"次分享",
		"youAndOthers":"你和其他",
		"hidden":"隐藏",
		"discuss":"评论",
	},
	"en":{

	}
}



const langType = "chs";


function exportVideoFeedback(
    type
) {
   expansVideoPageContent(type);
}

function findAllFeedBack(startTime,endTime,type)
{
	if (startTime == 0) {
		startTime = document.getElementById("startTime").value;
	}
	if (endTime == 0) {
		endTime = document.getElementById("endTime").value;
	}
	// 倒叙查找，开始要小于结束
	if (startTime < endTime) {
		let t = startTime;
		startTime = endTime;
		endTime = t;
	}
	// console.log(startTime)
	// console.log(endTime);
	LoadPageWithDataRange(getTimestamp(startTime),getTimestamp(endTime),type);
	// expansContent(type);
}

function getLangText(key){
	return langauge[langType][key];
}

function getTextFromElement(ele){
	let resStr = "";
	for (let i = 0; i < ele.childNodes ; ++i ){
		if (ele.childNodes[i].nodeName == "#text") {
			resStr += ele.childNodes[i].nodeValue;
		}
		else if(ele.childNodes[i].nodeName == "SPAN"){
			resStr += ele.childNodes[i].innerText;

		}
	}
}

function dispatch(el, type){
    try{
        let evt = document.createEvent('Event');
        evt.initEvent(type,true,true);
        el.dispatchEvent(evt);
    }catch(e){alert(e)};
}

function sec2time(s) {
        let t;
        if(s > -1){
            let hour = Math.floor(s/3600);
            let min = Math.floor(s/60) % 60;
            let sec = s % 60;
            if (hour > 0) {
            	if(hour < 10) {
	                t = '0'+ hour + ":";
	            } else {
	                t = hour + ":";
	            }	
            }
            else{
            	t = "00:";
            }

            if(min < 10){t += "0";}
            t += min + ":";
            if(sec < 10){t += "0";}
            t += sec.toFixed(0);
        }
        return t;
    }

function getTimestamp(date){
	date = date.replace(/'-'/g,'/');
	let d = new Date();
	let n = d.getTimezoneOffset();
	return Math.round(new Date(date).getTime()/1000)+n * 60; //先获得utc时间，然后根据本地的时区差值，计算本地时间
}

function LoadPageWithDataRange(startTimestamp,endTimestamp,type){
	// console.log("startTimestamp"+startTimestamp);
	// console.log("endTimestamp"+endTimestamp);
	let timeList = [];
	// 查找到所有分享
	let nL = document.getElementsByClassName("userContentWrapper");
	// console.log("nL"+nL.length);
	for(let nIdx = 0;nIdx < nL.length; ++ nIdx){
		let timeNode = nL[nIdx].getElementsByClassName("timestampContent");
		if (timeNode && timeNode.length > 0) {
			let time = timeNode[0].parentNode.getAttribute("data-utime");	
			// console.log("time"+time);
			if (time) {
				timeList.push(time);
			}
		}
	}
	// // 排序时间
	// timeList.sort(function(a, b) {
	//   return a - b;
	// });
	// 如果没有加载到指定的结束时间，就调用页面的继续加载接口
	if (timeList[timeList.length-1] > endTimestamp) {
		// 直接查询物理位置最后一个，这样可以避免置顶的帖子很旧的问题
		let getMorePageNode = document.getElementsByClassName("uiMorePager");
		if (getMorePageNode && getMorePageNode.length > 0) {
			getMorePageNode[0].scrollIntoView();
			dispatch(getMorePageNode[0],"click");
			// 加载下一页
			setTimeout(LoadPageWithDataRange,3000,startTimestamp,endTimestamp,type);
		}
		else{
			// console.log("no uiMorePager");
			// console.log(getMorePageNode);
			expansContent(type);
		}
	}
	else{
		// console.log(timeList);
		// console.log(endTimestamp);
		expansContent(type);
	}
}

// 导出数据的入口
// type 1 = 不展开直接导出
// type 2 = 展开全部回复导出，可能会把chrome卡死
function expansContent(type){

    var expBtn;
	// 只在2的时候查找更多分享
	if (type == 2) {
		expBtn = document.getElementsByClassName("UFIPagerLink");
	}
	else{
		expBtn = []
	}

	// 查找所有的“查看更多” 总是展开用户回复的隐藏内容
	let moreBtns = document.getElementsByClassName("fss");
	console.log("more btn:"+moreBtns.length);
    console.log("expBtn btn:"+expBtn.length);
	if ( expBtn.length <= 0 && moreBtns.length <= 0) { //true ){//
		findAllData();
	}
	else{
		for (let i = 0; i < expBtn.length;i++){
			dispatch(expBtn[i], 'click');
		}
		for (let i = 0; i < moreBtns.length; i++) {
			dispatch(moreBtns[i], 'click');
		}
		setTimeout(expansContent,1000,type);
	}
}

function expansVideoPageContent(type){
	let moreBtns = [];
	// 先把视频暂停

	let video = document.getElementsByTagName("video")[0];
	dispatch(video,'click');

	// 标签切换到评论
	let tabPL = document.getElementById("u_2_u");
	tabPL = tabPL.getElementsByTagName("span");
	for (let idx = 0 ; idx < tabPL.length; ++idx){
		// console.log(tabPL[idx]);
		// console.log(tabPL[idx].innerText);
		if (tabPL[idx].textContent.indexOf(getLangText("discuss")) >= 0) {
			// console.log("discuss");
			// console.log(tabPL[idx].parentNode);
			dispatch(tabPL[idx].parentNode,"click");
		}
	}
	video.pause();
	if (type == 1) {
		let pLinkNodes = document.getElementsByClassName("UFIPagerLink");
		// console.log("pLinkNodes"+pLinkNodes.length);
		for(let pIdx = 0;pIdx < pLinkNodes.length; ++pIdx){
			moreBtns.push(pLinkNodes[0]);
		}
		// X条回复
		let replyNodes = document.getElementsByClassName("UFIReplyList");
		// console.log("replyNodes"+replyNodes.length);


        for(let rIdx = 0; rIdx < replyNodes.length; ++rIdx){
			let linkNodes = replyNodes[rIdx].getElementsByClassName("UFICommentLink");
			for (let lIdx = 0; lIdx < linkNodes.length; ++lIdx){
				if (linkNodes[lIdx].innerText.indexOf(getLangText("hidden")) < 0) {
					// 找不到"隐藏"的才是展开
					moreBtns.push(linkNodes[lIdx]);	
				}
			}
		}
	}
	// 更多评论

	// console.log("moreBtns"+moreBtns.length);
	if (moreBtns.length >0) {
		for(let idx = 0 ; idx < moreBtns.length; ++idx){
			dispatch(moreBtns[idx], 'click');
		}

        setTimeout(expansVideoPageContent,1000,type);
	}
	else{
		// console.log("expansVideoPageContent finish");
		findAllDataInVideoContextualLayer();
	}

}
// 从内存中下载文件
function download(filename, text) {
  let element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
// 剔除回车和控制字符
function realText(text){
	return text.replace(/[\r\n]/g,"").replace(/,/g,"，");
}
// 获得数字文字
function strNum(text){
	if (text.indexOf(getLangText("wan")) > 0) {
		text = text.replace(/,/g,"");
		text = text.match(/\d+/g).map(Number);
		text = text.join('.');
		text = text + "W";
		// text = text[0]*10000+text[1]*1000;
		return [text]
	}
	return text.replace(/,/g,"");
}
// 从文字中找到数字
function realNum(text){
	// // console.log(text);
	// // console.log(text.replace(/,/g,""));
	if (text.indexOf(getLangText("wan")) > 0) {
		text = text.replace(/,/g,"");
		text = text.match(/\d+/g).map(Number);
		text = text.join('.');
		text = text + "W";
		// // console.log(text)
		// text = text[0]*10000+text[1]*1000;
		// // console.log(text);
		return [text];
	}
	// // console.log(text.replace(/,/g,"").match(/\d+/g).map(Number));
	return text.replace(/,/g,"").match(/\d+/g).map(Number);
}

// 在图片类分享页面查找数据
function findAllDataInPhotoContextualLayer(){
	// 获取所以分享的创建时间

}

// 在影片类分享页面查找数据
function findAllDataInVideoContextualLayer(){
	// console.log("findAllDataInVideoContextualLayer");
	let rootNode = document.getElementsByClassName("_5-g-");
	// console.log(rootNode);
	let resData = [];
	let keys = [
		"id",
		"类型",
		"标题",
		"内容",
		"视频链接",
		"视频时长",
		"x",
		"作者姓名",
		"发布日期",
		"发布时间",
		"分享次数",
		"播放次数",
		"总点讚",
		getLangText("zan"),
		getLangText("daxin"),
		getLangText("wa"),
		getLangText("ha"),
		getLangText("wu"),
		getLangText("nu"),
		""
	];	
	resData.push(keys);
	let index = {
		id : 0,
		type : 1,
		title:2,
		content : 3,
		videoUrl:4,
		videoTime:5,
		x:6,
		author : 7,
		date : 8,
		time : 9,
		shareTimes : 10,
		playTimes : 11,
		totleLike : 12,
		zan : 13,
		daxin : 14,
		wa : 15,
		ha : 16,
		wu : 17,
		nu : 18
	};
	if (rootNode && rootNode.length > 0) {
		let cDiv = rootNode[0].childNodes;
		// // console.log(cDiv);
		if (cDiv && cDiv.length > 1) {
			let line = new Array(keys.length);
			line[index.id] = resData.length;
			line[index.type] = "分享内容";
			// 左侧节点是视频
			let leftNode = cDiv[0];
			let video = leftNode.getElementsByTagName("video")[0];
			line[index.videoUrl] = video.getAttribute("src");
			let videoTime = leftNode.getElementsByClassName("_5qsr")[0];
			line[index.videoTime] = sec2time(realNum(videoTime.getAttribute("playbackdurationtimestamp"))[0]);
			// 右侧节点是回复和分享原文
			let rightNode = cDiv[1];
			// 查找分享正文
			rightNode = rightNode.getElementsByClassName("collapsible_comments");
			// // console.log(leftNode);
			if (rightNode.length > 0) {
				rightNode = rightNode[0];
				// 发布时间
				let timeNode = rightNode.getElementsByClassName("timestamp")[0];
				let time = timeNode.getAttribute("title");
				time = time.split(' ');
				line[index.date] = time[0];
				line[index.time] = time[1];

				headNode = rightNode.getElementsByClassName("_1rgv");
				// console.log(headNode);
				if (headNode && headNode.length > 0) {
					// 查找标题
					titleNode = headNode[0].getElementsByClassName("_1rgw");
					// console.log("titleNode"+titleNode.length);
					if (titleNode && titleNode.length > 0) {
						let titleStr = titleNode[0].innerText;
						// console.log("titleStr"+titleStr);
						line[index.title] = realText(titleStr);
					}
					// 查找内容
					contentNode = headNode[0].getElementsByClassName("_1rg-");
					// console.log("contentNode"+contentNode.length);
					if (contentNode && contentNode.length > 0) {
						let contentStr = contentNode[0].innerText;
						// console.log("contentStr"+contentStr);
						line[index.content] =  realText(contentStr);
					}
				}
				// 统计数据
				let statisticsNode = rightNode.getElementsByClassName("_6599");
				if (statisticsNode && statisticsNode.length > 0) {
					let shareAndPlay = statisticsNode[0].getElementsByClassName("_ipo");
					if (shareAndPlay && shareAndPlay.length > 0) {
						let cNode = shareAndPlay[0].childNodes;
						for (let cnIdx = 0; cnIdx < cNode.length; ++cnIdx){
							let text = cNode[cnIdx].innerText;
							if (text.indexOf(getLangText("shareTimes")) >= 0) {
								line[index.shareTimes] = realNum(text)[0];
							}
							else if(text.indexOf(getLangText("playTimes")) >= 0){
								line[index.playTimes] = realNum(text)[0];
							}
						}
					}
					let likeAndZan = statisticsNode[0].getElementsByClassName("_ipp");
					// console.log(likeAndZan);
					if (likeAndZan && likeAndZan.length > 0) {
						let cNode = likeAndZan[0].childNodes[0].childNodes;
						// console.log(cNode);
						for(let cnIdx = 0; cnIdx < cNode.length; ++cnIdx){
							// console.log("cNode[cnIdx].nodeName:"+cNode[cnIdx].nodeName);
							if (cNode[cnIdx].nodeName == "SPAN") {
								// 计算前三种心情
								let cLNode = cNode[cnIdx].childNodes;
								// console.log(cLNode);
								if (cLNode) {

									for(let clIdx = 0; clIdx < cLNode.length; ++clIdx){
										let text = cLNode[clIdx].getAttribute("aria-label");
										if (text.indexOf(getLangText("zan")) >= 0) {
											line[index.zan] = realNum(text)[0];
										}
										else if (text.indexOf(getLangText("daxin")) >= 0){
											line[index.daxin] = realNum(text)[0];
										}
										else if (text.indexOf(getLangText("wa")) >= 0){
											line[index.wa] = realNum(text)[0];
										}
										else if (text.indexOf(getLangText("ha")) >= 0){
											line[index.ha] = realNum(text)[0];
										}
										else if (text.indexOf(getLangText("wu")) >= 0){
											line[index.wu] = realNum(text)[0];
										}
										else if (text.indexOf(getLangText("nu")) >= 0){
											line[index.nu] = realNum(text)[0];
										}
									}
								}
							}
							else if(cNode[cnIdx].nodeName == "A"){
								// 总赞
								line[index.totleLike] = realNum(cNode[cnIdx].innerText)[0];
							}
						}
					}
				}
				resData.push(line);
				// console.log("title");
				// console.log(resData);
				// 评论
				let discussList = document.getElementsByClassName("UFIList")[0]
					.getElementsByClassName("_j6a")[0].childNodes[0].childNodes;
				// console.log(document.getElementsByClassName("UFIList").length);
				// console.log(document.getElementsByClassName("UFIList")[0]
				// 	.getElementsByClassName("_j6a").length);

				// console.log(document.getElementsByClassName("UFIList")[0]
				// 	.getElementsByClassName("_j6a")[0].childNodes.length);

				// console.log(document.getElementsByClassName("UFIList")[0]
				// 	.getElementsByClassName("_j6a")[0].childNodes[0].childNodes.length);

				for(let discussIdx = 0; discussIdx < discussList.length; ++discussIdx){

					let line = new Array(keys.length);
					line[index.id] = resData.length;
					// 一级评论
					if (discussList[discussIdx].classList.contains("UFIComment")) {
						line[index.type] = "一级评论"
						// 文字评论
						let  UFICommentActorAndBody = discussList[discussIdx]
							.getElementsByClassName("UFICommentActorAndBody");
							// console.log("UFICommentActorAndBody");
							// console.log(UFICommentActorAndBody);
						if ( UFICommentActorAndBody &&  UFICommentActorAndBody.length > 0) {
							 UFICommentActorAndBody =  UFICommentActorAndBody[0];
							 let c =  UFICommentActorAndBody.childNodes;
							 if (c && c.length > 1) {
							 	line[index.author] = realText(c[0].textContent);
							 	// console.log(c[1].nodeName);
							 	if (c[1].nodeName == "#text") {
							 		line[index.content] = realText(c[2].textContent);
							 	}
							 	else{
							 		line[index.content] = realText(c[1].textContent);
							 	}
							 }
						}
						// 图片评论
						// 视频评论
						// 点赞
						let likeAndZan = discussList[discussIdx]
							.getElementsByClassName("UFICommentReactionsBling")[0];
						if ( likeAndZan && likeAndZan.childNodes && likeAndZan.childNodes.length > 1) {
							let eachZan = likeAndZan.childNodes[0];
							if (eachZan && eachZan.childNodes) {

								for(let ezIdx = 0; ezIdx < eachZan.childNodes.length; ++ezIdx){
									let text = eachZan.childNodes[ezIdx].getAttribute("aria-label");
									if (text.indexOf(getLangText("zan")) >= 0) {
										line[index.zan] = realNum(text)[0];
									}
									else if (text.indexOf(getLangText("daxin")) >= 0){
										line[index.daxin] = realNum(text)[0];
									}
									else if (text.indexOf(getLangText("wa")) >= 0){
										line[index.wa] = realNum(text)[0];
									}
									else if (text.indexOf(getLangText("ha")) >= 0){
										line[index.ha] = realNum(text)[0];
									}
									else if (text.indexOf(getLangText("wu")) >= 0){
										line[index.wu] = realNum(text)[0];
									}
									else if (text.indexOf(getLangText("nu")) >= 0){
										line[index.nu] = realNum(text)[0];
									}
								}
							}
							let totleLike = likeAndZan.childNodes[1];
							// // console.log("totleLike.innerText"+totleLike.textContent);
							line[index.totleLike] = realNum(totleLike.textContent)[0];
						}
						else{
							line[index.totleLike] = 0;
						}
						// 恢复时间
						let timeNode =  discussList[discussIdx]
							.getElementsByClassName("livetimestamp")[0];
						let time = timeNode.getAttribute("title");
						time = time.split(' ');
						line[index.date] = time[0];
						line[index.time] = time[1];
						// console.log(line);
						resData.push(line);
					}
					// 二级评论
					else if (discussList[discussIdx].classList.contains("UFIReplyList"))
					{
						// 找到全部的二级回复结构
						let  UFINode = discussList[discussIdx]
							.getElementsByClassName("UFICommentContentBlock");
						for ( let stIdx = 0; stIdx < UFINode.length; ++stIdx ){
							let line = new Array(keys.length);
							line[index.id] = resData.length;
							line[index.type] = "二级评论";
							// 回复内容
							// 文字评论
							let contentNode = UFINode[stIdx]
								.getElementsByClassName("UFICommentActorAndBody")[0];

							if (contentNode && contentNode.childNodes) {

								let c =  contentNode.childNodes;
								if (c && c.length > 1) {
								 	line[index.author] = realText(c[0].textContent);
								 	// console.log(c[1].nodeName);
								 	if (c[1].nodeName == "#text") {
								 		line[index.content] = realText(c[2].textContent);
								 	}
								 	else{
								 		line[index.content] = realText(c[1].textContent);
								 	}
								}	
							}
							// 图片评论
							// 赞
							let likeAndZan = UFINode[stIdx]
								.getElementsByClassName("UFICommentReactionsBling")[0];
							if (likeAndZan && likeAndZan.childNodesc && likeAndZan.childNodes.length > 1) {
								let eachZan = likeAndZan.childNodes[0];
								if (eachZan && eachZan.childNodes) {

									for(let ezIdx = 0; ezIdx < eachZan.childNodes.length; ++ezIdx){
										let text = eachZan.childNodes[ezIdx].getAttribute("aria-label");
										if (text.indexOf(getLangText("zan")) >= 0) {
											line[index.zan] = realNum(text)[0];
										}
										else if (text.indexOf(getLangText("daxin")) >= 0){
											line[index.daxin] = realNum(text)[0];
										}
										else if (text.indexOf(getLangText("wa")) >= 0){
											line[index.wa] = realNum(text)[0];
										}
										else if (text.indexOf(getLangText("ha")) >= 0){
											line[index.ha] = realNum(text)[0];
										}
										else if (text.indexOf(getLangText("wu")) >= 0){
											line[index.wu] = realNum(text)[0];
										}
										else if (text.indexOf(getLangText("nu")) >= 0){
											line[index.nu] = realNum(text)[0];
										}
									}
								}
								let totleLike = likeAndZan.childNodes[1];
								// // console.log("totleLike.innerText"+totleLike.textContent);
								line[index.totleLike] = realNum(totleLike.textContent)[0];
							}
							else{
								line[index.totleLike] = 0;
							}
							// 回复时间
							let timeNode = UFINode[stIdx].getElementsByClassName("livetimestamp")[0];
							let time = realText(timeNode.getAttribute("title"));
							time = time.split(' ');
							line[index.date] = time[0];
							line[index.time] = time[1];
							resData.push(line);
						}
					}
				}
				// 
			}

		}
	}
	// console.log(resData);
	exportCVSFile(resData);
}

function findAllData()
{
	let nL = document.getElementsByClassName("userContentWrapper");
	let resData = [];
	let keys = [
		"id",
		"类型",
		"内容",
		"作者姓名",
		"发布日期",
		"发布时间",
		"分享次数",
		"总点讚",
		getLangText("zan"),
		getLangText("daxin"),
		getLangText("wa"),
		getLangText("ha"),
		getLangText("wu"),
		getLangText("nu"),
		"",
		""
	];
	resData.push(keys);
	let index = {
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
	let data = "";
	let pIdx = 1;
	for (let i = 0; i < nL.length; i++) {
		// console.log("nl:"+i+":"+nL.length);
		let line = new Array(keys.length);
		line[index.id] = pIdx;
		pIdx++;
		// 分享的内容
		let cN = nL[i].getElementsByClassName("userContent")
		let title = "";
		for (let j = 0; j < cN.length; j++) {
			let pN = cN[j].getElementsByTagName("p");
			for (let k = 0; k < pN.length; k++) {
				// // console.log(pN[k].textContent);
				let cNS = pN[k].childNodes;
				let text = "";
				for(let l = 0; l < cNS.length; l++){
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
						// console.log(i+""+j+""+k+""+l+":");
						// console.log(cNS[l]);
					}
				}
				// data += "title,"+realText(text)+",\n";
				title += realText(text);

			}
			// // console.log("pN"+pN.length);
		}
		line[index.type]="分享内容";
		line[index.content] = title;
		// // console.log("cN"+cN.length);
		// 发布时间
		let timeNode = nL[i].getElementsByClassName("timestampContent");
		if (timeNode && timeNode.length > 0) {
			let time = timeNode[0].parentNode.getAttribute("title");	
			time = time.split(" ");
			line[index.date] = time[0];
			line[index.time] = time[1];
		}
		//data += ",timestamp,"+timeNode[0].getAttribute("title")+"\n";
		
		// 分享的次数
		let sN = nL[i].getElementsByClassName("UFIShareLink");
		// data += ",shareTimes,"+sN[0].textContent+"\n";
		if (sN && sN.length > 0) {
			line[index.shareTimes] = realNum(sN[0].textContent);	
		}
		
		// // console.log(sN[0]);
		// 用户名称
		// let actorName = nL[i].getElementsByClassName("UFICommentActorName");
		// if (actorName && actorName.length > 0) {
		// 	let acName = "";
		// 	for(let acNIdx = 0; acNIdx < actorName.length; ++ acNIdx){
		// 		acName = actorName[acNIdx].textContent;
		// 	}
		// }
		// line[index.author] = acName;
		// 点赞次数
		let zanN = nL[i].getElementsByClassName("UFILikeSentence");
		if (zanN && zanN.length > 0) {

			let azanN = zanN[0].getElementsByTagName("a");
			let totleLike = 0;
			for(let z = 0; z < azanN.length; ++z){
				let zanData = azanN[z].getAttribute("aria-label");
				if (zanData) {
					// 从赞遍历到
					for(let idx = index.like; idx < index.angry; ++idx){
						// 匹配到第一个点赞类型
						if (zanData.indexOf(keys[idx]) >= 0) {
							// // console.log(zanData);
							let numLike = realNum(zanData);
							// // console.log(numLike);
							if (numLike && numLike.length >0) {
								totleLike += numLike[0];
								line[idx] = "" + numLike[0];
								break;
							}
							// // console.log(totleLike);
							// // console.log(line[idx]);
							// // console.log(keys[idx]);
						}
					}
					//data += ",zan,"+azanN[z].getAttribute("aria-label")+"\n";
				}
			}
			// 获取总赞
			let tZanNode = zanN[0].getElementsByTagName("span");
			for(let zIdx = 0; zIdx < tZanNode.length; ++zIdx){
				if (tZanNode[zIdx].getAttribute("data-hover") == "tooltip") {
					let tData = tZanNode[zIdx].innerText;
					if (tData.indexOf(getLangText("youAndOthers")) >= 0 || strNum(tData) == realNum(tData)[0]) {
						line[index.totleLike] = realNum(tData);
					}
				}
			}
		}
		// line[index.totleLike] = totleLike;
		resData.push(line);
		// 遍历一级分享和二级分享集合
		if ( nL[i].getElementsByClassName("UFIList") &&  nL[i].getElementsByClassName("UFIList").length > 0) {
			let fLCN = nL[i].getElementsByClassName("UFIList")[0].childNodes;
			// console.log("fLCN.lenght"+fLCN.length);
			for(let z = 0; z < fLCN.length; ++z){
				if (fLCN[z].nodeName == "DIV") {
					if (fLCN[z].childNodes.length == 1 && fLCN[z].childNodes[0].classList.length == 0) {
						// console.log("found fLCN");
						fLCN = fLCN[z].childNodes[0].childNodes;
						break;
					}
				}
			}
			// console.log("fLCN.lenght"+fLCN.length);
			for(let j = 0;j < fLCN.length; ++j){
				// console.log(j+fLCN[j].classList);
				if (fLCN[j].classList.contains("UFIComment")) {
					let bB = fLCN[j].getElementsByClassName("UFICommentBody");
					// console.log("xx:"+bB.length);
					line = new Array(keys.length);
					line[index.id] = pIdx;
					pIdx++;
					// 分享的文字内容
					// // console.log(bB[j].innerHTML);
					// 只会有一个内容
					let bCN = bB[0].childNodes;
					let text = "";
					// // console.log("text##");
					for(let l = 0;l < bCN.length; l++){
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
							// console.log(i+""+j+""+k+""+l+":");
							// console.log(bCN[l]);
						}
					}
					line[index.content] = realText(text);
					// data += ",text,"+realText(text)+",";
					// console.log(data);
					// 获得评论的时间
					let timeNode = fLCN[j].getElementsByClassName("UFISutroCommentTimestamp");
					// data += timeNode[0].getAttribute("title")+",";
					let time = timeNode[0].getAttribute("title");
					time = time.split(" ");
					line[index.date] = time[0];
					line[index.time] = time[1];
					// 获得点赞数
					let zanN = fLCN[j].getElementsByClassName("UFICommentReactionsBling");
					let totleLike = 0;
					if(zanN && zanN.length >0){
						let azanN = zanN[0].getElementsByTagName("span");
						for(let z = 0; z < azanN.length; ++z){
							let zanData = azanN[z].getAttribute("aria-label");
							if (zanData) {
								// 从赞遍历到
								for(let idx = index.like; idx < index.angry; ++idx){
									// 匹配到第一个点赞类型
									if (zanData.indexOf(keys[idx]) >= 0) {
										let numLike = realNum(zanData);
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
						let tZanNode = zanN[0].getElementsByClassName("UFICommentLikeButton");
						for(let zIdx = 0; zIdx < tZanNode.length; ++zIdx){
							// if (tZanNode[zIdx].getAttribute("data-hover") == "tooltip") {
							let tData = tZanNode[zIdx].innerText;
							if (tData.indexOf(getLangText("youAndOthers")) >= 0 || strNum(tData) == realNum(tData)[0]) {
								line[index.totleLike] = realNum(tData);
							}
							// }
						}
					}
					line[index.type] = "一级回复";
					// line[index.totleLike] = totleLike;
					resData.push(line);
					// data += "\n";
					// // console.log(data);
				}
				else if(fLCN[j].classList.contains("UFIReplyList")){
					// console.log("二级回复");
					let rN = fLCN[j].getElementsByClassName("UFICommentContentBlock");
					for(let k = 0;k < rN.length; ++k){
						// 获得回复内容
						line = new Array(keys.length);
						line[index.id] = pIdx;
						pIdx++;
						let bB = rN[k].getElementsByClassName("UFICommentBody");
						let bCN = bB[0].childNodes;
						let text = "";
						// // console.log("text##");
						for(let l = 0;l < bCN.length; l++){
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
								// console.log(i+""+j+""+k+""+l+":");
								// console.log(bCN[l]);
							}
						}
						// data += ",,reply,"+realText(text)+",";
						line[index.type] = "二级回复";
						line[index.content] = realText(text);
						// 获得时间
						let timeNode = rN[k].getElementsByClassName("UFISutroCommentTimestamp");
						if (timeNode.length > 0) {
							// data += timeNode[0].getAttribute("title")+",";	
							let time = timeNode[0].getAttribute("title");
							time = time.split(" ");
							line[index.date] = time[0];
							line[index.time] = time[1];
						}
						// 获得点赞
						let zanN = rN[k].getElementsByClassName("UFICommentReactionsBling");
						let totleLike = 0;
						if(zanN && zanN.length >0){
							let azanN = zanN[0].getElementsByTagName("span");
							for(let z = 0; z < azanN.length; ++z){
								let zanData = azanN[z].getAttribute("aria-label");
								if (zanData) {

									// 从赞遍历到
									for(let idx = index.like; idx < index.angry; ++idx){
										// 匹配到第一个点赞类型
										if (zanData.indexOf(keys[idx]) >= 0) {
											let numLike = realNum(zanData);
											if (numLike && numLike.length >0) {
												totleLike += numLike[0];
												line[idx] = "" + numLike[0];
												break;
											}
										}
									}	
								}
							}
							let tZanNode = zanN[0].getElementsByClassName("UFICommentLikeButton");
							for(let zIdx = 0; zIdx < tZanNode.length; ++zIdx){
								// if (tZanNode[zIdx].getAttribute("data-hover") == "tooltip") {
								let tData = tZanNode[zIdx].innerText;
								if (tData.indexOf(getLangText("youAndOthers")) >= 0 || strNum(tData) == realNum(tData)[0]) {
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
	// // console.log("##data:");
	// // console.log(data);
	// // console.log("######");
    exportCVSFile(resData);
	// let d = new Date();
	// let fileName = "FBData_"+d.toLocaleTimeString()+".csv";
	// let cvsData = "";
	// for(let i = 0; i < resData.length; ++i){
	// 	if (resData[i]) {
    //
	// 		for (let j = 0; j < resData[i].length; ++j){
	// 			if (resData[i][j]) {
	// 				cvsData += resData[i][j]+",";
	// 			}
	// 			else{
	// 				cvsData += ",";
	// 			}
	// 		}
	// 	}
	// 	cvsData += "\n";
	// }
	// download(fileName,cvsData);
	// exportExcel(resData,"FBData_"+d.toLocaleTimeString()+".xlsx")
}

function exportCVSFile(resData){
	let options = {
	    weekday: "long", year: "numeric", month: "short",
	    day: "numeric", hour: "2-digit", minute: "2-digit"
	};
	let d = new Date();
	let fileName = "FBData_"+d.toLocaleTimeString("ch-CN",options)+".csv";
	let cvsData = "";
	for(let i = 0; i < resData.length; ++i){
		if (resData[i]) {

			for (let j = 0; j < resData[i].length; ++j){
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
}

function exportExcel(data,filename){
	let msg = {
		data:data,
		filename:filename
	};
	// window.postMessage({cmd: 'exportExcel', data: msg}, '*');

	// // console.log(document.body);
	// // console.log(XLSX);
	// // console.log(XLSX.utils);
	// let wb = XLSX.utils.book_new();
	// let ws = XLSX.utils.aoa_to_sheet(data);
	// XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
	// XLSX.writeFile(wb, filename);
}


function testSendMessage(){
	window.postMessage({cmd:"exportExcel",date:"hellow"},'*');
}
