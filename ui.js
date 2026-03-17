// ui.js - 界面管理 (v5.2 速刷精简版)

const UI = {
    config: {
        id: "cx-dashboard",
        width: "230px",
        headerColor: "#3f51b5",
        zIndex: "99999999"
    },

    styles: {
        container: `position: fixed; top: 10px; right: 20px; width: 230px; background: #fff; box-shadow: 0 4px 15px rgba(0,0,0,0.2); border-radius: 8px; z-index: 99999999; font-family: sans-serif; font-size: 13px; border: 1px solid #ddd; overflow: hidden;`,
        header: `background: #3f51b5; color: white; padding: 10px; text-align: center; font-weight: bold; cursor: move; user-select: none; display: flex; justify-content: space-between; align-items: center;`,
        body: `padding: 15px; transition: all 0.3s ease;`,
        btnBase: `width: 100%; margin-bottom: 8px; border: none; padding: 8px; cursor: pointer; border-radius: 4px; font-weight: bold;`,
        btnCollapse: `cursor: pointer; padding: 0 8px; font-size: 16px; line-height: 1; opacity: 0.8; transition: opacity 0.2s;`,
        tabContainer: `display: flex; background: #f0f0f0; border-bottom: 1px solid #ddd;`,
        tabBtn: `flex: 1; text-align: center; padding: 8px 0; cursor: pointer; font-size: 12px; font-weight: bold; color: #666; transition: background 0.2s;`,
        tabActive: `background: #fff; color: #3f51b5; border-bottom: 2px solid #3f51b5;`
    },

    inject: function() {
        if (window.self !== window.top || document.getElementById(this.config.id)) return;
        const div = document.createElement("div");
        div.id = this.config.id;
        div.style.cssText = this.styles.container;
        div.innerHTML = this.renderTemplate();
        document.body.appendChild(div);

        this.bindEvents(div);
        this.makeDraggable(div);
        this.restoreState();
    },

    renderTemplate: function() {
        return `
            <div id="cx-header" style="${this.styles.header}">
                <span style="flex:1; padding-left:14px;">🤖 学习通助手 v5.1 速刷版</span>
                <span id="btn-collapse" style="${this.styles.btnCollapse}" title="折叠/展开">➖</span>
            </div>
            
            <div id="cx-tabs" style="${this.styles.tabContainer}">
                <div id="tab-learn" class="cx-tab" style="${this.styles.tabBtn}">📺 刷课</div>
                <div id="tab-answer" class="cx-tab" style="${this.styles.tabBtn}">⚡ 答题</div>
            </div>

            <div id="cx-body" style="${this.styles.body}">
                <div id="cx-status" style="margin-bottom:10px; text-align:center; color:#666; font-weight:bold;">就绪</div>
                
                <div id="panel-learn" style="display:none;">
                    <div style="font-size:12px; color:#9C27B0; margin-bottom:5px; font-weight:bold;">▶ 智能排队刷课配置</div>
                    <select id="speed-select" style="width:100%; padding:5px; margin-bottom:8px; border:1px solid #eee;">
                        <option value="1">1.0x 正常速度</option>
                        <option value="1.25">1.25x 加速</option>
                        <option value="1.5">1.5x 加速</option>
                        <option value="2" selected>2.0x 极速 (默认)</option>
                    </select>
                    <button id="btn-learn-toggle" style="${this.styles.btnBase} background:#9C27B0; color:white; margin-bottom:5px;">▶ 一键完成页面任务</button>
                    <div style="font-size:11px; color:#666; text-align:center; margin-bottom:10px;">提示：开启后将自动按顺序识别并完成视频与PPT</div>
                </div>

                <div id="panel-answer" style="display:none;">
                    <button id="btn-run" style="${this.styles.btnBase} background:#E91E63; color:white; margin-bottom:10px;">⚡ 开始乱选</button>
                    <div id="answer-mode" style="font-size:11px; color:#666; text-align:center; margin-bottom:10px;">无题库模式：每题随机选1个选项</div>
                </div>

                <div style="border-top:1px solid #eee; padding-top:10px; display:flex; gap:5px;">
                    <button id="btn-clear" style="width:100%; background:#f44336; color:white; border:none; padding:6px; cursor:pointer; border-radius:4px; font-size:12px;">🗑️ 清空所有缓存数据</button>
                </div>
            </div>
        `;
    },

    bindEvents: function(div) {
        const get = (id) => div.querySelector(`#${id}`);

        get('btn-collapse').onclick = (e) => { e.stopPropagation(); this.toggleCollapse(div); };
        get('speed-select').onchange = (e) => State.set({ [KEYS.VIDEO_SPEED]: parseFloat(e.target.value) });

        // 导航栏点击事件
        get('tab-learn').onclick = () => State.set({ [KEYS.IS_LEARN_MODE]: true }, () => this.updateState());
        get('tab-answer').onclick = () => State.set({ [KEYS.IS_LEARN_MODE]: false }, () => this.updateState());

        // 功能开关事件
        get('btn-run').onclick = () => {
            State.get(m => { 
                State.set({ [KEYS.IS_ANSWERING]: !m[KEYS.IS_ANSWERING] }, () => this.updateState()); 
            });
        };
        // 智能排队开关
        get('btn-learn-toggle').onclick = () => {
            State.get(m => { State.set({ [KEYS.IS_LEARN_RUNNING]: !m[KEYS.IS_LEARN_RUNNING] }, () => this.updateState()); });
        };

        get('btn-clear').onclick = () => {
            if(confirm("确定要清空所有数据吗？")) {
                State.set({ 
                    [KEYS.IS_ANSWERING]: false, 
                    [KEYS.IS_LEARN_RUNNING]: false 
                }, () => {
                    this.updateState(); 
                    alert("缓存已清空"); 
                });
            }
        };
    },

    toggleCollapse: function(div) {
        const body = div.querySelector("#cx-body");
        const tabs = div.querySelector("#cx-tabs");
        const btn = div.querySelector("#btn-collapse");
        if (body.style.display === "none") { 
            body.style.display = "block";
            tabs.style.display = "flex";
            btn.innerText = "➖"; 
        } else { 
            body.style.display = "none";
            tabs.style.display = "none";
            btn.innerText = "➕"; 
        }
    },

    makeDraggable: function(element) {
        const header = element.querySelector("#cx-header");
        let isDragging = false, startX, startY, initialLeft, initialTop;

        header.addEventListener("mousedown", (e) => {
            if (e.target.id === "btn-collapse") return;
            isDragging = true; startX = e.clientX; startY = e.clientY;
            const rect = element.getBoundingClientRect(); initialLeft = rect.left; initialTop = rect.top;
            element.style.right = "auto"; element.style.bottom = "auto"; element.style.left = initialLeft + "px"; element.style.top = initialTop + "px";
            e.preventDefault();
        });
        document.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            element.style.left = (initialLeft + (e.clientX - startX)) + "px";
            element.style.top = (initialTop + (e.clientY - startY)) + "px";
        });
        document.addEventListener("mouseup", () => isDragging = false);
    },

    updateState: function() {
        State.get(m => {
            const pAnswer = document.querySelector("#panel-answer"), pLearn = document.querySelector("#panel-learn");
            const btnRun = document.querySelector("#btn-run"), btnLearn = document.querySelector("#btn-learn-toggle");
            const status = document.querySelector("#cx-status");
            
            const tabLearn = document.querySelector("#tab-learn"), tabAnswer = document.querySelector("#tab-answer");

            if(!tabLearn) return;

            tabLearn.style.cssText = this.styles.tabBtn; tabAnswer.style.cssText = this.styles.tabBtn;

            let isLearnUI = m[KEYS.IS_LEARN_MODE];
            
            // 默认展示刷课面板
            if (isLearnUI === undefined) { isLearnUI = true; }

            if (isLearnUI) {
                tabLearn.style.cssText = this.styles.tabBtn + this.styles.tabActive;
                pAnswer.style.display = "none"; pLearn.style.display = "block";
                
                if (m[KEYS.IS_LEARN_RUNNING]) { 
                    btnLearn.innerText = "🛑 停止刷课"; btnLearn.style.background = "#999"; 
                    status.innerText = "🚀 自动排队执行任务中..."; status.style.color = "#9C27B0";
                } else { 
                    btnLearn.innerText = "▶ 一键完成页面任务"; btnLearn.style.background = "#9C27B0"; 
                    status.innerText = "准备就绪"; status.style.color = "#666";
                }
            } else {
                tabAnswer.style.cssText = this.styles.tabBtn + this.styles.tabActive;
                pAnswer.style.display = "block"; pLearn.style.display = "none";
                
                if (m[KEYS.IS_ANSWERING]) { 
                    status.innerText = "⚡ 乱选中..."; status.style.color = "#E91E63"; 
                    btnRun.innerText = "🛑 停止乱选"; btnRun.style.background = "#999";
                } else { 
                    status.innerText = "准备就绪"; status.style.color = "#666"; 
                    btnRun.innerText = "⚡ 开始乱选"; btnRun.style.background = "#E91E63";
                }
            }

            if (m[KEYS.VIDEO_SPEED]) document.querySelector("#speed-select").value = m[KEYS.VIDEO_SPEED];
        });
    },

    restoreState: function() { this.updateState(); }
};