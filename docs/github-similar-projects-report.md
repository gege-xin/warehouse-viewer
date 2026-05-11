# GitHub Similar Projects Report

调研日期：2026-05-11  
项目：Warehouse Viewer / 仓库货架可视化网站  
筛选标准：GitHub 公开项目，3k+ stars，和仓库可视化、库存管理、管理后台、拖拽布局、地图/画布交互有可借鉴关系。

> 结论先行：没有找到一个 3k+ stars 项目和当前项目完全一样。最接近的是 `GreaterWMS` 和 `InvenTree`，但它们偏完整 WMS / 库存系统，复杂度远高于当前项目。当前项目更适合继续保持“轻量仓库可视化 + Firebase 权限 + 管理员编辑”的方向，只借鉴它们的数据建模、搜索、权限、后台编辑体验和移动端操作细节。

## 1. 候选项目汇总

| 项目 | Stars | 类型 | 和本项目相关度 | 链接 |
|---|---:|---|---|---|
| GreaterWMS | 4.3k | 开源 WMS / 仓库管理系统 | 高 | https://github.com/GreaterWMS/GreaterWMS |
| InvenTree | 6.9k | 开源库存管理系统 | 高 | https://github.com/inventree/InvenTree |
| Appsmith | 39.8k | 管理后台 / 内部工具平台 | 中高 | https://github.com/appsmithorg/appsmith |
| refine | 34.7k | React 管理后台框架 | 中高 | https://github.com/refinedev/refine |
| Ant Design Pro | 38.2k | 企业后台模板 | 中 | https://github.com/ant-design/ant-design-pro |
| react-grid-layout | 22.2k | React 拖拽网格布局 | 中高 | https://github.com/react-grid-layout/react-grid-layout |
| dnd-kit | 17.1k | React 拖拽工具库 | 高 | https://github.com/clauderic/dnd-kit |
| Butterfly | 4.7k | JS/React/Vue 流程图/画布库 | 中 | https://github.com/alibaba/butterfly |

说明：Stars 会随时间变化，以上数量按调研时 GitHub 页面 / GitHub Search API 结果记录。

## 2. 项目逐个分析

### 2.1 GreaterWMS

GreaterWMS 是最接近“仓库管理”的开源项目，定位是完整 WMS。它的模块很重，包括货品、客户、供应商、库存、入库、出库、司机、盘点、员工等。

适合借鉴：

- 仓库领域对象拆分：warehouse、stock、goods、staff 等模块边界清楚。
- 库位和库存不要混在一起：库位是位置，产品库存是状态。
- 管理员功能应该保留清晰操作记录，后续可以增加修改历史。
- 大型仓库系统通常需要权限、角色、数据校验，当前 Firebase Rules 的方向是对的。

不建议直接照搬：

- 不建议引入完整出入库、ASN、DN、客户、供应商、财务等 ERP/WMS 流程。
- 不建议改成 Django + 后端数据库。当前项目目标是轻量查看和少量编辑，Firebase 已够用。

对当前项目的建议：

- 保持当前“只看货位 + 管理员编辑”的范围。
- 后续可以新增 `updatedAt`、`updatedBy`、`history` 字段，形成简易审计记录。
- 管理后台可以增加“批量导入 / 批量导出 CSV”，比引入完整 WMS 更实际。

### 2.2 InvenTree

InvenTree 是成熟的库存管理系统，重点是 part tracking、stock control、后台管理和 API 扩展。

适合借鉴：

- SKU / 产品资料和库存位置应该分层：产品型号、颜色、分类、库存数量、货位编号应保持字段清楚。
- 搜索不应只搜型号，还可以搜分类、颜色、备注、货位编号。
- 未上架 / unassigned 产品需要单独归类，当前的 TEMP / Staging Area 方向合理。
- 后续可以增加标签打印或二维码定位。

不建议直接照搬：

- InvenTree 的后端、插件、REST API、生产 BOM 相关能力超出当前需求。
- 当前项目不需要变成生产制造库存系统。

对当前项目的建议：

- 建议保留 `model`、`type`、`category`、`colorCode`、`cabinetModel`、`qty`、`status`、`code` 字段。
- 增加导入校验：货位编码必须符合 `A-R1-C01-L1`，层数只能是 `L1/L2/L3`。
- 搜索结果可以显示“型号 + 货位 + 状态 + 数量”，员工更容易判断。

### 2.3 Appsmith

Appsmith 是构建 admin panels、internal tools、dashboards 的平台，重点不是仓库，而是后台工具体验。

适合借鉴：

- 管理员后台可以按“资源列表 + 编辑表单 + 搜索过滤”组织。
- 管理操作应该清楚区分查看、编辑、新增、删除。
- 表单保存失败时要有明确错误提示，不能只在控制台报错。
- 后台适合高密度信息，但移动端仍要保证按钮和输入框足够大。

不建议直接照搬：

- 不建议引入低代码平台概念。
- 不需要把当前后台改造成复杂 dashboard builder。

对当前项目的建议：

- 管理后台继续保持简单：列表筛选、表单编辑、拖拽调整货位。
- 增加“未分配产品”快速过滤。
- 增加“状态 / 区域 / 分类 / 颜色”筛选，比做复杂看板更有价值。

### 2.4 refine

refine 是 React internal tools / admin panel 框架，强调资源化 CRUD、认证、数据源适配。

适合借鉴：

- 把后台数据当成 resources：`warehouseLocations` 是核心 resource。
- Auth、Data Provider、UI Components 分层，便于以后维护。
- 列表页、编辑页、新增页可以共用同一套字段配置。

不建议直接照搬：

- 当前项目已经有 React + Firebase 架构，不建议整体迁移 refine。
- 引入 refine 会增加依赖和学习成本，对轻量仓库查看站不必要。

对当前项目的建议：

- 在现有代码内局部借鉴 resource 思路：封装 `warehouseLocations` 的读写函数。
- 让 AdminPanel 不直接散落 Firestore 调用，统一走 `services/warehouseLocations.js` 一类文件。
- 以后新增批量更新、迁移脚本时更不容易出错。

### 2.5 Ant Design Pro

Ant Design Pro 是企业后台模板，功能覆盖登录、列表、表单、异常页、国际化、响应式等。

适合借鉴：

- 后台信息架构：登录、列表、表单、账号、异常状态。
- i18n 和响应式是后台系统的基本能力。
- 企业后台应保持一致的表单、表格、筛选样式。

不建议直接照搬：

- 当前项目使用 Tailwind CSS，不建议改成 Ant Design 全家桶。
- Ant Design Pro 的模板和路由体系偏重，会压过当前轻量需求。

对当前项目的建议：

- 保持 Tailwind，但借鉴它的页面状态：loading、empty、error、403、not found。
- 管理后台可以增加更清楚的空状态和权限不足提示。

### 2.6 react-grid-layout

react-grid-layout 是 React 拖拽、可调整大小、响应式断点网格库。

适合借鉴：

- 拖拽布局要把“数据位置”和“屏幕布局”分开。
- 响应式断点可以拥有不同展示布局。
- 拖拽需要边界、静态元素、不可拖拽区域、序列化恢复。

不建议直接照搬：

- 当前仓库地图是确定的货架物理布局，不是自由 dashboard 网格。
- 不建议让用户随便拖动货架整体位置，否则会破坏真实仓库结构。

对当前项目的建议：

- 继续用固定物理货位网格，不把货架变成自由布局。
- 管理员拖拽只允许移动 SKU 到合法货位，不允许拖到 aisle。
- 如果以后要做“仓库布局编辑器”，再考虑引入类似 grid-layout 的思想。

### 2.7 dnd-kit

dnd-kit 是现代 React drag and drop 工具库，当前项目的管理员拖拽功能已经选择了这个方向。

适合借鉴：

- 使用 sensors 支持鼠标、触摸和键盘。
- 使用 droppable 区分可放置货位和不可放置走廊。
- 使用 DragOverlay 提高拖动时的视觉反馈。
- 使用 collision detection 控制目标货位识别。

不建议直接照搬：

- 不要把普通员工页面也接入拖拽上下文。
- 不要让所有 DOM 节点都成为 droppable，走廊、标题、空白区域必须排除。

对当前项目的建议：

- 保持拖拽只在 `/admin` 且管理员登录后启用。
- 增加触摸拖拽的延迟或距离阈值，减少手机误触。
- 拖动成功后继续用 Firestore transaction / batch，避免只更新一个 SKU。

### 2.8 Butterfly

Butterfly 是流程图 / 画布类库，不是库存系统，但对大型可视化地图有参考意义。

适合借鉴：

- 大地图应该支持平移、缩放、定位、节点高亮。
- 节点和连线的渲染要和业务数据解耦。
- 大规模可视化需要 minimap / viewport / focus 这类能力。

不建议直接照搬：

- 当前仓库是规则货架网格，不需要流程图节点连线。
- 直接引入画布库会增加复杂度，也会影响移动端点击和搜索。

对当前项目的建议：

- 暂时不用画布库。
- 如果未来仓库变成多楼层、不规则地图、上百个货架，可以考虑做 mini-map 或缩放控件。

## 3. 当前项目最值得借鉴的方向

### 3.1 数据模型

建议保持核心集合为 `warehouseLocations`，但逐步强化字段规范：

```json
{
  "code": "A-R1-C01-L1",
  "location": "A-R1-C01-L1",
  "model": "SW-B12",
  "type": "door",
  "category": "Base Cabinet",
  "cabinetModel": "B12",
  "colorCode": "SW",
  "colorName": "White",
  "qty": 10,
  "status": "occupied",
  "note": "",
  "updatedAt": "...",
  "updatedBy": "admin@example.com"
}
```

重点规则：

- `code` / `location` 必须统一，避免旧格式混入。
- 货位层级只允许 `L1/L2/L3`。
- 未分配产品使用 `status = "unassigned"`，显示在 Staging Area。
- 走廊不是 document，不参与搜索、拖拽、库存统计。

### 3.2 搜索和定位

当前搜索已经是核心功能，建议继续增强：

- 搜索 `B12` 返回 `BOX-B12`、`SW-B12`、`SLG-B12`、`SG-B12`、`SC-B12`。
- 搜索结果按状态排序：有货优先、未上架其次、空/禁用最后。
- 搜索结果显示货位、数量、状态、分类。
- 点击搜索结果后 scroll + highlight + 打开详情可作为后续增强。

### 3.3 管理后台

借鉴 Appsmith / refine / Ant Design Pro 的后台组织方式，但不迁移框架：

- 顶部：管理员信息、登出、拖拽模式开关。
- 筛选：型号、区域、状态、分类、颜色、未分配。
- 主体：地图拖拽 + 表格编辑二选一。
- 表单：新增 / 编辑共用字段。
- 危险操作：删除前二次确认。

### 3.4 拖拽交互

当前项目应继续基于 dnd-kit：

- 仅管理员可启用。
- 只允许拖 SKU，不拖走廊、不拖 Zone、不拖 Rack 标题。
- 移动到空位：更新该 SKU 的 `code/location`。
- 移动到有货位：确认后 batch 交换两个 SKU。
- Firestore 失败：前端回滚并提示。

### 3.5 移动端体验

对仓库员工来说，移动端比桌面更重要：

- 搜索栏 sticky。
- 地图横向滚动，不压缩格子。
- 格子至少 55px。
- 大字体模式保存在 localStorage。
- 点击详情使用 bottom sheet。
- PWA 添加到主屏幕。

## 4. 不建议现在做的事情

- 不要引入完整 WMS 流程：入库、出库、采购、发货、财务、供应商。
- 不要改后端架构：Firebase + Firestore 对当前规模足够。
- 不要把仓库地图改成自由拖拽 dashboard。
- 不要引入大型 UI 框架重写现有 Tailwind 页面。
- 不要把走廊做成产品或货位 document。
- 不要让普通员工页面加载管理员拖拽逻辑。

## 5. 建议的下一步路线

### 第一优先级

1. 统一所有 Firestore 数据的 location code。
2. 增加后台筛选：未分配、区域、状态、分类。
3. 增加管理员修改历史字段：`updatedAt`、`updatedBy`。
4. 增加 CSV 导入 / 导出。

### 第二优先级

1. 搜索结果排序和详情增强。
2. 支持二维码 / 条码快速定位。
3. 后台批量修改分类、颜色、状态。
4. 增加 staging area 专门视图。

### 第三优先级

1. 仓库 mini-map。
2. 地图缩放。
3. 多仓库 / 多楼层。
4. 简单库存历史，不做完整出入库。

## 6. 最终建议

当前项目最好的架构方向不是变成 GreaterWMS 或 InvenTree，而是保持一个专注的仓库可视化工具：

- 公开页面：员工快速查产品在哪。
- 管理页面：管理员快速维护货位。
- 数据层：Firestore + Security Rules 保证权限。
- UI 层：移动端优先，地图横向滚动，搜索自动定位。
- 后续增强：批量导入、修改历史、二维码定位。

这条路线能满足橱柜 / Sink / 建材仓库的实际使用，不会把项目推向复杂 ERP。

## 7. 来源

- GreaterWMS: https://github.com/GreaterWMS/GreaterWMS
- InvenTree: https://github.com/inventree/InvenTree
- Appsmith: https://github.com/appsmithorg/appsmith
- refine: https://github.com/refinedev/refine
- Ant Design Pro: https://github.com/ant-design/ant-design-pro
- react-grid-layout: https://github.com/react-grid-layout/react-grid-layout
- dnd-kit: https://github.com/clauderic/dnd-kit
- Butterfly: https://github.com/alibaba/butterfly
