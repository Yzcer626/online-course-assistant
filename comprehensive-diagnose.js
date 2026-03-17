console.log("🔍 综合诊断脚本开始");

console.log("\n1️⃣ 检查插件模块加载:");
const modules = {
    "State (utils.js)": typeof State,
    "KEYS (utils.js)": typeof KEYS,
    "TaskManager (main.js)": typeof TaskManager,
    "Solver (solver.js)": typeof Solver,
    "Pagination (pagination.js)": typeof Pagination
};

Object.entries(modules).forEach(([name, status]) => {
    console.log(`  ${status !== 'undefined' ? '✅' : '❌'} ${name}: ${status}`);
});

console.log("\n2️⃣ 检查页面信息:");
console.log(`  标题: ${document.title}`);
console.log(`  URL: ${window.location.href}`);
console.log(`  是否是iframe: ${window.self !== window.top}`);
console.log(`  是否是顶层窗口: ${window.self === window.top}`);

console.log("\n3️⃣ 检查iframe:");
const iframes = document.querySelectorAll("iframe");
console.log(`  页面中iframe数量: ${iframes.length}`);

iframes.forEach((iframe, index) => {
    console.log(`  iframe ${index + 1}:`);
    console.log(`    src: ${iframe.src}`);
    console.log(`    id: ${iframe.id}`);
    console.log(`    class: ${iframe.className}`);
    
    try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        console.log(`    ✅ 可以访问文档`);
        
        const questions = iframeDoc.querySelectorAll(".questionLi, .singleQuesId, .TiMu, .question-item, .q-item");
        console.log(`    📊 题目数量: ${questions.length}`);
        
        if (questions.length > 0) {
            console.log(`    🎯 找到题目！第一个题目的class: ${questions[0].className}`);
        }
        
        const submitBtns = iframeDoc.querySelectorAll("button, input[type='submit'], a");
        let submitCount = 0;
        submitBtns.forEach(btn => {
            const text = (btn.innerText || btn.value || "").trim();
            if (text.includes("提交") || text.includes("交卷")) {
                submitCount++;
            }
        });
        console.log(`    📝 提交按钮数量: ${submitCount}`);
        
    } catch (e) {
        console.log(`    ❌ 无法访问文档: ${e.message}`);
    }
});

console.log("\n4️⃣ 检查主页面中的题目:");
const mainQuestions = document.querySelectorAll(".questionLi, .singleQuesId, .TiMu, .question-item, .q-item");
console.log(`  主页面题目数量: ${mainQuestions.length}`);

console.log("\n5️⃣ 检查学习通特定元素:");
const chaoxingElements = [
    ".ans-cc", ".ans-job-icon", ".ans-job-finished",
    ".questionLi", ".singleQuesId", ".TiMu", "#iframe"
];

chaoxingElements.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
        console.log(`  ✅ ${selector}: ${elements.length} 个元素`);
    }
});

if (typeof State !== 'undefined' && typeof KEYS !== 'undefined') {
    console.log("\n6️⃣ 检查插件状态:");
    State.get((memory) => {
        console.log(`  IS_LEARN_MODE: ${memory[KEYS.IS_LEARN_MODE]}`);
        console.log(`  IS_ANSWERING: ${memory[KEYS.IS_ANSWERING]}`);
        console.log(`  IS_LEARN_RUNNING: ${memory[KEYS.IS_LEARN_RUNNING]}`);
        console.log(`  VIDEO_SPEED: ${memory[KEYS.VIDEO_SPEED]}`);
        console.log(`  IS_QUIZ_MODE: ${memory[KEYS.IS_QUIZ_MODE]}`);
    });
} else {
    console.log("\n6️⃣ 插件状态: 无法检查（模块未加载）");
}

console.log("\n🔍 综合诊断完成");