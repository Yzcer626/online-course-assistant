# ✅ 插件文件完整性检查

## 必须存在的文件（9个）

- [x] manifest.json
- [x] main.js
- [x] ui.js
- [x] utils.js
- [x] solver.js
- [x] video.js
- [x] doc.js
- [x] pagination.js
- [x] README.md

## 可选文件夹

- [ ] icons/ （可以空着，插件用默认图标）

---

## 📦 安装方式

### 方式1：直接加载文件夹（推荐）

1. 打开 Edge 扩展管理页：`edge://extensions/`
2. 开启左下角 **"开发者模式"**
3. 点击顶部 **"加载已解压的扩展程序"**
4. 选择文件夹：`D:\Autoclaw\xuexitong_addon_fast`
5. 如果显示"成功"，说明插件可用了！

### 方式2：打包成ZIP

1. 全选 `xuexitong_addon_fast` 文件夹内所有文件
2. 右键 → 发送到 → 压缩(zipped)文件夹
3. 重命名为 `xuexitong_addon_fast.zip`
4. 在扩展页点击 **"打包扩展程序"**，选择这个文件夹

---

## ⚠️ 如果还是报错

### 错误1："无法解压" 或 "清单文件缺失"
- 检查是否选了**文件夹**而不是某个js文件
- 确认 `manifest.json` 在文件夹**根目录**

### 错误2："清单文件未找到"
- 检查文件名是不是 `manifest.json`（不是 manifest.js）
- 确认文件编码是UTF-8（无BOM）

### 错误3："图标文件不存在"（如果残留ics配置）
- 确保 manifest.json 中没有 `"icons":` 字段
- 或添加任意PNG图标到 `icons/` 文件夹

---

## ✅ 当前状态

所有文件已准备就绪，`manifest.json` 已移除图标配置，可直接加载。

文件夹路径：`D:\Autoclaw\xuexitong_addon_fast\`

---

## 🎮 使用步骤

1. 加载插件后，进入学习通页面
2. 右上角出现插件面板（初始在右上角）
3. 点击 **📺 刷课** → **▶ 一键完成页面任务**（自动刷视频+自动翻页）
4. 或有题目时自动切换到 **⚡ 答题** → **⚡ 开始乱选**（自动随机选题）

---

**已完工，请尝试加载！如仍有问题，截图 error 消息给我。** 🦞