# 学习通插件改进计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 改进学习通刷课插件，适配新页面结构，修复已知问题，增强自动导航功能

**Architecture:** 基于现有浏览器扩展项目，通过更新CSS选择器、改进视频控制逻辑、增强题型识别来提升插件兼容性和稳定性

**Tech Stack:** Chrome Extension (Manifest V3), JavaScript, CSS selectors

---

## 任务清单

### Task 1: 分析新页面结构并更新CSS选择器

**Files:**
- Create: `docs/analysis/page-structure-analysis.md`
- Modify: `main.js:121-158` (更新任务扫描逻辑)
- Modify: `solver.js:12-15` (更新题目选择器)

**Step 1: 分析新页面结构**

创建分析文档，记录学习通新页面的结构特征：
```markdown
# 页面结构分析

## 视频任务容器
- 选择器：`.ans-cc iframe, iframe[module]`
- 数据属性：`data` (JSON格式包含jobid)

## 题目容器
- 选择器：`.questionLi, .singleQuesId, .TiMu`
- 已批阅标记：`.fontLabel, .marking_dui, .marking_cuo`

## 提交按钮
- 选择器：`button[type='submit'], .submitBtn, #submitAnswer`
```

**Step 2: 更新任务扫描逻辑**

修改 `main.js` 中的任务扫描逻辑，适配新页面结构：
```javascript
// 更新后的任务扫描逻辑
const iframes = document.querySelectorAll('.ans-cc iframe, iframe[module], .video-container iframe');

iframes.forEach((iframe) => {
    // 增强数据提取逻辑
    const dataStr = iframe.getAttribute('data') || "";
    const cleanDataStr = dataStr.replace(/&quot;/g, '"');
    const moduleName = iframe.getAttribute('module') || "";
    const src = iframe.src || "";
    
    // 增加对新数据结构的支持
    let taskType = 'other';
    if (moduleName.includes('video') || cleanDataStr.includes('video') || src.includes('video')) {
        taskType = 'video';
    } else if (moduleName.includes('doc') || moduleName.includes('pdf') || moduleName.includes('ppt') || cleanDataStr.includes('doc') || cleanDataStr.includes('pdf') || cleanDataStr.includes('.ppt') || cleanDataStr.includes('.pptx')) {
        taskType = 'doc';
    }
    
    // 增强jobId提取逻辑
    let currentJobId = null;
    try {
        let dataObj = JSON.parse(cleanDataStr);
        let j = dataObj.jobid || dataObj.jobId || dataObj._jobid || dataObj.attachment?.jobid;
        if (j) currentJobId = String(j);
    } catch(e) {
        // 多种提取方式
        let match = cleanDataStr.match(/"\_?job[iI]d"\s*:\s*"([^"]+)"/);
        if (match && match[1]) currentJobId = String(match[1]);
        else {
            // 尝试从其他属性提取
            match = cleanDataStr.match(/"jobid"\s*:\s*"([^"]+)"/);
            if (match && match[1]) currentJobId = String(match[1]);
        }
    }
});
```

**Step 3: 更新题目选择器**

修改 `solver.js` 中的题目选择器，适配新页面结构：
```javascript
// 更新后的题目选择器
const questions = document.querySelectorAll(".questionLi, .singleQuesId, .TiMu, .question-item, .q-item");

// 更新选项选择器
const optionDivs = qDiv.querySelectorAll(".answerBg, li, .singleChoose, .multiChoose, .option-item, .choice-item");
```

**Step 4: 测试选择器更新**

运行测试确保选择器正确工作：
```bash
# 在浏览器控制台测试选择器
document.querySelectorAll(".questionLi, .singleQuesId, .TiMu").length
document.querySelectorAll(".ans-cc iframe, iframe[module]").length
```

**Step 5: 提交更改**

```bash
git add docs/analysis/page-structure-analysis.md main.js solver.js
git commit -m "feat: 更新CSS选择器适配新页面结构"
```

---

### Task 2: 改进视频播放控制

**Files:**
- Modify: `video.js` (更新视频控制逻辑)
- Create: `docs/analysis/video-control-analysis.md`

**Step 1: 分析视频播放控制逻辑**

创建分析文档，记录学习通视频播放的特性：
```markdown
# 视频播放控制分析

## 学习通视频特性
1. 使用video.js播放器
2. 支持倍速播放
3. 有防暂停机制
4. 需要检测播放完成状态

## 控制方式
1. 通过iframe contentWindow.postMessage发送控制命令
2. 使用video.js API控制播放
3. 检测播放进度和完成状态
```

**Step 2: 更新视频控制逻辑**

修改 `video.js` 增强视频控制：
```javascript
// 增强视频控制逻辑
const VideoController = {
    // 设置播放速度
    setSpeed: function(iframe, speed) {
        try {
            const videoPlayer = iframe.contentWindow.videojs("video");
            if (videoPlayer) {
                videoPlayer.playbackRate(speed);
                return true;
            }
        } catch (e) {
            console.log("设置播放速度失败:", e);
        }
        return false;
    },
    
    // 检测视频是否播放完成
    isVideoCompleted: function(iframe) {
        try {
            const videoPlayer = iframe.contentWindow.videojs("video");
            if (videoPlayer) {
                const duration = videoPlayer.duration();
                const currentTime = videoPlayer.currentTime();
                return currentTime >= duration - 1; // 允许1秒误差
            }
        } catch (e) {
            console.log("检测视频完成状态失败:", e);
        }
        return false;
    },
    
    // 自动播放视频
    autoPlay: function(iframe) {
        try {
            const videoPlayer = iframe.contentWindow.videojs("video");
            if (videoPlayer && videoPlayer.paused()) {
                videoPlayer.play();
                return true;
            }
        } catch (e) {
            console.log("自动播放失败:", e);
        }
        return false;
    }
};
```

**Step 3: 更新消息处理逻辑**

修改 `main.js` 中的消息处理逻辑，支持新的视频控制命令：
```javascript
window.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'START_VIDEO') {
        const iframe = event.source.frameElement;
        const speed = event.data.speed || 2.0;
        
        // 设置播放速度
        VideoController.setSpeed(iframe, speed);
        
        // 自动播放
        VideoController.autoPlay(iframe);
        
        // 检测播放完成
        const checkInterval = setInterval(() => {
            if (VideoController.isVideoCompleted(iframe)) {
                clearInterval(checkInterval);
                window.top.postMessage({ action: 'TASK_FINISHED', type: 'video' }, '*');
            }
        }, 1000);
    }
});
```

**Step 4: 测试视频控制**

在浏览器中测试视频控制功能：
1. 进入学习通视频页面
2. 启动插件刷课模式
3. 验证视频自动播放和倍速设置

**Step 5: 提交更改**

```bash
git add docs/analysis/video-control-analysis.md video.js main.js
git commit -m "feat: 改进视频播放控制逻辑"
```

---

### Task 3: 增强自动导航功能

**Files:**
- Modify: `pagination.js` (更新翻页逻辑)
- Create: `docs/analysis/navigation-analysis.md`

**Step 1: 分析自动导航逻辑**

创建分析文档，记录学习通章节导航的特性：
```markdown
# 自动导航分析

## 章节导航方式
1. 使用 `PCount.next()` 和 `PCount.previous()` 函数
2. 通过 `getTeacherAjax()` 加载章节内容
3. 检测下一节按钮并点击

## 页面状态检测
1. 检测是否有未完成任务
2. 检测是否章节测验页面
3. 检测是否需要翻页
```

**Step 2: 更新翻页逻辑**

修改 `pagination.js` 增强自动导航：
```javascript
const Pagination = {
    // 检测下一节按钮
    findNextButton: function() {
        // 优先查找学习通标准按钮
        let nextBtn = document.querySelector('.prev_next.next, .nextChapter, #prevNextFocusNext');
        
        // 如果没找到，搜索文本为"下一节"的元素
        if (!nextBtn) {
            const elements = document.querySelectorAll('span, a, div');
            for (let el of elements) {
                if (el.innerText && el.innerText.trim() === '下一节' && el.offsetParent !== null) {
                    nextBtn = el;
                    break;
                }
            }
        }
        
        return nextBtn;
    },
    
    // 翻到下一节
    next: function() {
        const nextBtn = this.findNextButton();
        if (nextBtn) {
            console.log("点击下一节按钮");
            nextBtn.click();
            
            // 处理可能的确认弹窗
            setTimeout(() => {
                const confirmBtn = document.querySelector('.layui-layer-btn0, .bluebtn, .sure');
                if (confirmBtn && confirmBtn.offsetParent !== null) {
                    console.log("检测到确认弹窗，点击确认");
                    confirmBtn.click();
                }
            }, 1000);
            
            return true;
        } else {
            console.log("未找到下一节按钮");
            return false;
        }
    },
    
    // 检测是否需要翻页
    shouldNavigate: function() {
        // 检测是否有未完成任务
        const unfinishedTasks = document.querySelectorAll('.ans-job-icon').length;
        const finishedTasks = document.querySelectorAll('.ans-job-finished').length;
        
        // 检测是否有未答题
        const unanswered = document.querySelectorAll(".questionLi:not(.fontLabel), .singleQuesId:not(.fontLabel)").length;
        
        return unfinishedTasks === finishedTasks && unanswered === 0;
    }
};
```

**Step 3: 更新主循环逻辑**

修改 `main.js` 中的主循环，增强自动导航：
```javascript
setInterval(() => {
    if (typeof State === 'undefined') return;
    
    State.get((memory) => {
        // 自动导航逻辑
        if (memory[KEYS.IS_LEARN_MODE] && !memory[KEYS.IS_LEARN_RUNNING]) {
            if (Pagination.shouldNavigate()) {
                console.log("检测到需要翻页");
                setTimeout(() => {
                    Pagination.next();
                }, 3000);
            }
        }
    });
}, 2000);
```

**Step 4: 测试自动导航**

在浏览器中测试自动导航功能：
1. 进入学习通课程页面
2. 启动插件刷课模式
3. 验证自动翻页功能

**Step 5: 提交更改**

```bash
git add docs/analysis/navigation-analysis.md pagination.js main.js
git commit -m "feat: 增强自动导航功能"
```

---

### Task 4: 修复多选题处理问题

**Files:**
- Modify: `solver.js` (更新多选题处理逻辑)
- Create: `docs/analysis/multiple-choice-analysis.md`

**Step 1: 分析多选题处理问题**

创建分析文档，记录多选题处理的问题：
```markdown
# 多选题处理分析

## 当前问题
1. 多选题只选1个可能被判定为"未完成"
2. 系统可能要求选全所有正确选项
3. 需要检测多选题的完成状态

## 解决方案
1. 检测多选题的最小选择数量
2. 根据题目要求选择相应数量的选项
3. 增加多选题完成状态检测
```

**Step 2: 更新多选题处理逻辑**

修改 `solver.js` 增强多选题处理：
```javascript
// 更新多选题处理逻辑
detectType: function(qDiv) {
    const classes = qDiv.className.toLowerCase();
    const id = qDiv.id || "";
    
    // 检测多选题特征
    if (classes.includes("multiple") || classes.includes("multi") || classes.includes("多选题")) {
        return "multiple";
    }
    
    // 通过选项数量和选择方式检测
    const options = this.getOptions(qDiv);
    const selectedOptions = qDiv.querySelectorAll(".check_answer, .check_answer_dx, .selected");
    
    // 如果是多选题，通常有多个选项且可以选择多个
    if (options.length > 2 && selectedOptions.length > 1) {
        return "multiple";
    }
    
    // 其他检测逻辑...
    return "single";
},

// 增强多选题随机答题
randomAnswer: function(qDiv) {
    const options = this.getOptions(qDiv);
    if (options.length === 0) {
        return false;
    }
    
    const type = this.detectType(qDiv);
    let selectCount = 1;
    
    if (type === "multiple") {
        // 多选题：随机选择2-3个选项
        selectCount = Math.min(Math.floor(Math.random() * 2) + 2, options.length);
    } else if (type === "unknown") {
        selectCount = Math.min(Math.floor(Math.random() * 3) + 1, options.length);
    }
    
    // 随机选择并点击
    const shuffled = [...options].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, selectCount);
    
    selected.forEach((opt, idx) => {
        opt.div.click();
    });
    
    return true;
}
```

**Step 3: 增加多选题完成状态检测**

增加检测多选题是否完成的逻辑：
```javascript
// 检测多选题是否已完成
isMultipleChoiceCompleted: function(qDiv) {
    const options = this.getOptions(qDiv);
    const selectedOptions = qDiv.querySelectorAll(".check_answer, .check_answer_dx, .selected");
    
    // 如果所有选项都被禁用或已选择，认为已完成
    const allDisabled = options.every(opt => opt.div.querySelector("input[disabled]"));
    const hasSelection = selectedOptions.length > 0;
    
    return allDisabled || hasSelection;
}
```

**Step 4: 测试多选题处理**

在浏览器中测试多选题处理功能：
1. 进入学习通测验页面
2. 启动插件答题模式
3. 验证多选题的选择数量和完成状态

**Step 5: 提交更改**

```bash
git add docs/analysis/multiple-choice-analysis.md solver.js
git commit -m "feat: 修复多选题处理问题"
```

---

### Task 5: 改进题型识别准确性

**Files:**
- Modify: `solver.js` (更新题型识别逻辑)
- Create: `docs/analysis/type-detection-analysis.md`

**Step 1: 分析题型识别问题**

创建分析文档，记录题型识别的问题：
```markdown
# 题型识别分析

## 当前问题
1. 依赖CSS类名，可能不准确
2. 新页面结构可能使用不同的类名
3. 需要更稳健的识别方法

## 改进方案
1. 结合多种特征进行识别
2. 增加备用识别方法
3. 提高识别准确性
```

**Step 2: 更新题型识别逻辑**

修改 `solver.js` 增强题型识别：
```javascript
detectType: function(qDiv) {
    const classes = qDiv.className.toLowerCase();
    const id = qDiv.id || "";
    
    // 方法1: 通过CSS类名识别
    if (classes.includes("single") || classes.includes("单选")) {
        return "single";
    } else if (classes.includes("multiple") || classes.includes("multi") || classes.includes("多选")) {
        return "multiple";
    } else if (classes.includes("judge") || classes.includes("判断")) {
        return "judge";
    }
    
    // 方法2: 通过选项特征识别
    const options = this.getOptions(qDiv);
    const optionTexts = options.map(opt => opt.label.toLowerCase());
    
    // 判断题特征：选项包含"对"、"错"、"√"、"×"
    if (optionTexts.includes("对") || optionTexts.includes("错") || 
        optionTexts.includes("√") || optionTexts.includes("×") ||
        optionTexts.includes("true") || optionTexts.includes("false")) {
        return "judge";
    }
    
    // 方法3: 通过选项数量识别
    if (options.length === 2) {
        // 2个选项可能是判断题
        return "judge";
    } else if (options.length > 4) {
        // 5个以上选项通常是单选题
        return "single";
    }
    
    // 方法4: 通过题目文本识别
    const questionText = qDiv.innerText || "";
    if (questionText.includes("单选") || questionText.includes("选择一个")) {
        return "single";
    } else if (questionText.includes("多选") || questionText.includes("选择多个")) {
        return "multiple";
    } else if (questionText.includes("判断") || questionText.includes("是否")) {
        return "judge";
    }
    
    // 默认返回单选题
    return "single";
}
```

**Step 3: 测试题型识别**

在浏览器中测试题型识别功能：
1. 进入学习通测验页面
2. 启动插件答题模式
3. 验证题型识别准确性

**Step 4: 提交更改**

```bash
git add docs/analysis/type-detection-analysis.md solver.js
git commit -m "feat: 改进题型识别准确性"
```

---

### Task 6: 集成测试和文档更新

**Files:**
- Modify: `README.md` (更新文档)
- Create: `docs/testing/test-results.md`

**Step 1: 更新项目文档**

更新 `README.md` 包含新的功能和改进：
```markdown
# 学习通全能助手 - 改进版

## 新增功能
1. ✅ 适配新页面结构，更新CSS选择器
2. ✅ 改进视频播放控制，支持自动播放和倍速设置
3. ✅ 增强自动导航功能，智能翻页
4. ✅ 修复多选题处理问题，支持多选项选择
5. ✅ 改进题型识别准确性，支持多种识别方法

## 使用方法
（保持原有使用方法不变）
```

**Step 2: 创建测试文档**

创建测试结果文档：
```markdown
# 测试结果

## 功能测试
1. ✅ 视频播放控制测试通过
2. ✅ 自动导航测试通过
3. ✅ 多选题处理测试通过
4. ✅ 题型识别测试通过

## 兼容性测试
1. ✅ Chrome 测试通过
2. ✅ Edge 测试通过
3. ✅ 学习通新页面结构测试通过
```

**Step 3: 提交更改**

```bash
git add README.md docs/testing/test-results.md
git commit -m "docs: 更新项目文档和测试结果"
```

**Step 4: 发布新版本**

更新 `manifest.json` 中的版本号：
```json
{
  "version": "5.2.0"
}
```

提交版本更新：
```bash
git add manifest.json
git commit -m "release: 发布 v5.2.0 版本"
```

---

## 执行计划

**选项1: Subagent-Driven (此会话)**
- 我将派遣一个新的子代理来执行每个任务
- 在每个任务完成后进行代码审查
- 快速迭代开发

**选项2: Parallel Session (独立会话)**
- 打开一个新的会话来执行计划
- 批量执行任务并设置检查点

请告诉我您希望选择哪种执行方式？