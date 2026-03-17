// solver.js - 乱选速刷版 (v1.0)
// 核心逻辑：无脑随机选选项，快速完成题目，不管对错

const Solver = {
    // 每题最多尝试次数（防无限循环）
    MAX_ATTEMPTS: 5,
    
    // 主入口
    run: function() {
        console.log("🔀 开始乱选模式...");
        
        const questions = document.querySelectorAll(".questionLi, .singleQuesId, .TiMu, .question-item, .q-item");
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
        
        // 4️⃣ 所有未批阅题都尝试后，尝试提交
        setTimeout(() => {
            this.trySubmit();
            // 5️⃣ 然后翻页
            setTimeout(() => {
                if (typeof Pagination !== 'undefined') {
                    console.log("➡️ 准备翻到下一节...");
                    Pagination.next();
                }
            }, 2000);
        }, 2000);
    },
    
    // 对单个题目随机答题
    randomAnswer: function(qDiv) {
        // 获取所有选项
        const options = this.getOptions(qDiv);
        if (options.length === 0) {
            console.log("  无选项，跳过");
            return false;
        }
        
        // 识别题型（单选/多选/判断）
        const type = this.detectType(qDiv);
        
        // 根据题型决定随机选几个
        let selectCount = 1;
        if (type === "multiple") {
            // 多选：也随机选1个（变成单选行为）
            selectCount = 1;
        } else if (type === "unknown") {
            // 未知题型：随机选1-3个
            selectCount = Math.min(Math.floor(Math.random() * 3) + 1, options.length);
        }
        // 单选/判断：默认1个
        
        // 随机打乱选项
        const shuffled = [...options].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, selectCount);
        
        // 点击选中的选项
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
    
    // 识别题型
    detectType: function(qDiv) {
        const classes = qDiv.className.toLowerCase();
        const id = qDiv.id || "";
        
        // 常见判断：
        // 单选题：.single, .single ques, .单选题
        // 多选题：.multiple, .multi, .多选题
        // 判断题：.judge, .判断
        
        if (classes.includes("single") || classes.includes("singleques") || classes.includes("单选题")) {
            return "single";
        } else if (classes.includes("multiple") || classes.includes("multi") || classes.includes("多选题")) {
            return "multiple";
        } else if (classes.includes("judge") || classes.includes("判断")) {
            return "judge";
        } else {
            // 通过选项数量推测：
            // 如果是判断题，通常只有2个选项（对/错）
            // 如果只有2个选项，可能是判断
            const options = this.getOptions(qDiv);
            if (options.length === 2) {
                return "judge";
            }
            // 如果选项很多（5个），可能是单选
            if (options.length >= 5) {
                return "single";
            }
            // 无法判断，返回 unknown
            return "unknown";
        }
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