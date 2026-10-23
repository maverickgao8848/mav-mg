# 免费体验版安装与运行 · 源码 preview.38

本包包含七套非商业体验风格及 11 个 HyperFrames 配套工作流。像素绿宝石与像素白金只展示效果，不包含完整风格资源。许可见 [中文说明](USAGE.zh-CN.md) 与 [LICENSE](LICENSE)。

当前main源码已更新内容驱动的制作与审看方法，见 [content-led-variation.md](references/content-led-variation.md)。约70%保留所选风格、约30%按内容发挥，样段不作为固定模板。已发布preview.37下载包保持其原始内容；本次仅同步源码。

## 安装

需要 Node.js 22+、网络，以及能读取 Skill 和执行本地命令的 AI 客户端，例如 WorkBuddy 或 Codex。模型可选择 DeepSeek 等具备相应工具调用能力的配置。

解压后在根目录运行 `node install.mjs`；Windows 可双击 `安装.cmd`。默认装入 `CODEX_HOME/skills`，未配置时装入 `~/.codex/skills`。WorkBuddy 等客户端应按实际的 Skill 目录指定位置：

```sh
node install.mjs --destination <客户端实际的Skill目录>
```

也可以使用干净的项目目录：

```sh
node install.mjs --destination <项目目录>/.agents/skills
```

安装器保留已有的不同内容并报告冲突，不自动覆盖其他 Skill。冲突时选择干净位置，或先核对原版本。安装后重新加载 AI 会话，调用 `xiangsu-mg`；仓库名 `mav-mg` 与当前 Skill 名称不同。

只复制 Skill、稍后准备运行时可加 `--skills-only`。正常安装使用锁定依赖准备 HyperFrames 0.8.144、Sharp、FFmpeg/FFprobe 和 Chrome。首次安装需联网；不复制作者电脑的 node_modules、缓存、登录态或系统二进制。

## 运行

```sh
node <安装目录>/xiangsu-mg/scripts/hyperframes.mjs doctor --json
node <安装目录>/xiangsu-mg/scripts/hyperframes.mjs preview
```

第二条从视频工程目录运行。物件从 https://pixel2all.cn/objects/ 按需检索与取得，渲染使用工程内冻结副本，不整库分发。免费 Skill 不替代素材商业授权。

新旁白需要自己的 Azure Speech 配置，已有音频不需要 Azure。可先运行 `node <安装目录>/xiangsu-mg/scripts/azure-tts.mjs --doctor`。模型、语音及其他服务的实际费用由使用者承担。

## 配套工作流与验证

`vendor/skills/` 保存 general-video、hyperframes、hyperframes-core、hyperframes-creative、hyperframes-animation、hyperframes-keyframes、media-use、hyperframes-cli、hyperframes-registry、hyperframes-audio 与 hyperframes-studio，共 11 项。这些是本地快照，保留 Apache-2.0 声明，不等同于某个未经核验的上游提交。

发布检查覆盖公开风格的哈希和重复应用、付费资源排除、安装与冲突保护、素材检索与导入规则。既有实际运行记录及成片证据以 [release-scope.md](references/release-scope.md) 为准；不将 Mac/Linux 或所有客户端的实际运行称为已经验证。WorkBuddy 安装位置以客户端配置为准。

工程和 Studio 验证至 300 秒；实际视频导出的既有验证至 81.3 秒。建筑风格目前为静态方向。新主题仍需预览和艺术评审。
