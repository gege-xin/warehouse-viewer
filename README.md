# 仓库货架可视化 / Warehouse Rack Viewer

轻量级仓库货位查看网站，适合橱柜、Sink、建材仓库。所有人可公开查看和搜索产品位置，只有管理员登录后可以修改 Firestore 数据。

## 当前管理员

```text
cherryliao43@gmail.com
sela21depot@gmail.com
```

## 当前 SKU 数据

`data/warehouse.json` 已自动生成 485 个基础橱柜 SKU，并且已经随机构造分配到 A/B/C 区的不同货位。

示例：

```json
{
  "code": "A1-01-01",
  "model": "BOX-B09",
  "type": "box",
  "category": "Base Cabinet",
  "categoryCn": "地柜",
  "cabinetModel": "B09",
  "qty": 0,
  "status": "occupied",
  "note": "系统自动分配 / Auto assigned"
}
```

分配规则：

- A区：A1-A4 货架
- B区：B1-B3 货架
- C区：C1-C3 货架
- 每个货架 5 列 x 10 层
- 货位格式如 `A1-01-01`
- 485 个 SKU 全部有唯一货位
- 库存数量先保持 `qty: 0`
- 状态先设为 `occupied`
- 备注为 `系统自动分配 / Auto assigned`

## SKU 生成规则

每个柜体型号生成 5 个 SKU：

- 1 个箱体：`BOX-柜体型号`
- 4 个门板：`SW-柜体型号`、`SLG-柜体型号`、`SG-柜体型号`、`SC-柜体型号`

颜色：

- `SW`: White 白色
- `SLG`: Light Gray 浅灰
- `SG`: Gray 灰色
- `SC`: Charcoal 深灰

## 运行

```bash
npm install
npm run dev
```

如果 PowerShell 拦截 npm 脚本，用：

```bash
npm.cmd run dev
```

打开：

```text
http://localhost:5173
```

页面：

- `/` 公开仓库可视化
- `/login` 管理员登录
- `/admin` 管理员后台

## 搜索

搜索示例：

- `B12`：找到 `BOX-B12`、`SW-B12`、`SLG-B12`、`SG-B12`、`SC-B12`
- `BOX`：显示所有箱体
- `SW`：显示所有白色门板
- `W0936`：显示该型号对应箱体和所有门板
- `A1-01-01`：显示指定货位

## 重新生成数据

型号清单和分配规则在：

```text
scripts/cabinetSeedData.mjs
```

重新生成：

```bash
npm run generate:seed
```

## 导入 Firestore

方式一：后台导入

1. 配置 Firebase。
2. 用管理员账号登录 `/login`。
3. 进入 `/admin`。
4. 点击 `导入已分配 SKU / Seed Assigned SKUs`。

方式二：命令行导入

```bash
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\service-account.json
npm run import:seed
```

导入目标集合：

```text
warehouseLocations
```

## 后台可修改字段

管理员后期可以在 `/admin` 修改：

- `code`: 真实货位，例如 `A1-01-01`
- `model`: SKU 型号
- `qty`: 库存数量
- `status`: 状态
- `note`: 备注
- `type`: `box` 或 `door`
- `category`: 分类
- `cabinetModel`: 柜体型号
- `colorCode`: 门板颜色代码

## 管理员拖拽调整货位

管理员登录 `/admin` 后，可以点击：

```text
开启拖拽 / Drag Mode Off
```

开启拖拽模式后：

- 拖动有 SKU 的货位到空位：SKU 会移动到目标货位，原货位变为空位
- 拖动有 SKU 的货位到另一个有 SKU 的货位：系统会询问是否交换两个货位
- 确认交换后会用 Firestore batch 同时保存受影响的区域文档
- 保存失败时不会改本地数据，并会显示错误提示
- 当前数据结构只使用 `code` 表示货位；如果某条记录本身已有 `location` 字段，拖拽时会同步更新它

普通首页 `/` 没有拖拽能力，Firestore Rules 仍然只允许 `cherryliao43@gmail.com` 和 `sela21depot@gmail.com` 写入。

## 状态颜色

- `empty`: 空位 / Empty，白色
- `occupied`: 有货 / Occupied，绿色
- `reserved`: 预留 / Reserved，红色
- `unassigned`: 未分配 / Unassigned，黄色
- `disabled`: 禁用 / Disabled，黑色
- `aisle`: 走廊 / Aisle，灰色

## Firebase 配置

复制 `.env.example` 为 `.env`，填写 Firebase Web App 配置：

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_ADMIN_EMAILS=cherryliao43@gmail.com,sela21depot@gmail.com
```

未配置 Firebase 时，首页会读取 `data/warehouse.json`，后台写入不可用。

## Firestore Rules

`firestore.rules` 已配置：

```js
allow read: if true;

allow create, update, delete:
if request.auth != null
&& request.auth.token.email in [
  "cherryliao43@gmail.com",
  "sela21depot@gmail.com"
];
```

部署规则：

```bash
firebase deploy --only firestore:rules
```

## 部署

Vercel 或 Netlify：

```bash
npm run build
```

Output / Publish directory：

```text
dist
```

Netlify SPA 路由已配置在：

```text
public/_redirects
```

Firebase Hosting：

```bash
npm run build
firebase deploy --only hosting
```
