# MAV-MG

**中文** · [English](README.en.md) · [下载公开版 Skill](https://github.com/maverickgao8848/mav-mg/releases/download/v0.1.0-preview.19/mav-mg-0.1.0-preview.19.zip) · [下载原版视频](https://github.com/maverickgao8848/mav-mg/releases/download/v0.1.0-preview.18/bank-run-v3-music.mp4) · [Skill 入口](SKILL.md)

**把中文讲解文稿变成可编辑的知识型 MG 动画。** 从文稿梳理教学重点，选择视觉风格，制作逐句可见的机制演示，最终交给 HyperFrames 预览与渲染。

https://github.com/user-attachments/assets/257d441e-305a-428f-a1b9-2fbf370635a9

**样例视频：**《银行挤兑》v3 音乐版，70.7 秒，1920×1080、30 fps。可在此页直接播放；顶部链接可下载原版。

## 直接看图选风格

以下是实际 HyperFrames 预览帧与风格参考图。**公开版只包含 Cobalt Grid 和 Editorial Forest 两种风格。** 点击图片可查看完整 `FRAME.md`。展示图用于辨认视觉方向，不代表新主题的生成结果或事实内容。

<table>
<tr>
<td width="50%"><a href="assets/styles/cobalt-grid/FRAME.md"><img src="assets/showcase/styles/cobalt-grid.jpg" alt="Cobalt Grid 预览" width="480"></a><br><b>Cobalt Grid · 公开可用</b><br>研究、数据、系统解释<br><code>cobalt-grid</code></td>
<td width="50%"><a href="assets/styles/editorial-forest/FRAME.md"><img src="assets/showcase/styles/editorial-forest.jpg" alt="Editorial Forest 预览" width="480"></a><br><b>Editorial Forest · 公开可用</b><br>自然、材料、生活科学<br><code>editorial-forest</code></td>
</tr>
</table>

其他风格保留在付费版，不随公开仓库或下载包提供。当前未开放购买。

## 开始使用

1. 下载顶部 ZIP 并解压，把 `mav-mg` 文件夹放到 `~/.codex/skills/`，或放到项目的 `.agents/skills/`。
2. 安装 Node.js 和 HyperFrames。推荐使用 **`gpt-6-sol` 或更强的 GPT-6 模型**；`advanced` 模式还须满足[输入契约](references/input-contract.md)中的模型确认要求。若要生成旁白，还需准备项目选用的语音工具。
3. 在 Codex 中提供中文文稿或带时间码的讲解材料，说明目标时长和风格。例如：

```text
用 mav-mg 把这段中文讲解做成知识型 MG。
风格用 cobalt-grid，制作模式用 standard。
先确认教学重点和分镜，再构建可编辑的 HyperFrames 工程。
```

从 Skill 文件夹运行风格应用工具：

```powershell
node scripts/apply-style.mjs --style cobalt-grid --project <项目目录> --mode advanced
```

`editorial-forest` 也可作为 `--style` 值；`--mode` 可选 `standard` 或 `advanced`。Cobalt Grid 的两种模式分别使用各自的七张参考图。工具会核对资源哈希，将规范写入项目 `frame.md`，并复制所选参考图。已有项目风格发生冲突时，先在项目中确认最终版本。

## 当前支持边界

本包是技术预览版，面向 **1920×1080、30 fps 的中文知识讲解**。支持普通文稿、固定时间码和参考时间码；可生成可编辑、可任意时间定位的 HyperFrames 工程。`advanced` 模式有模型前置条件，详见 [输入契约](references/input-contract.md)。完整支持范围、验证长度和已知质量缺口以 [技术预览边界](references/release-scope.md) 为准。每个新主题仍需按实际预览检查可读性、遮挡和运动节奏。

## 许可与商业使用

本仓库代码和公开资源按 [PolyForm Noncommercial License 1.0.0](LICENSE) 发布。商业用途需要单独授权；素材自身的来源和授权信息请同时查看对应 metadata。未来付费包的内容和授权以正式发布说明为准。
