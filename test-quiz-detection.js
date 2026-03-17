console.log("🧪 测试章节测验检测功能");

function testQuestionDetection() {
    const questions = document.querySelectorAll(".questionLi, .singleQuesId, .TiMu, .question-item, .q-item, .TiMu2, .question_div, .ques-item");
    console.log(`📊 检测到 ${questions.length} 个题目容器`);
    
    questions.forEach((qDiv, index) => {
        const options = qDiv.querySelectorAll(".answerBg, li, .singleChoose, .multiChoose, .option-item, .choice-item");
        console.log(`题目 ${index + 1}: ${options.length} 个选项`);
    });
    
    return questions.length;
}

function testModeState() {
    if (typeof State !== 'undefined') {
        State.get((memory) => {
            console.log("🎯 当前模式状态:");
            console.log(`  - IS_LEARN_MODE: ${memory.cx_is_learn_mode}`);
            console.log(`  - IS_ANSWERING: ${memory.cx_is_answering}`);
            console.log(`  - IS_LEARN_RUNNING: ${memory.cx_is_learn_run}`);
        });
    } else {
        console.log("⚠️ State 未定义");
    }
}

function testQuestionState() {
    const unanswered = document.querySelectorAll(".questionLi:not(.fontLabel), .singleQuesId:not(.fontLabel)").length;
    const answered = document.querySelectorAll(".questionLi.fontLabel, .singleQuesId.fontLabel").length;
    console.log(`📊 题目状态: ${unanswered} 未答题, ${answered} 已答题`);
    return unanswered;
}

console.log("=== 开始测试 ===");
testQuestionDetection();
testModeState();
testQuestionState();
console.log("=== 测试完成 ===");