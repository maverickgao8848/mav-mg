# 技术预览版支持与证据

公开版范围：七套风格可用于非商业体验，像素绿宝石与像素白金仅展示、不随包提供。旧 Editorial Forest 已退出当前风格列表。

版本由 [SKILL.md](../SKILL.md) 的 `metadata.version` 定义。本页记录当前支持范围；样片明细保存在风格与组件 metadata。

## 当前支持

- 中文知识解释 MG，1920×1080、30fps；可编辑、确定性、seek-safe 的 HyperFrames 工程。
- 文稿生成旁白、固定音视频时间码、参考时间码三种输入，时基见 [input-contract.md](input-contract.md)，Azure 配音见 [voice-contract.md](voice-contract.md)。
- 项目及上游完整 frame 与依赖继承、逐场景图片参考、项目专用语义图形和字幕。
- 风格、素材与组件分别以 [style-contract.md](style-contract.md)、[object-library.md](object-library.md)、[component-contract.md](component-contract.md) 为准。
- 采用成熟结构与必要定制相结合的制作方法，具体分镜、运镜与评审分别见 visual-grammar、motion-direction、quality。
- 安装入口及 11 个 HyperFrames 配套 Skill 见 [DELIVERY.md](../DELIVERY.md)。

## 已验证范围

| 项目 | 实际证据 |
|---|---|
| 工程与 Studio | 连续播放、任意时间 seek 已验证至 300 秒 |
| 视频导出 | H.264/AAC、1920×1080、30fps，已验证至 81.3 秒 |
| 绿宝石 / 白金展示样片 | 属于单独付费版本；其资源闭包及运行时不包含在本公开包，不作为免费版验收依据 |
| 朱砂活字剧场 | 三种字体静帧与替换中文布局，用户选择 A 厚宋活字 |
| 工程图册 | P32.3 的 22 秒拱桥样片获用户批准，确切版本见 metadata |
| Pixel2All 候选发现与选择 | 分路与物件族候选板、词边界、近期使用提示及发现→审看→导入绑定的回归，见 scripts/discover-pixel2all-objects.test.mjs；艺术适配按实际候选板审看 |
| 连续空间 | 32 秒样片验证共享场地、平移缩放、浅透视、聚合、层级交接、播放与 seek |
| 建筑剖面轴测 | 用户选定静态三维方向；字体、物件、WebGL 几何及文字边界已检查 |
| 其他历史风格 | 已审看短片及遗留缺陷见各风格 metadata，保留其版本和来源记录 |

技术探针、静态提案、单条样片和内容替换验证各自记录实际范围。新选题的艺术结果按本期预览判断；跨选题复用以替换验证为依据。真实三维绕拍及 dolly zoom 按项目素材和实现单独验证。

当前交付规格为上述中文横屏工程与已验证导出范围。其他画幅、语言、五分钟导出、逐场景 HTML 导入和音乐生成属于另行验证的扩展。用户要求的 HTML 静态风格提案可独立制作，其结果记录为静态探索。

## 已知质量记录

早期样片有美术完成度不足、局部重叠的用户反馈。历史长片的 `accepted_with_deficit` 结果及缺陷随原工程记录保留。各项目按 [quality.md](quality.md) 检查构图、可读性、过程与交接，批准结果绑定审看版本。
