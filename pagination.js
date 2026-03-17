const Pagination = {
    findNextButton: function() {
        const selectors = [
            "#prevNextFocusNext",
            ".jb_btn.jb_btn_92.fs14.next",
            ".next",
            "a#next",
            ".prev_next.next",
            ".nodeItem.r",
            ".nextChapter",
            ".prev_next.next"
        ];

        let btn = null;
        for (let sel of selectors) {
            btn = document.querySelector(sel);
            if (btn && btn.offsetParent !== null) {
                return btn;
            }
        }

        const candidates = document.querySelectorAll("a, span, div, li, button");
        
        for (let el of candidates) {
            if (el.offsetParent === null) continue;
            
            const text = (el.innerText || "").trim();
            if (text === "下一章" || text === "下一节" || text === "Next" || 
                (text.includes("下一章") && text.length < 10) ||
                (text.includes("下一节") && text.length < 10)) {
                return el;
            }
        }

        return null;
    },
    
    next: function() {
        const nextBtn = this.findNextButton();
        if (nextBtn) {
            console.log(">>> [翻页] 点击下一节按钮");
            nextBtn.click();
            
            setTimeout(() => {
                const confirmBtn = document.querySelector('.layui-layer-btn0, .bluebtn, .sure');
                if (confirmBtn && confirmBtn.offsetParent !== null) {
                    console.log(">>> [翻页] 检测到确认弹窗，点击确认");
                    confirmBtn.click();
                }
            }, 1000);
            
            return true;
        } else {
            console.log(">>> [翻页] 未找到下一节按钮");
            return false;
        }
    },
    
    shouldNavigate: function() {
        const unfinishedTasks = document.querySelectorAll('.ans-job-icon').length;
        const finishedTasks = document.querySelectorAll('.ans-job-finished').length;
        
        const unanswered = document.querySelectorAll(".questionLi:not(.fontLabel), .singleQuesId:not(.fontLabel)").length;
        
        return unfinishedTasks === finishedTasks && unanswered === 0;
    }
};