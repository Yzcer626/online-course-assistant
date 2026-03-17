# 章节测验模式修复说明

## 问题描述

### 问题1：视频完成进入章节测验后又会跳到下一节
**现象**：视频播放完成后检测到章节测验，切换到答题模式，但在停止自动刷课前就会跳转下一页

**根本原因**：
1. 主循环中的翻页逻辑没有正确识别测验模式状态
2. 检测到章节测验后，虽然停止了 TaskManager，但主循环仍在运行
3. `IS_QUIZ_MODE` 状态没有正确传递和检测

### 问题2：章节测验进入答题模式结果不会自动答题
**现象**：切换到答题模式后，题目没有自动选择选项，或者提交后没有正确处理

**学习通测验流程**：
1. 视频学完 → 跳转下一页 → 进入章节测验页面
2. 测验页面包含多选题和单选题（多选可以只选一个）
3. 选完所有题目后点击"提交"按钮
4. 提交后系统批阅，正确进入下一个视频，错误回到这节视频

**根本原因**：
1. 题目检测选择器不完整
2. 提交按钮选择器不准确（使用了不支持的 `:contains()` 选择器）
3. 提交后没有正确重置状态

## 修复方案

### 1. 添加测验模式状态
在 `utils.js` 中添加 `IS_QUIZ_MODE` 常量：
```javascript
const KEYS = {
    IS_ANSWERING: "cx_is_answering",
    IS_LEARN_MODE: "cx_is_learn_mode",
    IS_LEARN_RUNNING: "cx_learn_run",
    VIDEO_SPEED: "cx_video_speed",
    IS_QUIZ_MODE: "cx_is_quiz_mode"  // 新增
};
```

### 2. 修改模式切换逻辑
在 `main.js` 中：
- 检测到章节测验时，设置 `IS_QUIZ_MODE: true`
- 主循环检测时，增加 `!memory[KEYS.IS_QUIZ_MODE]` 条件
- 页面加载时重置 `IS_QUIZ_MODE` 状态

### 3. 优化答题逻辑
在 `solver.js` 中：
- 增加更多题目检测选择器
- 修复提交按钮选择器，移除不支持的 `:contains()` 语法
- 提交后等待页面跳转，不主动翻页

### 4. 页面跳转处理
- 提交后等待3秒，让系统自动处理批阅和跳转
- 重置测验模式状态，准备下一个任务

## 代码变更详情

### utils.js
```javascript
const KEYS = {
    // ... 其他常量
    IS_QUIZ_MODE: "cx_is_quiz_mode"  // 新增测验模式状态
};
```

### main.js
1. 检测到章节测验时设置测验模式：
```javascript
State.set({
    [KEYS.IS_LEARN_MODE]: false,
    [KEYS.IS_ANSWERING]: true,
    [KEYS.IS_QUIZ_MODE]: true  // 标记为测验模式
});
```

2. 主循环增加测验模式检测：
```javascript
if (memory[KEYS.IS_LEARN_MODE] && !memory[KEYS.IS_ANSWERING] && !memory[KEYS.IS_QUIZ_MODE]) {
    // 只有在非测验模式下才进行自动切换
}
```

3. 页面加载时重置状态：
```javascript
window.addEventListener('load', () => {
    if (typeof State !== 'undefined') {
        State.set({
            [KEYS.IS_QUIZ_MODE]: false
        });
    }
});
```

### solver.js
1. 更新题目检测选择器：
```javascript
const questions = document.querySelectorAll(".questionLi, .singleQuesId, .TiMu, .question-item, .q-item, .TiMu2, .question_div, .ques-item");
```

2. 修复提交按钮选择器：
```javascript
const selectors = [
    "button[type='submit']",
    "input[type='submit']",
    ".submitBtn",
    "#submit",
    "#submitAnswer",
    ".next",
    ".btn-submit",
    ".answer-submit"
];
```

3. 优化提交后处理：
```javascript
if (submitted) {
    console.log("📝 已提交答案，等待页面跳转...");
    setTimeout(() => {
        if (typeof State !== 'undefined') {
            State.set({
                [KEYS.IS_ANSWERING]: false,
                [KEYS.IS_LEARN_MODE]: true,
                [KEYS.IS_LEARN_RUNNING]: false,
                [KEYS.IS_QUIZ_MODE]: false  // 重置测验模式
            });
        }
    }, 3000);
}
```

## 测试方法

1. **安装插件**：加载改进后的插件
2. **进入课程**：打开学习通课程页面
3. **视频播放**：启动刷课模式，观看视频
4. **章节测验**：视频完成后进入章节测验页面
5. **自动答题**：验证是否自动识别题目并选择选项
6. **提交答案**：验证是否自动点击提交按钮
7. **页面跳转**：验证提交后是否正确跳转到下一个视频

## 预期效果

1. ✅ 视频播放完成后检测到章节测验，切换到答题模式
2. ✅ 答题模式下不会自动跳到下一节（测验模式状态生效）
3. ✅ 自动识别题目并随机选择选项（多选题选1个，单选题选1个）
4. ✅ 自动点击提交按钮
5. ✅ 提交后等待系统批阅和跳转
6. ✅ 跳转到下一个视频后继续刷课

## 注意事项

1. **多选题处理**：当前插件将多选题当作单选题处理（只选1个选项），这可能会影响正确率，但能确保完成任务
2. **提交按钮检测**：如果学习通更改了提交按钮的样式或选择器，可能需要更新代码
3. **页面跳转时间**：提交后等待3秒跳转，如果网络较慢可能需要调整时间

## 后续优化

1. **智能答题**：根据题目类型调整选项数量（多选题选多个选项）
2. **题库支持**：增加题库功能，提高答题正确率
3. **用户配置**：允许用户设置答题策略（乱选/题库/手动）
4. **错误处理**：增加提交失败、页面加载失败等情况的处理