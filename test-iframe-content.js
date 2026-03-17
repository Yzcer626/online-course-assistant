console.log("🔍 检查iframe内容");

if (window.self !== window.top) {
    console.log("✅ 当前页面是iframe");
    console.log(`  父窗口URL: ${window.parent.location.href}`);
} else {
    console.log("❌ 当前页面不是iframe");
}

const iframes = document.querySelectorAll("iframe");
console.log(`📊 页面中有 ${iframes.length} 个iframe`);

iframes.forEach((iframe, index) => {
    console.log(`iframe ${index + 1}:`);
    console.log(`  src: ${iframe.src}`);
    console.log(`  class: ${iframe.className}`);
    console.log(`  id: ${iframe.id}`);
    
    try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        console.log(`  ✅ 可以访问iframe文档`);
        
        const questions = iframeDoc.querySelectorAll(".questionLi, .singleQuesId, .TiMu, .question-item, .q-item");
        console.log(`  📊 iframe中有 ${questions.length} 个题目`);
        
        if (questions.length > 0) {
            console.log(`  🎯 找到题目容器！`);
            console.log(`     第一个题目的class: ${questions[0].className}`);
        }
    } catch (e) {
        console.log(`  ❌ 无法访问iframe文档: ${e.message}`);
    }
});

console.log("\n🔍 检查学习通内容:");
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

console.log(`\n📄 页面标题: ${document.title}`);
console.log(`🔗 页面URL: ${window.location.href}`);