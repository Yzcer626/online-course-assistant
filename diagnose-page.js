console.log("🔍 页面结构诊断开始");

console.log("📄 页面信息:");
console.log(`  标题: ${document.title}`);
console.log(`  URL: ${window.location.href}`);

const selectors = [
    ".questionLi", ".singleQuesId", ".TiMu", ".question-item", ".q-item",
    ".TiMu2", ".question_div", ".ques-item", ".question", ".qstn",
    "[class*='question']", "[class*='ques']", "[class*='qst']"
];

console.log("\n🔍 检查题目容器:");
selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
        console.log(`  ${selector}: ${elements.length} 个元素`);
        if (elements.length > 0) {
            console.log(`    第一个元素的class: ${elements[0].className}`);
        }
    }
});

console.log("\n🔍 检查iframe:");
const iframes = document.querySelectorAll("iframe");
console.log(`  页面中有 ${iframes.length} 个iframe`);
iframes.forEach((iframe, index) => {
    console.log(`  iframe ${index + 1}:`);
    console.log(`    src: ${iframe.src}`);
    console.log(`    class: ${iframe.className}`);
    console.log(`    id: ${iframe.id}`);
});

console.log("\n🔍 检查提交按钮:");
const submitSelectors = [
    "button[type='submit']", "input[type='submit']", ".submitBtn",
    "#submit", "#submitAnswer", ".next", ".btn-submit", ".answer-submit"
];
submitSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
        console.log(`  ${selector}: ${elements.length} 个元素`);
    }
});

console.log("\n🔍 检查页面结构:");
const bodyElements = document.body.children;
console.log(`  页面根元素数量: ${bodyElements.length}`);
for (let i = 0; i < Math.min(10, bodyElements.length); i++) {
    const el = bodyElements[i];
    console.log(`  元素 ${i + 1}: ${el.tagName}${el.id ? '#' + el.id : ''}${el.className ? '.' + el.className.split(' ')[0] : ''}`);
}

console.log("\n🔍 检查学习通特定元素:");
const chaoxingElements = [
    ".ans-cc", ".ans-job-icon", ".ans-job-finished",
    ".questionLi", ".singleQuesId", ".TiMu"
];
chaoxingElements.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
        console.log(`  ${selector}: ${elements.length} 个元素`);
    }
});

console.log("\n🔍 诊断完成");