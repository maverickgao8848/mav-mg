# 技术预览版支持边界

本文件是 `mav-mg` 当前源码版本支持能力与限制的唯一权威来源；版本号由 [SKILL.md](../SKILL.md) 的 `metadata.version` 定义。

## 支持

- 中文教学 MG，画布为 1920×1080，帧率为 30 fps。
- 普通文稿生成旁白、fixed cues、reference cues 三种输入时间模式。
- 本地 Kokoro 中文配音。
- 逐 frame 图片参考。
- 可编辑、确定性、seek-safe 的 HyperFrames 工程，包含字幕与项目专用语义 SVG。
- 先选风格、再选 `standard | advanced` 的双制作模式；高级模式仅在宿主运行时确认 GPT-6 后开始，具体选择契约见 [input-contract.md](input-contract.md)，制作策略见 [visual-grammar.md](visual-grammar.md)。
- 可用关系组件由 [`assets/components/collection.json`](../assets/components/collection.json) 的 `allowed` 集合唯一定义；各组件的语义、容量、阶段与证据只见对应 `metadata.json`。
- 本公开包仅包含 Editorial Forest 与 Cobalt Grid 两套可应用风格。Cobalt Grid 按模式加载各自的七张参考图；Editorial Forest 的两种模式使用同一组参考图。共用幂等应用工具和各包验证边界见 [style-contract.md](style-contract.md)。
- 五个开放许可 SVG 原件及单项导入工具；来源、许可和语义使用方式见 [svg-library.md](svg-library.md)。

## 验证边界

- 连续空间运镜由 motion-direction 统一定义。preview.13 的 32 秒样片验证了共享场地、复合平移缩放、浅透视、资料聚合、层级交接、正常播放与任意时刻 seek；真实三维环绕、dolly zoom 等仍需按项目验证，词汇存在不代表现成组件或艺术批准。

- **300 秒工程/Studio 预览已验证**：覆盖连续播放与任意时间 seek；这是工程和 Studio 预览证据，不是五分钟渲染证据。
- **实际渲染仅验证至 81.3 秒**：已验证规格为 H.264/AAC、1920×1080、30 fps。
- Editorial Forest 已完成同内容移植及一个 68.514 秒新主题的工程/Studio 预览验证。用户接受新主题时保留了元素偶发重叠的缺陷；获选方向和该个案均不代表后续作品自动通过艺术验收。
- Editorial Forest 双模式已用同一段 17.181 秒输入完成工程/Studio 验证；高级版获用户艺术批准。该批准只绑定该短片版本，不扩展为普通版批准、模式投入结论、长片完成度或其他主题的自动艺术批准。
- Cobalt Grid 已完成同内容历史候选、银行机制维护版与 P28 新主题普通模式短片验证；P28.2 绑定版本已获用户艺术批准。该批准确认当前中文适配在这一个短片中的方向，不自动扩展为其他主题、时长或高级模式的艺术批准；最终范围以风格 metadata 和 P28 记录为准。

## 本版不支持

- 逐 frame HTML 参考。
- 高完成度艺术指导或可直接用于生产的视觉风格。
- 五分钟成片渲染。
- 第二种画布尺寸或画幅比例。
- 中文以外的语言。
- MusicGen 音乐生成。

## 已知质量缺口

早期用户评审认可整体节奏与关系表达，同时评价美术风格糟糕；后续 Editorial Forest 重做版以 `accepted_with_deficit` 获接受，仍有元素偶发重叠。P27 的 17.181 秒高级模式样片已获用户艺术批准，但尚未证明普通模式、长片或其他主题具有同等完成度；因此版本整体的**高完成度美术风格未达标**边界仍保留。稳定画面分区与转场归属的执行规则见 [visual-grammar.md](visual-grammar.md)，评审与批准语义见 [quality.md](quality.md)。
