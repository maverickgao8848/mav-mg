---
name: xiangsu-mg
description: 把中文文稿、带时间码口播与分镜参考制作为可编辑的 HyperFrames 知识解释动画，表现机制、关系、比较与流程。
metadata:
  version: "0.1.0-preview.37"
---

# 像素 MG · Xiangsu MG

以 HyperFrames 制作可编辑、确定性、可任意时间定位的知识解释动画。公开版默认从朱砂活字剧场与工程图册中选择风格，具体物件从 Pixel2All 按需取得；也可沿用用户或上游工程的完整风格。

运行环境与安装见 [DELIVERY.md](DELIVERY.md)，支持和验证范围见 [release-scope.md](references/release-scope.md)。

## 输入与方向

1. 读取项目 `AGENTS.md` 及已有 `BRIEF.md`、`SCRIPT.md`、`STORYBOARD.md`、`frame.md`、`audio_meta.json`。按 [input-contract.md](references/input-contract.md) 补齐影响结果的缺失决策，已确认内容写入 BRIEF 后沿用。
2. 按 [style-contract.md](references/style-contract.md) 确定风格；Editorial 子工程通过 [upstream-frame.md](references/upstream-frame.md) 继承完整 frame 和资源。无指定风格时提供朱砂活字剧场/工程图册二选一。像素绿宝石与像素白金为付费风格，本公开包不提供其资源。
3. 按 [visual-grammar.md](references/visual-grammar.md) 组织教学重点、语义拍点和构图，按 [motion-direction.md](references/motion-direction.md) 设计文字、对象与相机的变化。新方向的静态构图探索可先于配音进行。

## 制作

1. 原始文稿与媒体保存于 `assets/source/`，选用旁白保存于 `SCRIPT.md`。用 `scripts/normalize-input.mjs` 规范输入；按 [voice-contract.md](references/voice-contract.md) 取得唯一有效时基。
2. 在 `STORYBOARD.md` 的既有 `## Frame N` 块记录 cue → 可见变化或有作用的停留 → 对象与来源，同时记录相机交接与阅读窗口。首次编写可参考 [分镜示例](references/semantic-storyboard-example.md)。
3. 具体物件按 [object-library.md](references/object-library.md) 从本拍意图发现候选、看图比较后导入，并绑定选择与使用证据。关系组件按 [component-contract.md](references/component-contract.md) 选择；其他素材按 [asset-routing.md](references/asset-routing.md) 路由，可控内部结构使用 [svg-library.md](references/svg-library.md)。
4. 按 [quality.md](references/quality.md#storyboard-keyframes) 审看关键帧，并用实际时基预演会导致大幅返工的未决过程或空间交接。已有相同适用范围的有效证据可复用。
5. 使用 `general-video` 工作流与 `hyperframes-core` 工程合同。在 BRIEF 记录 `workflow: general-video`、`specialization: xiangsu-mg`。公共框架负责工程结构，本 Skill 负责知识表达、风格、素材、声音与视觉评审。
6. 使用 `node <xiangsu-mg目录>/scripts/hyperframes.mjs <command>` 调用锁定 CLI。优先采用框架已有能力，按已审看草稿构建确定性时间轴。组装出现跨场景 selector、运行时泄漏或自然结束空白时，查 [lessons.md](references/lessons.md)。

## 检查与交付

按 [quality.md](references/quality.md) 分别记录技术、风格遵循及艺术方向结果。完成版检查包括 CLI、关键状态截图、正常速度播放、自然结束与倒序 seek；静态提案只记录静态观察。

完成版证据写入 `ART-REVIEW.md`，运行 `node scripts/verify-art-review.mjs --project <工程>`。制作者在问题解决后记 `ready_for_review`，用户的艺术决定绑定实际审看版本。按当前工作流与用户要求预览或导出。
