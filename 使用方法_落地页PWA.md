# 司机端落地页 PWA 部署教程（方案 B：GitHub Pages 免费托管，无提示条 + 全屏 App）

## 这套东西解决什么

| 直接用 Apps Script 链接 | 用这套落地页 |
|---|---|
| 顶部有 Google 蓝色提示条 | ✅ 提示条被遮住 |
| 浏览器地址栏一直占位置 | ✅ 添加到桌面后全屏，无地址栏 |
| 看着像网页 | ✅ 像 App，桌面有橙色油泵图标 |

**原理**：GitHub Pages 上放一个页面，用 iframe 把司机端嵌进去，iframe 整体**向上偏移**把 Google 提示条顶出屏幕外；再加 PWA 配置（manifest + service worker），司机"添加到主屏幕"后变全屏 App。

> GitHub Pages 免费、自带 **HTTPS**、不用买服务器。想用自己的品牌域名（如 fuel.vitalflow.com）也可以免费绑上去（见文末）。

---

## 前提条件

- 你的 Apps Script 系统已经能正常使用（司机端 / 后台）
- 一个 **GitHub 账号**（免费注册 github.com）
- ⚠️ **必须 HTTPS**（GitHub Pages 默认就是 HTTPS，无需操心）

---

## 文件清单（7 个，全部上传）

| 文件 | 作用 |
|---|---|
| `index.html` | 主页面（全屏 iframe）|
| `manifest.webmanifest` | PWA 配置（名称 / 图标 / 全屏）|
| `sw.js` | 离线缓存 |
| `icon-192.png` | 图标 192×192 |
| `icon-512.png` | 图标 512×512 |
| `icon-maskable-512.png` | 安卓自适应图标 |
| `.nojekyll` | 空文件，让 GitHub Pages 跳过 Jekyll 构建（必须）|

---

## 步骤一：更新 Code.gs 并重新部署（最关键，漏了会白屏）

Google 默认**禁止**自己的页面被别的网站 iframe 嵌入。新版 Code.gs 已加了允许嵌入的代码，你必须覆盖并重新部署：

1. 打开 Apps Script 项目 → `Code.gs`
2. **Ctrl+A 全选 → 删光 → 粘贴新的 Code.gs → Ctrl+S**
3. **部署 → 管理部署 → 编辑 → 版本选「新版本」→ 部署**

> ❗ 不做这步，落地页打开会一片空白或提示"拒绝连接"。

---

## 步骤二：改 index.html 里的两个网址

用**记事本**（不是浏览器）打开 `index.html`，找到开头这段：

```js
var APPS = {
  driver: 'PASTE_YOUR_DRIVER_URL_HERE',   /* ← 司机端（?page=driver） */
  admin:  'PASTE_YOUR_ADMIN_URL_HERE'     /* ← 后台（?page=admin），可留空 */
};
```

把 `PASTE_YOUR_DRIVER_URL_HERE` 换成你部署后的司机端网址，例如：

```js
var APPS = {
  driver: 'https://script.google.com/macros/s/AKfycbxxxxxxxxxxxx/exec?page=driver',
  admin:  'https://script.google.com/macros/s/AKfycbxxxxxxxxxxxx/exec?page=admin'
};
```

- 网址从 Apps Script「部署 → 网页应用」那里复制（结尾是 `/exec`）
- 司机端带 `?page=driver`，后台带 `?page=admin`，两个只差最后 `page=` 那段

---

## 步骤三：上传到 GitHub Pages（网页操作，不用装任何软件）

1. 登录 github.com → 右上角 **+** → **New repository**
2. 仓库名填 `fuel-log`（小写英文）→ 选 **Public**（免费 Pages 只能用 Public）→ **Create repository**
3. 进入新仓库 → 点 **uploading an existing file**（或 Add file → Upload files）
4. 把 **7 个文件全部拖进去**（index.html、manifest、sw.js、3 个图标、.nojekyll）→ **Commit changes**
5. 点仓库顶部 **Settings** → 左侧 **Pages**
6. **Branch** 选 `main`、目录选 `/ (root)` → **Save**
7. 等 1~2 分钟，页面顶部会显示：
   ```
   Your site is live at https://你的用户名.github.io/fuel-log/
   ```
8. 手机浏览器打开这个网址，确认能看到司机端表单，且**顶部没有蓝色提示条**。

> 小提示：Windows 看不到 `.nojekyll` 文件？没关系，它存在即可。上传时如果系统提示"隐藏文件"，直接拖进去就行。

---

## 步骤四：司机添加到手机桌面

**Android（Chrome）**
1. 手机 Chrome 打开你的 GitHub Pages 网址
2. 右上角三点 → 「添加到主屏幕」或「安装应用」
3. 桌面出现橙色油泵图标，点开即全屏，无地址栏

**iPhone（Safari）**
1. **必须用 Safari 打开**（Chrome 不行）
2. 底部「分享」→ 「添加到主屏幕」
3. 桌面出现图标，点开全屏

---

## 步骤五：微调（提示条露出 / 底部按钮被切时）

不同手机提示条高度不同。网址后加参数实时试：

```
你的网址/?bar=70
```

把 70 换成 40 / 50 / 60 / 70 / 80，看哪个最完美：
- **蓝色提示条还露出一点** → 数字调**大**
- **橙色顶栏被切掉一截** → 数字调**小**

试出最佳值后，记事本打开 `index.html`，改：

```css
:root{ --bar:60px; --brand:#e65100 }
```

把 `60px` 改成试出的数字 → 保存 → 回 GitHub 重新上传这个文件覆盖（Add file → Upload files → 选同名的 index.html → Commit）。

---

## 绑定自己的品牌域名（可选，推荐）

想用 `fuel.vitalflow.com` 这类域名，免费绑到 GitHub Pages：

1. 你的域名 DNS 里加一条 **CNAME** 记录：
   - 主机：`fuel`（或你要的子域名）
   - 指向：`你的用户名.github.io`
2. GitHub 仓库 → Settings → Pages → **Custom domain** 填 `fuel.vitalflow.com` → Save
3. 勾选 **Enforce HTTPS**（等证书签发，约几分钟到几小时）

绑定后司机访问的就是你的品牌网址，更像正规 App。

---

## 常见问题

**Q：落地页空白 / 显示"拒绝连接"**
A：Code.gs 没更新或没部署新版本。回步骤一。

**Q：能看到页面，但蓝色提示条还在**
A：调 `?bar=` 参数（步骤五）。

**Q：提交按钮点不到 / 底部被切**
A：`bar` 值太大，改小。

**Q：GitHub Pages 没生效 / 404**
A：等 1~2 分钟；确认 Branch 选了 `main`、目录 `/ (root)`；确认文件确实 Commit 进仓库了。

**Q：添加到桌面后打开还是旧样子**
A：删旧图标 → 清浏览器缓存 → 重新打开网址 → 再添加。

**Q：离线能用吗？**
A：外壳页面能离线打开，但表单内容需要联网（数据在 Google 表格）。离线时底部显示红色提示，联网后自动恢复。

**Q：后台也能做成 App 吗？**
A：能。`index.html` 里填了 admin 网址后，访问 `你的网址/?p=admin` 就是后台，可再添加一个桌面图标指向它。

**Q：想换图标颜色/图案？**
A：改 pwa 包里的 `_make_icons.py`（改 `BRAND` 颜色），本地跑 `python3 _make_icons.py` 重新生成 3 个图标。不会的话直接告诉我你要的颜色，我帮你重做。

---

## 结构示意

```
https://你的用户名.github.io/fuel-log/   (GitHub Pages, HTTPS)
├── index.html          ← 全屏容器
├── manifest.webmanifest ← PWA 配置（图标 / 全屏）
├── sw.js               ← 离线缓存
├── icon-192.png / icon-512.png / icon-maskable-512.png
├── .nojekyll
└── iframe → script.google.com/.../exec?page=driver
             (向上偏移，Google 提示条被顶出屏幕外)

司机手机：桌面图标 → 全屏打开 → 只见橙色顶栏 + 表单，无地址栏、无提示条
```
