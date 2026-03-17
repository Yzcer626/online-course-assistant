console.log("🎬 视频模块已挂载");

const VideoWorker = {
    isFinished: false,
    checkInterval: null,
    
    play: function(speed = 2.0) {
        if (this.isFinished) return;
        
        const video = document.querySelector('video') || document.querySelector('.vjs-tech');
        
        if (!video) {
            console.log("⏳ 视频元素还在加载中，1秒后重试...");
            setTimeout(() => this.play(speed), 1000);
            return;
        }

        if (!video.dataset.binded) {
            video.dataset.binded = "true";
            
            video.addEventListener('ended', () => {
                console.log("🏁 视频播放完毕！");
                this.isFinished = true;
                this.clearCheckInterval();
                window.parent.postMessage({ action: "TASK_FINISHED", type: "video" }, '*');
            });
            
            video.addEventListener('pause', () => {
                if (!video.ended && !this.isFinished) {
                    setTimeout(() => video.play(), 500);
                }
            });
            
            video.addEventListener('error', (e) => {
                console.log("❌ 视频播放错误:", e);
                this.clearCheckInterval();
            });
        }

        video.muted = true;
        video.playbackRate = speed;
        
        if (video.paused && !video.ended) {
            video.play().catch(e => console.log("播放被拦截", e));
        }
        
        this.startCheckInterval(video);
    },
    
    startCheckInterval: function(video) {
        this.clearCheckInterval();
        
        this.checkInterval = setInterval(() => {
            if (this.isFinished) {
                this.clearCheckInterval();
                return;
            }
            
            if (!video.paused && !video.ended) {
                const currentTime = video.currentTime;
                const duration = video.duration;
                
                if (this.lastTime === currentTime && Date.now() - this.lastTimeCheck > 5000) {
                    console.log("⚠️ 视频播放卡住，重新播放");
                    video.currentTime = 0;
                    video.play();
                }
                
                this.lastTime = currentTime;
                this.lastTimeCheck = Date.now();
                
                if (duration && currentTime >= duration - 1) {
                    console.log("🏁 视频即将播放完毕");
                    this.isFinished = true;
                    this.clearCheckInterval();
                    window.parent.postMessage({ action: "TASK_FINISHED", type: "video" }, '*');
                }
            }
        }, 1000);
        
        this.lastTime = video.currentTime;
        this.lastTimeCheck = Date.now();
    },
    
    clearCheckInterval: function() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    },
    
    getVideoStatus: function() {
        const video = document.querySelector('video') || document.querySelector('.vjs-tech');
        if (!video) {
            return { status: 'not_found' };
        }
        
        return {
            status: video.paused ? 'paused' : 'playing',
            currentTime: video.currentTime,
            duration: video.duration,
            playbackRate: video.playbackRate,
            muted: video.muted,
            ended: video.ended
        };
    }
};

window.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'START_VIDEO') {
        VideoWorker.play(event.data.speed || 2.0);
    } else if (event.data && event.data.action === 'GET_VIDEO_STATUS') {
        const status = VideoWorker.getVideoStatus();
        window.parent.postMessage({ action: 'VIDEO_STATUS_RESPONSE', status: status }, '*');
    } else if (event.data && event.data.action === 'STOP_VIDEO') {
        VideoWorker.clearCheckInterval();
        VideoWorker.isFinished = true;
    }
});