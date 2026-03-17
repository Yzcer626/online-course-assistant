// solver.js - 乱选速刷版 (v1.0)
// 核心逻辑：无脑随机选选项，快速完成题目，不管对错

const KEYS = window.KEYS || {
    IS_ANSWERING: "cx_is_answering",
    IS_LEARN_MODE: "cx_is_learn_mode",
    IS_LEARN_RUNNING: "cx_learn_run",
    VIDEO_SPEED: "cx_video_speed"
};

const Solver = {
    // 每题最多尝试次数（防无限循环）
    MAX_ATTEMPTS: 5,
    
    // 主入口
    run: function() {
        console.log("🔀 开始乱选模式...");
        
        const questions = document.querySelectorAll(".questionLi, .singleQuesId, .TiMu, .question-item, .q-item, .TiMu2, .question_div, .ques-item");
        let attemptedCount = 0;
        let skippedCount = 0;
        
        questions.forEach((qDiv, index) => {
            // 1️⃣ 跳过已批阅的题（已完成，无法再选）
            if (qDiv.querySelector(".fontLabel") || qDiv.querySelector(".marking_dui") || qDiv.querySelector(".marking_cuo")) {
                console.log(`题 ${index+1}: 已批阅，跳过`);
                skippedCount++;
                return;
            }
            
            // 2️⃣ 跳过已标记 solved 的（防止重复）
            if (qDiv.getAttribute("data-cx-solved")) {
                console.log(`题 ${index+1}: 已乱选过，跳过`);
                skippedCount++;
                return;
            }
            
            const options = this.getOptions(qDiv);
            if (options.length === 0) {
                console.log(`题 ${index+1}: 无选项，跳过`);
                skippedCount++;
                return;
            }
            
            // 3️⃣ 执行乱选
            const success = this.randomAnswer(qDiv);
            if (success) {
                attemptedCount++;
                qDiv.setAttribute("data-cx-solved", "true");
                // 可选：标记背景色便于观察
                // qDiv.style.background = "#e8f5e9";
            }
        });
        
        console.log(`✅ 乱选完成：${attemptedCount} 题尝试，${skippedCount} 题跳过`);
        
        setTimeout(() => {
            this.trySubmit();
            setTimeout(() => {
                const remainingUnanswered = document.querySelectorAll(".questionLi:not(.fontLabel), .singleQuesId:not(.fontLabel)").length;
                if (remainingUnanswered === 0 && typeof Pagination !== 'undefined') {
                    console.log("➡️ 所有题目已完成，准备翻到下一节...");
                    if (typeof State !== 'undefined') {
                        State.set({
                            [KEYS.IS_ANSWERING]: false,
                            [KEYS.IS_LEARN_MODE]: true,
                            [KEYS.IS_LEARN_RUNNING]: false
                        });
                    }
                    setTimeout(() => {
                        Pagination.next();
                    }, 1000);
                } else {
                    console.log(`⚠️ 还有 ${remainingUnanswered} 道未答题，等待用户处理...`);
                }
            }, 2000);
        }, 2000);
    },
    
    // 对单个题目随机答题
    randomAnswer: function(qDiv) {
        const options = this.getOptions(qDiv);
        if (options.length === 0) {
            console.log("  无选项，跳过");
            return false;
        }
        
        const type = this.detectType(qDiv);
        let selectCount = 1;
        
        if (type === "multiple") {
            selectCount = Math.min(Math.floor(Math.random() * 2) + 2, options.length);
        } else if (type === "unknown") {
            selectCount = Math.min(Math.floor(Math.random() * 3) + 1, options.length);
        }
        
        const shuffled = [...options].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, selectCount);
        
        selected.forEach((opt, idx) => {
            console.log(`  随机选 ${idx+1}: 选项 ${opt.label}`);
            opt.div.click();
        });
        
        return true;
    },
    
    // 获取题目的所有可选选项
    getOptions: function(qDiv) {
        const options = [];
        const optionDivs = qDiv.querySelectorAll(".answerBg, li, .singleChoose, .multiChoose, .option-item, .choice-item");
        
        optionDivs.forEach((div, idx) => {
            const span = div.querySelector(".num_option, .num_option_dx, .option_span");
            let label = "";
            
            if (span) {
                label = span.getAttribute("data");  // data="A" 或 "√" 或 "1"
            } else {
                // 用 index 推算（假设选项就是 A, B, C, D, E 顺序）
                label = String.fromCharCode(65 + idx);  // A, B, C...
            }
            
            // 检查是否已选中（避免重复点）
            const isSelected = span && 
                (span.classList.contains("check_answer") || 
                 span.classList.contains("check_answer_dx") ||
                 span.classList.contains("selected"));
            
            if (!isSelected) {
                options.push({ div, label });
            }
        });
        
        return options;
    },
    
    detectType: function(qDiv) {
        const classes = qDiv.className.toLowerCase();
        const id = qDiv.id || "";
        
        if (classes.includes("single") || classes.includes("单选")) {
            return "single";
        } else if (classes.includes("multiple") || classes.includes("multi") || classes.includes("多选")) {
            return "multiple";
        } else if (classes.includes("judge") || classes.includes("判断")) {
            return "judge";
        }
        
        const options = this.getOptions(qDiv);
        const optionTexts = options.map(opt => opt.label.toLowerCase());
        
        if (optionTexts.includes("对") || optionTexts.includes("错") || 
            optionTexts.includes("√") || optionTexts.includes("×") ||
            optionTexts.includes("true") || optionTexts.includes("false")) {
            return "judge";
        }
        
        if (options.length === 2) {
            return "judge";
        } else if (options.length > 4) {
            return "single";
        }
        
        const questionText = qDiv.innerText || "";
        if (questionText.includes("单选") || questionText.includes("选择一个")) {
            return "single";
        } else if (questionText.includes("多选") || questionText.includes("选择多个")) {
            return "multiple";
        } else if (questionText.includes("判断") || questionText.includes("是否")) {
            return "judge";
        }
        
        return "single";
    },
    
    isMultipleChoiceCompleted: function(qDiv) {
        const options = this.getOptions(qDiv);
        const selectedOptions = qDiv.querySelectorAll(".check_answer, .check_answer_dx, .selected");
        
        const allDisabled = options.every(opt => opt.div.querySelector("input[disabled]"));
        const hasSelection = selectedOptions.length > 0;
        
        return allDisabled || hasSelection;
    },
    
    // 尝试点击提交按钮（如果题目需要提交才批阅）
    trySubmit: function() {
        // 常见的提交按钮选择器
        const selectors = [
            "button[type='submit']",
            "input[type='submit']",
            ".submitBtn",
            "#submit",
            "#submitAnswer",
            "button:contains('提交')",
            "a:contains('提交')",
            ".next:contains('提交')"
        ];
        
        for (let sel of selectors) {
            const btn = document.querySelector(sel);
            if (btn && btn.offsetParent !== null) {
                console.log("找到提交按钮，点击提交...");
                btn.click();
                return true;
            }
        }
        
        console.log("未找到提交按钮（可能不需要提交或已自动提交）");
        return false;
    }
};