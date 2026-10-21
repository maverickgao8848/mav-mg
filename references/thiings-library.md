# THIINGS · 选定来源的历史项目

本页适用于已冻结或用户明确选用 THIINGS 的项目。当前默认来源与共享检索证据格式见 [object-library.md](object-library.md#可执行检索证据)。

## 检索与导入

1. 从 STORYBOARD 盘点具体实体与视觉隐喻，用 `thiings_object_id: <semantic-id>` 标识。先核对当前/既有项目可追溯的本地素材，再搜索 [THIINGS Collection](https://www.thiings.co/things)。
2. 按常见英文名词、功能或同义词查询，必要时网页搜索官方单项页。核对轮廓、视角、光向、透明边缘、像素和动作范围。
3. 取得选中单张 PNG 或用户已有合法导出，按下列入口导入。无匹配需两次不同在线查询；结构、独立部件、多视角或许可例外记录候选与具体替代。服务/下载失败记录 `blocked`。

```sh
node scripts/stage-thiings-object.mjs --file <selected.png> --id camera --source-page https://www.thiings.co/things/camera --project <project> --roles camera,recording
```

导入器保留 PNG 原件，检查格式、尺寸及 alpha 能力，写 `assets/objects/thiings/` 的图片/metadata 及工程 credits。复用时核对冻结哈希；冲突保留现有文件并明确处理。截图审看实际边缘、尺寸、遮挡与解释作用。

## 共享证据的来源参数

使用 `schemaVersion: 1`，沿用 object-library 中的 storyboardSha256、buildSha256、objects（含 searches、assetId、implementationPaths、snapshotPaths）及例外字段；Pixel2All v2 的 discovery、selection 与 selected 状态不用于 THIINGS。调整 `sourceId: "thiings"`、证据目录 `assets/objects/thiings/search-review.json`、`route: local | collection | web` 与真实 THIINGS 对象页。`id` 对应 `thiings_object_id`，`assetId` 对应本地导入 ID。分镜记录完整 PNG 路径、`object_format: png` 和 `object_role: hero | companion`。

实际导入、实现引用和审看截图支持 `used`；对象例外沿用共享 reason/detail/replacement。校验入口为 `verify-thiings-review.mjs --stage keyframes|delivery`，完成版由 verify-art-review 调用。

## 许可记录

2026-10-02 核对的 [官方条款](https://www.thiings.co/terms) 记录为：免费单项图片供个人、非商业使用并需可见署名；商业使用依实际许可。后续使用核对当时许可与用户依据。

默认导入为 `personal-noncommercial`，作品署名 `Objects: thiings.co`。用户提供商业许可时用 `--usage commercial --license-evidence <依据>` 记录。选中原图进入本片工程，Skill 保存来源描述；独立素材再分发依原许可处理。
