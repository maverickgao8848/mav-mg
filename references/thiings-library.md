# Thiings · 具体物件素材

Thiings 是 `object` 来源，不是关系组件或 SVG 绘制的替代流程。来源入口与可用格式见 [source.json](../assets/object-sources/thiings/source.json)，教学关系仍由 [component-contract.md](component-contract.md) 定义。

## 何时替代 SVG

| 本拍需要 | 优先路线 |
|---|---|
| 相机、工具、收据、容器等可识别实体，只需整体移动/缩放/遮挡 | 选符合当前 `frame.md` 材料的 Thiings 透明 PNG，减少重新画小物件的工作 |
| 连接、因果、流程或数量关系 | DOM/SVG/关系组件承担结构；PNG 可以做结构里的实体节点 |
| 内部剖面、逐段描线、可独立变形部件、科学准确的结构 | 保留项目语义 SVG；现成图像只有在结构足够准确时才参与 |
| 真实背面、人物转身、绕物拍摄 | 多视角、视频或模型；单张“3D 风格”PNG 只支持平面和有限 2.5D |

两种制作模式共用这条路线。高级模式的 custom 决策可投入字形、关系、材料和动作，不要求每个小物件重画为 SVG。一个实体由 PNG 表示时，在分镜记录 `object_format: png`、`object_role: hero | companion`，不要伪记为 `svg_role`；实际 SVG 保留原字段。

## 检索与项目导入

1. 根据本拍的具体名词在 [Collection](https://www.thiings.co/things) 搜索，检查对象页的角度、轮廓、光向、透明边缘、有效像素与主题准确性。现有项目的本地已下载 PNG 或用户提供的合法全库导出可先检索复用。
2. 用站点的单项下载或用户拥有的导出文件取得选中 PNG。不假设存在公开搜索/下载 API，也不自动购买或抓取全库。
3. 从 Skill 根目录运行：

```sh
node scripts/stage-thiings-object.mjs --file <selected.png> --id camera --source-page https://www.thiings.co/things/camera --project <project-directory> --roles camera,recording
```

工具保留原始 PNG，核对 PNG 头、尺寸和透明通道能力，写入项目 `assets/objects/thiings/` 与该目录的 `metadata.json`；记录单项来源、哈希、检索日期、用途与授权依据。幂等重复导入不改文件，ID 或文件内容冲突先保留现有文件再明确处理。透明通道能力不保证实际边缘透明；还需在场色上看图。

4. `STORYBOARD.md` 记本地路径、来源 ID、格式/角色、替代原因和实际动作范围。PNG 的投影、托盘与关系图可以另外用 DOM/SVG；保持 PNG 原图可追溯。

## 使用范围

2026-10-02 核对的 [官方条款](https://www.thiings.co/terms)：免费单项下载为个人、非商业使用，需可见署名；商业使用取决于用户拥有的相应许可；原始图不能作为独立素材重新分发。来源描述随 Skill 分发，选中原图只进入用户项目，不打包为 Skill 素材库。

默认导入记为 `personal-noncommercial`，按来源清单在预览/作品中署名 `Objects: thiings.co`。用户已提供商业许可依据时，导入可加 `--usage commercial --license-evidence <evidence-path-or-description>`，把实际依据写入项目，不推断“免费可下载”即商业授权。许可证不会赋予图内商标或人物额外权利。

验证在当前项目输出尺寸进行：主体边缘、原图分辨率、阅读时遮挡和最大推近倍率都符合当前动作。字、箭头或剖面不因采用 PNG 而省略。
