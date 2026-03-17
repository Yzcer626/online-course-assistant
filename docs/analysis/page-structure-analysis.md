# 页面结构分析

## 视频任务容器
- 选择器：`.ans-cc iframe, iframe[module]`
- 数据属性：`data` (JSON格式包含jobid)
- 新增选择器：`.video-container iframe` (适配新页面结构)

## 题目容器
- 选择器：`.questionLi, .singleQuesId, .TiMu`
- 新增选择器：`.question-item, .q-item` (适配新页面结构)
- 已批阅标记：`.fontLabel, .marking_dui, .marking_cuo`

## 提交按钮
- 选择器：`button[type='submit'], .submitBtn, #submitAnswer`
- 新增选择器：`.submit-btn, .answer-submit` (适配新页面结构)

## 页面导航
- 下一节按钮：`.prev_next.next, .nextChapter, #prevNextFocusNext`
- 章节加载：`getTeacherAjax()` 函数
- 章节导航：`PCount.next()` 和 `PCount.previous()` 函数

## 视频播放
- 播放器：video.js
- 控制方式：通过iframe contentWindow.postMessage
- 倍速设置：`playbackRate()` 方法

## 数据结构
- 任务数据：JSON格式存储在iframe的data属性中
- jobId提取：`jobid`, `jobId`, `_jobid`, `attachment.jobid`
- 页面状态：通过Chrome Storage API存储