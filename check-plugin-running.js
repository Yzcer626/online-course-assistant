console.log("🔍 检查插件是否在运行");

const hasPluginSign = (
    typeof State !== 'undefined' ||
    typeof KEYS !== 'undefined' ||
    typeof TaskManager !== 'undefined' ||
    typeof Solver !== 'undefined'
);

if (hasPluginSign) {
    console.log("✅ 插件正在运行");
} else {
    console.log("❌ 插件未运行");
    console.log("   可能原因:");
    console.log("   1. 插件未安装");
    console.log("   2. 插件未启用");
    console.log("   3. 当前页面不在插件匹配范围内");
    console.log("   4. 插件加载失败");
}

console.log(`\n📄 当前页面URL: ${window.location.href}`);
console.log(`🔍 检查是否匹配插件规则:`);

const matchPatterns = [
    "*://*.chaoxing.com/*",
    "*://*.erya100.com/*",
    "*://*.xuexitong.com/*"
];

matchPatterns.forEach(pattern => {
    const regex = new RegExp(pattern.replace(/\*/g, ".*"));
    console.log(`  ${pattern}: ${regex.test(window.location.href) ? '✅ 匹配' : '❌ 不匹配'}`);
});

console.log("\n🔍 检查学习通元素:");
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

console.log(`\n📄 页面标题: ${document.title}`);

if (!hasPluginSign) {
    console.log("\n💡 建议:");
    console.log("  1. 检查插件是否已安装并启用");
    console.log("  2. 重新加载插件");
    console.log("  3. 检查浏览器控制台是否有错误信息");
}