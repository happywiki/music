//解析lrc文档格式
function analysisLRC(lyric){
	var newLyric=[];
	lyric=lyric.responseText;
	lyric = lyric.replace(/\[\D*:.*\]/g, '');//去掉除歌词外的标签
	lyric = lyric.split('\r\n');//按行分割
	lyric.splice(0,1);
	
	for(var i=0,len=lyric.length ; i<len ; i++){
		if(!lyric[i]){
			lyric.splice(i,1);
			len=lyric.length;
		}
		lyric[i] = lyric[i].replace(/\[/g, '');//去掉'['
		lyric[i] = lyric[i].split(']');//按']'分割
		for(var j=0,jlen=lyric[i].length-1 ; j<jlen ; j++){
			newLyric[newLyric.length]=[lyric[i][j],lyric[i][jlen]];
		}
	}
	newLyric=sortTime(newLyric);
	return newLyric;
}

//将时间转换成秒并排序
function sortTime(arr){
	var t=[];
	for(var i=0,len=arr.length ; i<len ; i++){
		t=arr[i][0].split(':');//先按':'分割
		arr[i][0]=((parseFloat(t[0])*60)+parseFloat(t[1])).toFixed(2);
	}
	arr.sort(function(a,b){return a[0]-b[0];});
	return arr;
}
