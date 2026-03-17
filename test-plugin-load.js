console.log("🧪 测试插件加载情况");

if (typeof State !== 'undefined') {
    console.log("✅ State 已定义");
} else {
    console.log("❌ State 未定义 - utils.js 可能未加载");
}

if (typeof KEYS !== 'undefined') {
    console.log("✅ KEYS 已定义");
    console.log("  IS_ANSWERING:", KEYS.IS_ANSWERING);
    console.log("  IS_LEARN_MODE:", KEYS.IS_LEARN_MODE);
    console.log("  IS_LEARN_RUNNING:", KEYS.IS_LEARN_RUNNING);
    console.log("  VIDEO_SPEED:", KEYS.VIDEO_SPEED);
    console.log("  IS_QUIZ_MODE:", KEYS.IS_QUIZ_MODE);
} else {
    console.log("❌ KEYS 未定义 - utils.js 可能未加载");
}

if (typeof TaskManager !== 'undefined') {
    console.log("✅ TaskManager 已定义");
} else {
    console.log("❌ TaskManager 未定义 - main.js 可能未加载");
}

if (typeof Solver !== 'undefined') {
    console.log("✅ Solver 已定义");
} else {
    console.log("❌ Solver 未定义 - solver.js 可能未加载");
}

if (typeof Pagination !== 'undefined') {
    console.log("✅ Pagination 已定义");
} else {
    console.log("❌ Pagination 未定义 - pagination.js 可能未加载");
}

console.log("\n📄 页面信息:");
console.log(`  标题: ${document.title}`);
console.log(`  URL: ${window.location.href}`);
console.log(`  是否是iframe: ${window.self !== window.top}`);

console.log("\n🔍 检查学习通元素:");
const chaoxingElements = [
    ".ans-cc", ".ans-job-icon", ".ans-job-finished",
    ".questionLi", ".singleQuesId", ".TiMu", "#iframe"
];

chaoxingElements.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
        console.log(`  ${selector}: ${elements.length} 个元素`);
    }
});

console.log("\n🧪 测试完成");