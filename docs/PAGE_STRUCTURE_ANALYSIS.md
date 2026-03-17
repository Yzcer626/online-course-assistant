# 学习通页面结构分析

## 页面文件分析

通过分析 `学生学习页面.html` 和 `学生学习页面_files` 目录中的文件，我发现了学习通的实际页面结构：

### 1. 主页面结构 (`学生学习页面.html`)

**关键发现**：
- 页面包含 `#iframe` 元素（第1688行）
- iframe src 指向 `./学生学习页面_files/cards.html`
- 页面使用 JavaScript 动态加载内容

### 2. iframe 内容 (`cards.html`)

**关键发现**：
- 这是章节测验页面（`<title>章节测验</title>`）
- 题目容器：`#topicList`、`#topicType`、`#topicContent`
- 但实际题目内容可能通过 JavaScript 动态加载

### 3. 作业页面 (`work.html`)

**关键发现**：
- 这是实际的作业/测验页面（`<title>做作业</title>`）
- **题目容器**：`.TiMu` 类（第46行、第513行、第559行）
- **选项结构**：
  - 选项容器：`.num_option_dx` 类
  - 选项数据属性：`data="A"`、`data="B"` 等
  - 选项名称：`name="answercheckxxxx"`
- **提交按钮**：
  - 文本：`<span title="">提交</span>`（第611行）
  - 函数：`form1submit()`（第685行）

## 更新的插件选择器

### 1. 题目容器选择器
**原选择器**：
```javascript
".questionLi, .singleQuesId, .TiMu, .question-item, .q-item, .TiMu2, .question_div, .ques-item"
```

**新选择器**：
```javascript
".TiMu, .questionLi, .singleQuesId, .question-item, .q-item, .TiMu2, .question_div, .ques-item"
```

**原因**：根据 `work.html` 分析，`.TiMu` 是学习通的主要题目容器类。

### 2. 选项选择器
**原选择器**：
```javascript
".answerBg, li, .singleChoose, .multiChoose, .option-item, .choice-item"
```

**新选择器**：
```javascript
".num_option_dx, .num_option"  // 优先使用
// 备用选择器
".answerBg, li, .singleChoose, .multiChoose, .option-item, .choice-item"
```

**原因**：根据 `work.html` 分析，学习通使用 `.num_option_dx` 类作为选项容器。

### 3. 提交按钮选择器
**原选择器**：
```javascript
"button[type='submit']", "input[type='submit']", ".submitBtn", "#submit", "#submitAnswer", ".next", ".btn-submit", ".answer-submit"
```

**新选择器**：
```javascript
"button[type='submit']", "input[type='submit']", ".submitBtn", "#submit", "#submitAnswer", ".next", ".btn-submit", ".answer-submit", ".btnSave", "span:contains('提交')"
```

**新增**：
- `.btnSave` - 学习通的保存/提交按钮
- 文本匹配 - 查找包含"提交"文本的元素

## 学习通测验流程

根据页面文件分析，学习通的测验流程如下：

1. **视频学完** → 插件检测到无视频任务
2. **跳转下一页** → 进入章节测验页面（`cards.html`）
3. **加载作业页面** → 实际题目在 `work.html` 中
4. **自动答题** → 识别 `.TiMu` 容器中的题目
5. **选择选项** → 点击 `.num_option_dx` 元素
6. **提交答案** → 点击包含"提交"文本的按钮
7. **等待批阅** → 系统自动批阅
8. **跳转下一个视频** → 系统自动跳转

## 插件加载问题

从控制台输出来看，插件确实在运行，但有语法错误：
```
solver.js:1 Uncaught SyntaxError: Identifier 'KEYS' has already been declared
```

**已修复**：移除了 `solver.js` 中的 `KEYS` 重复声明。

## 下一步测试

1. **重新加载插件**：在浏览器扩展管理页重新加载插件
2. **测试题目检测**：
   - 进入学习通测验页面
   - 在控制台运行：`document.querySelectorAll('.TiMu').length`
   - 应该返回大于0的数字
3. **测试选项检测**：
   - 在控制台运行：`document.querySelectorAll('.num_option_dx').length`
   - 应该返回大于0的数字
4. **实际测试流程**：
   - 进入课程页面
   - 启动刷课模式
   - 观察是否正常自动播放视频
   - 视频完成后观察是否进入测验模式
   - 验证是否自动识别题目并选择选项
   - 验证是否自动点击提交按钮

## 文件变更总结

### 修改的文件
- `solver.js` - 更新题目容器、选项、提交按钮选择器

### 新增的分析文档
- `docs/PAGE_STRUCTURE_ANALYSIS.md` - 页面结构分析文档

---

**基于学习通页面文件的分析，插件选择器已更新，应该能够正确识别题目和选项。**