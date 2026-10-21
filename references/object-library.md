# 默认物件库：Pixel2All

从 [像素造物](https://pixel2all.cn/objects/) 的在线目录 `https://pixel2all.cn/media/ceramic/catalog.json` 发现候选，审看后导入本期工程。语义推理由制作者完成；脚本对全目录做可追溯的词法检索，不替代看图或判断隐喻。

## 从本拍意图到候选

在 BRIEF 写独立行 `object_source: pixel2all`。沿 STORYBOARD 的 `object_id`，先写观众需要理解什么、物件要发生什么变化，再形成查询路线：

- 实体：本题必须辨认的对象、部位或别名。事实主体或用户指定的物件优先保持身份。
- 状态：本拍的容量、接触、阻塞、破损、展开等可见变化；从目录候选的标签与状态补充实际检索词。
- 隐喻：当内容抽象时，按相同的物理关系或作用寻找其他载体，而不是先把概念固定成某件熟悉物品。

按解释需要选择路线，无须凑齐三类。单个具体主体可以只走实体路线；抽象机制应先探索承载关系的候选，再决定主体。检索无结果时，把概念改写成可见状态、物理作用或同义实体，并按需用 `stage-pixel2all-object.mjs --list` 查目录；词法零命中不代表不存在可用的隐喻。没有自动语义扩展词典。

将计划保存为工程内 `verification/object-plan.json`，格式如下（占位内容按本题填写；一个 object 对应一个分镜物件）：

```json
{
  "schemaVersion": 1,
  "objects": [{
    "id": "<STORYBOARD 的 object_id>",
    "beatRefs": ["<实际 cue ID>"],
    "intent": "<这一拍让观众理解的关系或事实>",
    "action": "<需要呈现的动作、状态或有作用的停留>",
    "routes": [{
      "kind": "entity",
      "reason": "<为什么从这个方向找>",
      "queries": ["<本题检索词>", "<有用的别名或近义词>"]
    }]
  }]
}
```

`kind` 为 `entity | state | metaphor`。每个词独立记录结果，多词并集保留全部命中及命中字段。英文按词或短语边界匹配，中文支持子串；不做词干推断。

```sh
node scripts/discover-pixel2all-objects.mjs --project <工程> --plan <工程>/verification/object-plan.json
# 有近期作品可比时，追加一个或多个 --history <近期工程>
```

工具写入 `verification/object-discovery.json` 和 `verification/object-candidates/<object_id>.png`，并为新工程建立尚未审看的 v2 `search-review.json`。报告保留完整候选；候选板在各查询路线与物件族之间轮流取样，再补充同物件的状态，默认 12 张，可用 `--board-size` 调整到 1–60。板未覆盖的候选仍在报告中；需要审看它们时调整路线或板大小后重跑。

历史只读取显式传入作品的 `status: used` 与 metadata，不把下载过但未采用的图算作使用。旧工程缺 metadata 时标注 incomplete-recorded-usage-only，只作已记录用图的提示，不声称验证过旧文件。一个作品选一个代表版本；工具只对相同路径去重，不推测不同目录是否同片。无历史会如实记 `not-supplied`。近期同图／同物件族的提示不改变相关性分数，也不排除候选；沿用角色、准确实体或连续镜头可以合理复用。

## 看图、选择与导入

查看候选板，比较语义、轮廓、角度、光向、分辨率及本拍动作。选择理由应说明它怎样解释本拍，以及与实际看过的相关候选相比有什么取舍；近期用过时结合本片职责判断。候选数量不设配额，熟悉程度、词法排序及素材新鲜度都不能单独完成艺术判断。

在同一对象的搜索记录里填写真实候选页和适配判断，用 `selection` 记录选择理由、实际审看 ID 和候选板路径。报告的 `reviewStatus: not-reviewed` 表示工具只完成发现；人工审看结果由 search-review 的 selection 承担。初始 `blocked` 条目、空理由和空候选判断不是完成证据。

选定后执行：

```sh
node scripts/stage-pixel2all-object.mjs --id <实际选中的 catalog ID> --project <工程>
```

导入器写 `assets/objects/pixel2all/<id>.png`、`metadata.json`、`asset-credits.json`。候选板仅是检索证据，成片引用导入 PNG 的本地相对路径。公开入口为最大边长 768px 的透明 WebP，导入器保持尺寸与透明度转换 PNG，不标作高清原图；作者另供原图时可加 `--file <原图.png>`，核对目录原图尺寸及 SHA。

使用依据见 [pixel2all-rights.md](pixel2all-rights.md)，工具默认 `usage: delivery-authorized`。已导入图片保持冻结哈希；冲突时保留原件并报告。图片用于整体移动／缩放／遮挡；DOM/SVG 提供连接、内部结构和独立部件；连贯多视角、视频或模型提供换面及真实绕拍。实际主体与需控制的结构可以组合使用。

## 可执行检索证据

`assets/objects/pixel2all/search-review.json` 索引 STORYBOARD 的每个 `object_id`。新建记录由发现工具生成 `schemaVersion: 2`；补齐真实 cue、判断、使用状态和版本哈希。核心结构如下：

```json
{
  "schemaVersion": 2,
  "sourceId": "pixel2all",
  "storyboardSha256": "<当前 STORYBOARD.md SHA-256>",
  "buildSha256": "<交付阶段当前 index.html SHA-256>",
  "discovery": {"path": "verification/object-discovery.json", "sha256": "<该报告 SHA-256>"},
  "abstractOnlyReason": null,
  "objects": [{
    "id": "<分镜物件 ID>",
    "label": "<本题物件名称>",
    "beatRefs": ["<实际 cue ID>"],
    "status": "used",
    "searches": [{
      "query": "<报告里的实际查询>",
      "route": "pixel2all",
      "checkedOn": "<实际 YYYY-MM-DD>",
      "evidence": "verification/object-discovery.json",
      "candidates": [{
        "sourcePage": "https://pixel2all.cn/objects/?item=<该查询实际返回的 ID>",
        "assessment": "<实际看图后对本拍适配的判断>"
      }]
    }],
    "selection": {
      "reason": "<选择与实际比较的取舍>",
      "inspectedAssetIds": ["<实际审看并写过 assessment 的 ID>"],
      "sheetPaths": ["verification/object-candidates/<分镜物件 ID>.png"]
    },
    "assetId": "<选中的 ID>",
    "implementationPaths": ["index.html"],
    "snapshotPaths": ["snapshots/keyframes/<实际图>.png", "snapshots/<实际图>.png"]
  }]
}
```

- `route` 沿用 `pixel2all | local | web`。每次查询记录 `query`、`checkedOn`、`evidence`、`candidates`；零命中时 `candidates: []`。v2 查询及候选要能在绑定报告中找到；候选板哈希、实际审看 ID 和 assessment 相互对应。
- 看图选定并导入后先记 `status: selected`，运行 selection 检查；它只确认候选、选择及 PNG 证据，不声称已用于画面。关键帧或成片实际使用后改为 `used`。
- `status: used` 还需要真实清单与 PNG、分镜完整本地路径、实现引用和实际渲染并看过的使用截图。选中源图哈希须与发现时一致。候选板不替代使用截图。
- `status: exception` 用 `exception: {reason, detail, replacement}` 记录逐物件原因。`reason` 为 `no-match | structural-precision | independent-parts | multi-view | license-unavailable | user-override`。`no-match` 沿用至少两次不同在线查询；结构、视角及许可例外记录真实审看候选；`user-override` 另记 `userInstruction` 原话。访问或下载失败用 `blocked` 和 `blocker` 保留失败信息，暂停对应物件验收。
- 纯公式／抽象关系在盘点后可记 `objects: []` 及 `abstractOnlyReason`，无需装饰性取图或空跑发现工具。
- 分镜、报告或素材改变后更新引用及 SHA。重跑发现工具保留现有 search-review，直到重新审看后再更新其绑定和判断；不会自动把旧判断贴到新候选板上。
- 已冻结的 v1 Pixel2All 与历史／明确指定 THIINGS 工程保留原证据，校验返回 `legacy-provenance-only`，不代表完成新候选比较；新建制作使用 v2。THIINGS 细则见 [thiings-library.md](thiings-library.md)。

选图导入后运行 selection；实际画面完成后分别运行 keyframes 和 delivery：

```sh
node scripts/verify-thiings-review.mjs --project <工程> --stage selection
node scripts/verify-thiings-review.mjs --project <工程> --stage keyframes
node scripts/verify-thiings-review.mjs --project <工程> --stage delivery
```

关键帧阶段通过后构建完整时间轴；交付阶段由 `verify-art-review.mjs` 自动复查。脚本核对发现、审看记录与实际使用的证据链，艺术取舍由 [quality.md](quality.md) 的选图观察承担；它不能证明文字理由真实或隐喻一定成立。
