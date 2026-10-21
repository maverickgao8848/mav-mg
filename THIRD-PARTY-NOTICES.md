# 配套工作流来源

本地交付包中的 `general-video`、`hyperframes`、`hyperframes-core`、`hyperframes-creative`、`hyperframes-animation`、`hyperframes-keyframes`、`media-use`、`hyperframes-cli`、`hyperframes-registry`、`hyperframes-audio` 与 `hyperframes-studio` 来自当前本地安装的 HyperFrames 工作流快照。

上游项目：https://github.com/heygen-com/hyperframes

保留上游 [Apache License 2.0 原文](assets/licenses/HyperFrames-LICENSE.txt)。快照文件的实际版本以交付包 `MANIFEST.sha256` 为准；未声明这些本地文件等同于某个上游提交或 CLI 版本的原始发行包。安装入口使用的 CLI 版本独立固定在 `delivery.json` 中。

像素 MG 自身和风格资源继续使用各自原有的 LICENSE、metadata 与字体许可；上游工作流的许可不替代这些资源的许可。

# 公开风格与展示媒体

公开版包含七套风格规范。朱砂与建筑风格所附 Noto、Ma Shan Zheng、ZCOOL 字体保留各自 OFL 原文。钴蓝网格、工程图册与终端手册的原始参考图未记录公开再分发许可，本公开版不包含这些图片；保留来源事实，不宣称取得额外权利。

绿宝石与白金的图片、GIF、MP4 仅作付费版效果展示，不包含付费 Skill、原始风格资源或模板。DeepSeek 样片的工具归属来自实际制作清单；展示不表示模型或客户端厂商背书。新制作的预览均去除音轨，不分发样片原有配乐。

# 语义分镜与过程预演参考

[Table-VideoSOP](https://github.com/duoduoler-ops/Table-VideoSOP/tree/0cad435d10f937cc52fe6b87036fd09eb6df6756)，作者一只桌子，正文以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。preview.32 的语义分镜、过程预演与阅读时间组织参考其视觉叙事经验、镜头剧本模板和验收正文，并改写到本 Skill 既有的 visual-grammar、motion-direction、quality 与分镜示例中；有改动。未移植其 Remotion 实现、工具脚本、角色或展示图片。

# 接收端运行时

固定运行时依赖见 `runtime/package.json` 与 `runtime/package-lock.json`。HyperFrames 为 Apache-2.0，Sharp 为 Apache-2.0，ffmpeg-static/ffprobe-static 的包与下载二进制保留各自许可。它们在接收端安装，原包 LICENSE 与 notices 随 npm 依赖落盘；本 Skill 压缩包不复制本机安装的运行时二进制。像素造物图片按需下载，其本交付使用依据见 `references/pixel2all-rights.md`。
