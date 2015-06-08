(function(){
	var main=document.getElementById('main');
	var audio=document.getElementById('audio');
	var windowH=window.innerHeight;
	var windowW=window.innerWidth;
	var bufferTimer = null;
	var volumeTimer = null;
	var lyricTimer = null;
	var musicIndex = 0;
	var musicMode = 'list';
	var lyric;
	var lyricTimer;
	
	//============================================绑定事件
	
	//播放/暂停
	document.getElementById('play').onclick=function(){toPlay('play');};
	
	//上一首
	document.getElementById('prev').onclick=function(){toPlay('prev');};
	
	//下一首
	document.getElementById('next').onclick=function(){toPlay('next');};
	
	//调整播放时间
	document.getElementById('progress_bar').onclick=function(ev){adjustPorgress(this,ev);};
	
	//单曲循环模式
	document.getElementById('repeat').onclick=function(){
		circulation(this,'repeat');
	};
	
	//随机循环模式
	document.getElementById('shuffle').onclick=function(){
		circulation(this,'shuffle');
	};
	
	//列表循环模式
	document.getElementById('list').onclick=function(){
		circulation(this,'list');
	};
	
	//判断鼠标是否按下
	var mouse=false;
	document.getElementById('volume_bar').onmousedown=function(ev){
		adjustVolume(this,ev);
		mouse=true;
	};
	window.onmouseup=function(){
		mouse=false;
	};
	
	//调整音量
	window.onmousemove=function(ev){
		if(mouse){
			adjustVolume(document.getElementById('volume_bar'),ev);
		}
	};
	
	//===============================================设置循环模式
	function circulation(dom,type){
		musicMode = type;
		var c=document.getElementsByName('circulation');
		for(var i=0,len=c.length;i<len;i++){
			if(c[i]==dom){
				c[i].className= 'active';
			}else{
				c[i].className= '';
			}
		}
	}
	
	//===============================================初始化播放器
	initPlayer(musicIndex);
	audio.volume = 0.8;
	audio.addEventListener('canplay',bufferBar,false);
	
	function initPlayer(index){
		//音乐路径
		audio.setAttribute('src',musicSource[index].music_url);
		//歌手
		document.getElementById('artist_name').innerHTML = musicSource[index].artist_name;
		//头像
		var img_url=musicSource[index].head_url;
		document.getElementById('bg').setAttribute('src',img_url);
		document.getElementById('pic').setAttribute('style','background-image: url('+img_url+');');
		//歌名
		document.getElementById('music_name').innerHTML = musicSource[index].music_name;
		//专辑
//		$('.music_album').innerHTML = playList[index].musicAlbum;
		//进度条
		document.getElementById('loading').style.width = 0 +'px';
		//缓冲进度条
		audio.removeEventListener('canplay',bufferBar,false);
		clearInterval(bufferTimer);
		document.getElementById('buffer').style.width = 0 +'px';
		//歌词
		var lyric_url=musicSource[index].lyric_url;
		
    	$('#lyric').css('margin-top','-50px');//复原歌词位置
		if(lyric_url){
			postLyric(lyric_url);
		}else{
    		document.getElementById("lyric").innerHTML = '<li class="active">未找到歌词</li>';
    	}
	}
	
	//============================================显示剩余时间 和 播放进度条
	audio.addEventListener('timeupdate',function(){
	    if (!isNaN(audio.duration)) {
	        //剩余时间
	        var time = audio.currentTime;
	        document.getElementById('time').innerHTML = formartTime(time)+'&nbsp;/&nbsp;'+ formartTime(audio.duration);
	 
	        //播放进度条
	        var progressValue = audio.currentTime/audio.duration*windowW;
	        document.getElementById('loading').style.width = parseInt(progressValue)+5 + 'px';
	    };
	},false);
	
	//============================================播放
	function toPlay(action){
		if (action == 'play') {
			if(audio.paused){
				audio.play();
				document.getElementById('play').innerHTML='&#xe605;';
			}else{
				audio.pause();
				document.getElementById('play').innerHTML='&#xe608;';
			}
		}
		if (action == 'prev') {
			playMusicMode(action);
		}
		if (action == 'next') {
			playMusicMode(action);
		};
	}toPlay('play');
	
	//============================================播放结束后播放下一曲
	audio.addEventListener('ended',function(){
		document.getElementById('play').innerHTML='&#xe608;';
		playMusicMode('ended');
	},false);
	
	//============================================显示缓冲进度条
	function bufferBar(){
        bufferTimer = setInterval(function(){
            var bufferIndex = audio.buffered.length;
            if (bufferIndex > 0 && audio.buffered != undefined) {
                var bufferValue = audio.buffered.end(bufferIndex-1)/audio.duration*windowW;
                document.getElementById('buffer').style.width = parseInt(bufferValue)+'px';
 
                if (Math.abs(audio.duration - audio.buffered.end(bufferIndex-1)) <1) {
                    document.getElementById('buffer').style.width = windowW+'px';
                    clearInterval(bufferTimer);
                };
            };
        },1000);
    }
	
	//============================================调整播放进度条改变播放时间
	function adjustPorgress(dom,ev){
        var event = window.event || ev;
        var progressX = (event.clientX - dom.getBoundingClientRect().left).toFixed(0);
        audio.currentTime = parseInt(progressX/windowW*audio.duration);
    }
	
	//============================================调整音量条
	function adjustVolume(dom,ev){
        var event = window.event || ev;
        var volumeX = (event.clientX - dom.getBoundingClientRect().left).toFixed(0);
        volumeX=volumeX<0?0:volumeX;
        volumeX=volumeX>100?100:volumeX;
        audio.volume = volumeX/100;
        document.getElementById('volume_now').style.width = volumeX + 'px';
		document.getElementById('volume_num').innerHTML = volumeX + '%';
    };
    
    //============================================获取歌词
    function postLyric(url){
    	lyric='';
    	document.getElementById("lyric").innerHTML = '<li class="active">正在加载歌词......</li>';
		lyric=$.ajax({
    		url:url,
    		async:false
    	});
    	if(lyric){
    		lyric=analysisLRC(lyric);
	    	console.log(lyric); 
	    	var lyricHtml='';
	    	for(var i=0,l=lyric.length;i<l;i++){
	    		lyric[i][1]=lyric[i][1]==''?'&nbsp':lyric[i][1];
	    		if(i==0){
	    			lyricHtml+='<li data-timeline='+lyric[i][0]+' class="active">'+lyric[i][1]+'</li>'
	    		}else{
	    			lyricHtml+='<li data-timeline='+lyric[i][0]+'>'+lyric[i][1]+'</li>'
	    		}
	    	}
	    	document.getElementById("lyric").style.marginTop = '-50px';
	    	document.getElementById("lyric").innerHTML = lyricHtml;
	    	updataLyric();
    	}else{
    		document.getElementById("lyric").innerHTML = '<li class="active">未找到歌词</li>';
    	}
    }
    
    //============================================滚动歌词
    function updataLyric(){
    	var lrcBox = document.getElementById("lyric"),
        domList = lrcBox.getElementsByTagName("li"),
        lyricIndex,
        dataTimeLine,
        m = parseInt(lrcBox.style.marginTop.split("-")[1]) || 0;
    	
    	clearInterval(lyricTimer);
    	lyricTimer=setInterval(function(){
    		//歌曲播放完后，就停止滚动
    		if(audio.ended){
    			clearInterval(lyricTimer);
    			return;
    		}
    		for(var i=domList.length-1,len=0;i>=len;i--){
    			dataTimeLine = parseFloat(domList[i].attributes["data-timeLine"].nodeValue);
    			if(parseFloat(audio.currentTime).toFixed(1)>=dataTimeLine){
    				lyricRoll(i);
    				break;
    			}
    		}
    	},10);
    	
    	function lyricRoll(lyricCurrentIndex){
    		//当前下标值和上次记录的下标值不同才滚动，一个下标值只滚动一次
            if(lyricIndex != lyricCurrentIndex){
                //记录下标值
                lyricIndex = lyricCurrentIndex;
                //歌词颜色变化
                for(var j=0,jlen=domList.length;j<jlen;j++){
                	if(j==lyricCurrentIndex){
                		domList[j].className='active';
                	}else{
                		domList[j].className='';
                	}
                }

                //歌词滚动
                $('#lyric').animate({'margin-top':-lyricIndex * 30-50},300);
            }
    	}
    }
    
	//============================================根据播放模式计算歌曲索引
	function playMusicMode(action){
		var musicNum = musicSource.length-1;
		var index = musicIndex;

		//列表循环
		if (musicMode == 'list' ) {
			if (action == 'prev') {
				if (index == 0) { //如果是第一首歌，跳到最后一首
					index = musicNum;
				}
				else{
					index--;
				}
			}
			else if (action == 'next' || action == 'ended') {
				if (index == musicNum) {//如果是最后一首歌，跳到第一首
					index = 0;
				}
				else{
					index++;
				}
			};
		};

		//随机播放
		if (musicMode == 'shuffle') {
			var randomIndex = parseInt((musicNum+1) * Math.random());
			index = randomIndex;
			if (index == musicIndex) {//下一首和当前相同，跳到下一首
				index++;
			};
		};

		//单曲循环
		if (musicMode == 'repeat') {
			if (action == 'prev') {
				if (index == 0) { //如果是第一首歌，跳到最后一首
					index = musicNum;
				}
				else{
					index--;
				}
			}
			else if (action == 'next') {
				if (index == musicNum) {//如果是最后一首歌，跳到第一首
					index = 0;
				}
				else{
					index++;
				}
			}else{
				//if ended 如果是播放结束自动跳转，不做操作
			}
		};

		musicIndex = index;
		playIndex(index);
	}
    
	//============================================更新歌曲播放索引，重新加载歌曲，并播放
	function playIndex(index){
    	clearInterval(lyricTimer);
		initPlayer(index);
		audio.load();
		audio.addEventListener('canplay',bufferBar,false);
		toPlay('play');
	}
    
    //============================================时间转换，将秒数转换分秒形式
    function formartTime(time){
		var timeMin = parseInt(time/60);
        var timeSecond = parseInt(time%60);
        if (timeSecond < 10 ) {
            timeSecond = '0'+timeSecond;
        };
	    return timeMin + ':' + timeSecond;
    }
    
    //============================================时间转换，将秒数转换分秒形式
    function formartSecond(time){
    	time=time.split(':');
        var timeSecond = parseFloat(time[0])*60+parseFloat(time[1]);
	    return timeSecond.toFixed(1);
    }
	
	//============================================自动调整布局
	function auto_layout(){
		windowH=window.innerHeight;
		windowW=window.innerWidth;
		main.style.height=windowH+'px';
	}auto_layout();
	
	//============================================浏览器大小改变时自动调整布局
	window.onresize = function () {auto_layout();}
	
})();
