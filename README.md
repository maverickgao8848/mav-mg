# Knowledge MG

**中文** · [English](README.en.md) · [下载公开版 Skill](https://github.com/maverickgao8848/mav-mg/releases/download/v0.1.0-preview.16/knowledge-mg-0.1.0-preview.16.zip) · [Skill 入口](SKILL.md)

**把中文讲解文稿变成可编辑的知识型 MG 动画。** 从文稿梳理教学重点，选择视觉风格，制作逐句可见的机制演示，最终交给 HyperFrames 预览与渲染。

![六种视觉方向的实际预览帧](assets/showcase/style-gallery.jpg)

## 直接看图选风格

以下图片来自实际 HyperFrames 预览帧。**公开版可直接使用 Cobalt Grid 和 Editorial Forest；其余四种仅展示，不包含可应用的风格规范或素材包。** 点击公开风格图片可查看完整 `FRAME.md`。

<table>
<tr>
<td width="50%"><a href="assets/styles/cobalt-grid/FRAME.md"><img src="assets/showcase/styles/cobalt-grid.jpg" alt="Cobalt Grid 预览" width="480"></a><br><b>Cobalt Grid · 公开可用</b><br>研究、数据、系统解释<br><code>cobalt-grid</code></td>
<td width="50%"><a href="assets/styles/editorial-forest/FRAME.md"><img src="assets/showcase/styles/editorial-forest.jpg" alt="Editorial Forest 预览" width="480"></a><br><b>Editorial Forest · 公开可用</b><br>自然、材料、生活科学<br><code>editorial-forest</code></td>
</tr>
<tr>
<td width="50%"><img src="assets/showcase/styles/opencode.jpg" alt="Open Code 预览" width="480"><br><b>Open Code · 展示</b><br>终端、软件、数字机制</td>
<td width="50%"><img src="assets/showcase/styles/gable-reed.jpg" alt="Gable & Reed 预览" width="480"><br><b>Gable & Reed · 展示</b><br>工程、结构、技术图解</td>
</tr>
<tr>
<td width="50%"><img src="assets/showcase/styles/dell-1996.jpg" alt="Dell 1996 预览" width="480"><br><b>Dell 1996 · 展示</b><br>复古科技、索引、互联网文化</td>
<td width="50%"><img src="assets/showcase/styles/broadside.jpg" alt="Broadside 预览" width="480"><br><b>Broadside · 展示</b><br>强观点、海报、大字节奏</td>
</tr>
</table>

后续付费包计划提供完整风格集合与一步一步使用指南。当前未开放购买；上面的展示风格也没有隐藏的公开下载入口。

## 开始使用

1. 下载顶部 ZIP 并解压，把 `knowledge-mg` 文件夹放到 `~/.codex/skills/`，或放到项目的 `.agents/skills/`。
2. 安装 Node.js 和 HyperFrames。若要生成旁白，还需准备项目选用的语音工具。
3. 在 Codex 中提供中文文稿或带时间码的讲解材料，说明目标时长和风格。例如：

```text
用 knowledge-mg 把这段中文讲解做成知识型 MG。
风格用 cobalt-grid，制作模式用 standard。
先确认教学重点和分镜，再构建可编辑的 HyperFrames 工程。
```

从 Skill 文件夹运行风格应用工具：

```powershell
node scripts/apply-style.mjs --style cobalt-grid --project <项目目录>
```

`editorial-forest` 也可作为 `--style` 值。工具会核对资源哈希，将规范写入项目 `frame.md`，并复制参考图。已有项目风格发生冲突时，先在项目中确认最终版本。

## 当前支持边界

本包是技术预览版，面向 **1920×1080、30 fps 的中文知识讲解**。支持普通文稿、固定时间码和参考时间码；可生成可编辑、可任意时间定位的 HyperFrames 工程。`advanced` 模式有模型前置条件，详见 [输入契约](references/input-contract.md)。完整支持范围、验证长度和已知质量缺口以 [技术预览边界](references/release-scope.md) 为准。每个新主题仍需按实际预览检查可读性、遮挡和运动节奏。

## 许可与商业使用

本仓库代码和公开资源按 [PolyForm Noncommercial License 1.0.0](LICENSE) 发布。商业用途需要单独授权；素材自身的来源和授权信息请同时查看对应 metadata。未来付费包的内容和授权以正式发布说明为准。
