// main.js - 核心大脑与调度中心 (v5.3 最终修复版)

// ==========================================
// 1. 顶层全局监听器与提示 UI
// ==========================================
if (window.self === window.top) {
    window.addEventListener('message', (e) => {
        if (e.data && e.data.action === 'SHOW_TOAST') {
            let toast = document.getElementById('cx-toast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'cx-toast';
                toast.style.cssText = 'position:fixed;top:15%;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);color:#fff;padding:12px 24px;border-radius:8px;z-index:999999999;font-size:14px;pointer-events:none;font-weight:bold;transition:opacity 0.3s;box-shadow:0 4px 10px rgba(0,0,0,0.3);';
                document.body.appendChild(toast);
            }
            toast.innerText = e.data.msg;
            toast.style.display = 'block';
            toast.style.opacity = '1';
            setTimeout(() => { if(toast.innerText === e.data.msg) toast.style.opacity = '0'; }, 3000);
        }

        if (e.data && e.data.action === 'NEXT_CHAPTER') {
            try {
                let script = document.createElement('script');
                script.textContent = "window.confirm = function(){return true;}; window.alert = function(){};";
                document.head.appendChild(script);
            } catch(err) {}

            let nextBtn = document.querySelector('.prev_next.next, .nextChapter, #prevNextFocusNext');
            if (!nextBtn) {
                const elements = document.querySelectorAll('span, a, div');
                for (let el of elements) {
                    if (el.innerText && el.innerText.trim() === '下一节' && el.offsetParent !== null) {
                        nextBtn = el; break;
                    }
                }
            }

            if (nextBtn) {
                nextBtn.click();
                let checkCount = 0;
                let checkModal = setInterval(() => {
                    checkCount++;
                    const confirmBtn = document.querySelector('.layui-layer-btn0, .bluebtn, .sure');
                    if (confirmBtn && confirmBtn.offsetParent !== null) {
                        console.log("💥 检测到拦截弹窗，已强行点击通过！");
                        confirmBtn.click();
                        clearInterval(checkModal);
                    }
                    if(checkCount > 20) clearInterval(checkModal);
                }, 500);
            } else {
                let toastEl = document.getElementById('cx-toast');
                if (toastEl) {
                    toastEl.innerText = "🛑 未找到下一节按钮，这可能是最后一章了！";
                    toastEl.style.opacity = '1';
                }
                if(typeof State !== 'undefined') State.set({ [KEYS.IS_LEARN_RUNNING]: false });
            }
        }
    });
}

function toast(msg) {
    window.top.postMessage({ action: "SHOW_TOAST", msg: msg }, '*');
}

// ==========================================
// 2. 刷课任务调度器 (TaskManager)
// ==========================================
const TaskManager = {
    isRunning: false,
    tasks: [],
    currentIndex: 0,
    globalSpeed: 2.0,

    start: function(speed) {
        this.isRunning = true;
        this.globalSpeed = speed || 2.0;
        toast("🧠 启动刷课，正在解析源码锁定任务...");
        setTimeout(() => this.scanTasks(), 2500);
    },

    stop: function() {
        this.isRunning = false;
        toast("🛑 已停止自动刷课");
    },

    scanTasks: function() {
        if (!this.isRunning) return;
        this.tasks = [];

        let unfinishedJobIds = [];
        let mArgObj = null;

        const scripts = document.querySelectorAll('script');
        for (let s of scripts) {
            let text = s.textContent;
            if (!text || !text.includes('mArg')) continue;
            
            let match = text.match(/try\s*\{\s*mArg\s*=\s*(\{[\s\S]+?\});\s*\}\s*catch/);
            if (!match) match = text.match(/mArg\s*=\s*(\{[\s\S]+?\});/);
            
            if (match) {
                try {
                    mArgObj = JSON.parse(match[1]);
                    break;
                } catch(e) {}
            }
        }

        if (mArgObj && mArgObj.attachments) {
            mArgObj.attachments.forEach(att => {
                if (att.job === true && !att.isPassed) {
                    let jid = (att.property && att.property.jobid) ? att.property.jobid : att.jobid;
                    if (jid) unfinishedJobIds.push(String(jid));
                }
            });
        }

        const iframes = document.querySelectorAll('.ans-cc iframe, iframe[module], .video-container iframe');
        
        iframes.forEach((iframe) => {
            const dataStr = iframe.getAttribute('data') || "";
            const cleanDataStr = dataStr.replace(/&quot;/g, '"');
            const moduleName = iframe.getAttribute('module') || "";
            const src = iframe.src || "";

            let taskType = 'other';
            if (moduleName.includes('video') || cleanDataStr.includes('video') || src.includes('video')) {
                taskType = 'video';
            } else if (moduleName.includes('doc') || moduleName.includes('pdf') || moduleName.includes('ppt') || cleanDataStr.includes('doc') || cleanDataStr.includes('pdf') || cleanDataStr.includes('.ppt') || cleanDataStr.includes('.pptx')) {
                taskType = 'doc';
            }

            let currentJobId = null;
            try {
                let dataObj = JSON.parse(cleanDataStr);
                let j = dataObj.jobid || dataObj.jobId || dataObj._jobid || dataObj.attachment?.jobid;
                if (j) currentJobId = String(j);
            } catch(e) {
                let match = cleanDataStr.match(/"\_?job[iI]d"\s*:\s*"([^"]+)"/);
                if (match && match[1]) currentJobId = String(match[1]);
                else {
                    match = cleanDataStr.match(/"jobid"\s*:\s*"([^"]+)"/);
                    if (match && match[1]) currentJobId = String(match[1]);
                }
            }

            let isUnfinished = false;
            if (mArgObj) {
                isUnfinished = currentJobId && unfinishedJobIds.includes(currentJobId);
            } else {
                isUnfinished = !!currentJobId;
            }

            if (taskType !== 'other' && isUnfinished) {
                if (!this.tasks.find(t => t.iframe === iframe)) {
                    this.tasks.push({ type: taskType, iframe: iframe, isJob: true });
                }
            }
        });

        if (this.tasks.length > 0) {
            toast(`📋 破壳成功！抓出 ${this.tasks.length} 个未完成任务！准备执行...`);
            this.currentIndex = 0;
            this.runNext();
        } else {
            // === 🆕 无刷课任务时，检测是否章节测验 ===
            State.get(memory => {
                if (memory[KEYS.IS_LEARN_MODE]) {
                    if (this.isQuizPage()) {
                        console.log(`⚠️ 无刷课任务，但检测到章节测验，切换到答题模式`);
                        toast(`⚠️ 检测到章节测验，切换到答题模式`);
                        this.stop();
                        State.set({
                            [KEYS.IS_LEARN_MODE]: false,
                            [KEYS.IS_ANSWERING]: true,
                            [KEYS.IS_QUIZ_MODE]: true
                        });
                        return;
                    } else {
                        toast("🈳 本页无视频任务，3秒后跳下一节...");
                        setTimeout(() => {
                            window.top.postMessage({ action: "NEXT_CHAPTER" }, '*');
                        }, 3000);
                        return;
                    }
                }
            });
        }
    },

    runNext: function() {
        if (!this.isRunning) return;

        if (this.currentIndex >= this.tasks.length) {
            toast("🎉 本页视频和PPT已全部搞定！检测是否有题目...");
            
            State.get(memory => {
                if (memory[KEYS.IS_LEARN_MODE]) {
                    // === 🆕 检测是否是章节测验页面 ===
                    if (this.isQuizPage()) {
                        console.log("📝 检测到章节测验，切换到答题模式");
                        toast("📝 检测到章节测验，切换到答题模式");
                        
                        this.stop();
                        State.set({
                            [KEYS.IS_LEARN_MODE]: false,
                            [KEYS.IS_ANSWERING]: true
                        }, () => {
                            document.querySelectorAll("[data-cx-solved]").forEach(el => {
                                el.removeAttribute("data-cx-solved");
                            });
                        });
                        return;
                    }
                    
                    // 不是测验，再检查是否有未答题
                    const unanswered = document.querySelectorAll(".questionLi:not(.fontLabel), .singleQuesId:not(.fontLabel)").length;
                    if (unanswered > 0) {
                        console.log(`📝 检测到 ${unanswered} 道未答题，切换到答题模式`);
                        toast(`📝 检测到 ${unanswered} 道题目，切换到答题模式`);
                        
                        this.stop();
                        State.set({
                            [KEYS.IS_LEARN_MODE]: false,
                            [KEYS.IS_ANSWERING]: true
                        }, () => {
                            document.querySelectorAll("[data-cx-solved]").forEach(el => {
                                el.removeAttribute("data-cx-solved");
                            });
                        });
                        return;
                    }
                    
                    // 无任务，直接翻页
                    toast("🈳 本页无任务，3秒后跳下一节...");
                    setTimeout(() => {
                        window.top.postMessage({ action: "NEXT_CHAPTER" }, '*');
                    }, 3000);
                } else {
                    // 不在刷课模式（答题完成后的翻页）
                    setTimeout(() => {
                        window.top.postMessage({ action: "NEXT_CHAPTER" }, '*');
                    }, 2000);
                }
            });
            return;
        }

        const currentTask = this.tasks[this.currentIndex];
        const typeName = currentTask.type === 'video' ? '视频' : '文档/PPT';
        toast(`🚀 正在冲锋：第 ${this.currentIndex + 1} 个任务 (${typeName})...`);

        const actionCommand = currentTask.type === 'video' ? 'START_VIDEO' : 'START_DOC';

        setTimeout(() => {
            if (this.isRunning) {
                currentTask.iframe.contentWindow.postMessage({
                    action: actionCommand,
                    speed: this.globalSpeed
                }, '*');
            }
        }, 1000);
    },

    // === 🆕 辅助函数：检测是否章节测验页面 ===
    isQuizPage: function() {
        console.log("[isQuizPage] === 开始检测 ===");
        
        // 🎯 优先检测 iframe 内的内容（学习通题目在 iframe 里）
        try {
            const iframe = document.getElementById('iframe');
            if (iframe && iframe.contentDocument) {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                
                // 1️⃣ 检查 iframe 内是否有题目容器
                const iframeQuestions = iframeDoc.querySelectorAll('.TiMu, .questionLi, .singleQuesId');
                console.log(`[isQuizPage] iframe 内题目容器: ${iframeQuestions.length}`);
                
                if (iframeQuestions.length > 0) {
                    // 2️⃣ 计算未批阅题数量
                    let unanswered = 0;
                    iframeQuestions.forEach(q => {
                        if (!q.querySelector('.fontLabel') && 
                            !q.querySelector('.marking_dui') && 
                            !q.querySelector('.marking_cuo') &&
                            q.offsetParent !== null) {
                            unanswered++;
                        }
                    });
                    
                    console.log(`[isQuizPage] iframe 内未批阅题: ${unanswered}`);
                    
                    if (unanswered > 0) {
                        // 3️⃣ 检查是否有提交按钮
                        const buttons = iframeDoc.querySelectorAll('button, input[type="submit"], a');
                        let hasSubmit = false;
                        buttons.forEach(btn => {
                            const text = (btn.innerText || btn.value || '').trim();
                            if (text.includes('提交') || text.includes('交卷') || text.includes('提交答案')) {
                                hasSubmit = true;
                                console.log(`[isQuizPage] iframe 提交按钮: "${text}"`);
                            }
                        });
                        
                        const isQuiz = hasSubmit || true; // 有未答题就认为是测验
                        console.log(`[isQuizPage] 判定: ${isQuiz ? '✅ 章节测验' : '❌ 普通页面'}`);
                        return isQuiz;
                    }
                }
            }
        } catch (e) {
            console.log("[isQuizPage] 无法访问 iframe（跨域或未加载）:", e.message);
        }
        
        // 4️⃣ 备用：主页面检测
        const mainQuestions = document.querySelectorAll('.TiMu, .questionLi, .singleQuesId');
        console.log(`[isQuizPage] 主页面题目容器: ${mainQuestions.length}`);
        
        if (mainQuestions.length > 0) {
            const unanswered = document.querySelectorAll('.questionLi:not(.fontLabel), .singleQuesId:not(.fontLabel)').length;
            if (unanswered > 0) {
                console.log(`[isQuizPage] 主页面未答题: ${unanswered}，判定为测验`);
                return true;
            }
        }
        
        // 5️⃣ URL特征
        const url = window.location.href;
        const isStudentStudy = url.includes('/mycourse/studentstudy');
        if (isStudentStudy) {
            console.log("[isQuizPage] URL是学生学习页面");
            return true;
        }
        
        console.log("[isQuizPage] 返回 false");
        return false;
        }
    };
    
    window.addEventListener('message', (event) => {
        if (event.data && event.data.action === 'TASK_FINISHED') {
            const typeName = event.data.type === 'video' ? '视频' : '文档/PPT';
            toast(`✅ ${typeName} 任务完毕！2秒后开启下一个...`);
            TaskManager.currentIndex++;
    
            if (TaskManager.isRunning) {
                setTimeout(() => TaskManager.runNext(), 2000);
            }
        }
    });
    
    window.addEventListener('load', () => {
        if (typeof State !== 'undefined') {
            State.set({
                [KEYS.IS_QUIZ_MODE]: false
            });
        }
    });

// ==========================================
// 3. 全局核心大循环 (刷课/乱选 两足鼎立)
// ==========================================
(function() {
    try {
        if (window.self === window.top) {
            if(typeof UI !== 'undefined' && UI.inject) UI.inject();
        }
    } catch (e) {}

    let isProcessingAnswer = false;

    setInterval(() => {
        if (typeof State === 'undefined') return;

        State.get((memory) => {
            
            // --- 板块 1: 智能刷课 ---
            if (memory[KEYS.IS_LEARN_MODE]) {
                if (memory[KEYS.IS_LEARN_RUNNING]) {
                    const isCourseFrame = document.querySelector('.ans-cc') !== null;
                    if (isCourseFrame && !TaskManager.isRunning) {
                        TaskManager.start(memory[KEYS.VIDEO_SPEED]);
                    }
                } else {
                    if (TaskManager.isRunning) TaskManager.stop();
                }
            }

            // --- 板块 2: 自动乱选 ---
            if (memory[KEYS.IS_ANSWERING]) {
                if (isProcessingAnswer) return;
                if (typeof Solver !== 'undefined') {
                    isProcessingAnswer = true;
                    Solver.run();
                    setTimeout(() => {
                        isProcessingAnswer = false;
                    }, 3000);
                }
            }

            // --- 板块 3: 自动模式切换（主循环检测）---
            if (memory[KEYS.IS_LEARN_MODE] && !memory[KEYS.IS_ANSWERING] && !memory[KEYS.IS_QUIZ_MODE]) {
                const unanswered = document.querySelectorAll(".questionLi:not(.fontLabel), .singleQuesId:not(.fontLabel)").length;
                const isQuiz = TaskManager.isQuizPage ? TaskManager.isQuizPage() : false;
                if ((unanswered > 0 || isQuiz) && !memory[KEYS.IS_LEARN_RUNNING]) {
                    console.log(`🔄 自动切换：刷课完成，检测到${unanswered > 0 ? ` ${unanswered} 道未答题` : ''}${isQuiz ? ' 测验页面' : ''}`);
                    State.set({
                        [KEYS.IS_LEARN_MODE]: false,
                        [KEYS.IS_ANSWERING]: true,
                        [KEYS.IS_QUIZ_MODE]: true
                    }, () => {
                        document.querySelectorAll("[data-cx-solved]").forEach(el => {
                            el.removeAttribute("data-cx-solved");
                        });
                    });
                }
            }

        });
    }, 2000);
})();