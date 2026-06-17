# CV Labeling Platform — HTML Prototype Plan

> Phần mềm gắn nhãn ảnh nội bộ cho các dự án Computer Vision.  
> Tham khảo: Roboflow, CVAT · Stack thật: Next.js + TypeScript + react-konva + Django/FastAPI + GitLab SSO

---

## Tổng quan

| | |
|---|---|
| **Mục tiêu** | HTML prototype toàn bộ luồng — từ login đến export dataset |
| **Số màn hình** | 16 file HTML |
| **Thời gian dự kiến** | 5 tuần |
| **Người dùng** | Admin · Annotator · AI team |
| **Stack prototype** | HTML + CSS custom props + vanilla JS + Chart.js CDN |

---

## Cấu trúc thư mục

```
cv-labeling-prototype/
├── styles/
│   ├── base.css              ← CSS vars, typography, reset, dark mode
│   └── components.css        ← buttons, badges, cards, table, modal, toast
├── components/
│   ├── layout.html           ← sidebar + topbar shared template
│   └── ui.html               ← component showcase / storybook
└── pages/
    ├── login.html
    ├── dashboard/
    │   ├── annotator.html
    │   └── admin.html
    ├── projects/
    │   ├── index.html
    │   ├── detail.html
    │   ├── images.html
    │   ├── upload.html
    │   └── assign.html
    ├── annotate/
    │   ├── editor.html       ← màn hình trọng tâm, dark theme riêng
    │   └── review.html
    └── admin/
        ├── export.html
        ├── versions.html
        └── reports.html
```

---

## Design system

### Màu sắc

```css
/* Light mode */
--color-bg:           #f8f7f4;
--color-surface:      #ffffff;
--color-border:       #e5e3dc;
--color-text:         #1a1a1a;
--color-text-muted:   #6b6b6b;
--color-accent:       #2b6cb0;   /* deep blue — link, CTA */

/* Status */
--color-unassigned:   #888780;   /* gray */
--color-in-progress:  #378ADD;   /* blue */
--color-pending:      #BA7517;   /* amber */
--color-approved:     #3B6D11;   /* green */

/* Canvas editor (dark) */
--color-canvas-bg:    #1c1c1e;
--color-sidebar-dark: #242424;
--color-toolbar-dark: #2a2a2a;
```

### Typography

```css
/* Heading: Fraunces (Google Fonts) */
/* Body:    Inter / system-ui */

--text-xs:   11px;
--text-sm:   13px;
--text-base: 15px;
--text-lg:   18px;
--text-xl:   22px;
--text-2xl:  28px;

line-height body: 1.6
line-height heading: 1.15
max-width body text: 65ch
```

### Component tokens

| Component | Quy tắc |
|---|---|
| Button primary | `background: var(--color-accent)`, padding `0.75rem 1.5rem`, radius `4px` |
| Button secondary | `border: 1px solid var(--color-border)`, transparent bg |
| Button danger | `background: #A32D2D` |
| Card | `border: 1px solid var(--color-border)`, no shadow, radius `6px` |
| Badge | Inline pill, màu theo status, font-size `11px` |
| Input | Height `36px`, border `1px solid var(--color-border)`, radius `4px` |
| Modal | Centered overlay, max-width `560px` |
| Toast | Bottom-right, auto-dismiss 3s |

### Layout variants

| Variant | Dùng cho |
|---|---|
| Default | Sidebar 240px + main content |
| Full-screen | Annotation editor (không có sidebar thường) |
| Auth | Không sidebar, centered card |

---

## Phase 1 — Foundation

**Thời gian:** Tuần 1  
**Mục tiêu:** Có design system và layout dùng chung trước khi build bất kỳ screen nào

### `styles/base.css`

- CSS custom properties: màu, spacing scale (4px/8px base), border-radius
- Dark mode qua `prefers-color-scheme`
- Typography: import Google Fonts, heading/body scale
- Reset và base styles

### `styles/components.css`

- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-ghost`
- `.badge`, `.badge-unassigned`, `.badge-in-progress`, `.badge-pending`, `.badge-approved`
- `.card`, `.metric-card`
- `.input`, `.select`, `.textarea`
- `.table`, `.table-striped`
- `.modal`, `.modal-overlay`
- `.toast`
- `.skeleton` (loading state)
- `.empty-state`

### `components/layout.html`

- Sidebar trái cố định 240px: logo, nav items (hiển thị theo role)
- Topbar: breadcrumb trái, user avatar + dropdown phải
- Main content area co giãn
- Responsive: sidebar collapse thành icon-only ở `< 768px`
- Nav items: 3 group collapsible, hiển thị toàn bộ trên mọi trang
  - **Admin** (shield icon): Dashboard (`dashboard/admin.html`), Người dùng (`admin/users.html`), Báo cáo (`admin/reports.html`)
  - **Dự án** (folder icon): Danh sách, Chi tiết dự án, Upload ảnh, Phân công, Export dataset, Versions
  - **Annotator** (pen icon): Dashboard (`dashboard/annotator.html`), Gắn nhãn (`annotate/editor.html`), Review (`annotate/review.html`)
- Toggle JS: `toggleGroup(btn)` — `.collapsed` trên header, `.hidden` trên body
- CSS: `.nav-group`, `.nav-group-hd`, `.nav-group-bd`, `.nav-group-chevron`

### `components/ui.html`

Trang showcase tất cả components — dùng làm reference khi build screens tiếp theo. Không có logic, chỉ visual states.

---

## Phase 2 — Core screens

**Thời gian:** Tuần 2  
**Mục tiêu:** Luồng cơ bản: login → xem dự án → xem danh sách ảnh

### `pages/login.html`

**Layout:** Auth (không sidebar, centered)

UI:
- Logo + tên sản phẩm
- Nút `Đăng nhập bằng GitLab` với icon GitLab
- Footer: version number, liên hệ IT support

States cần prototype:
- Default
- Loading (spinner, button disabled)
- Error: "Đăng nhập thất bại. Vui lòng thử lại."

---

### `pages/projects/index.html`

**Roles:** Admin (thấy nút tạo mới) · Annotator & AI team (chỉ thấy dự án được assign)

UI:
- Header: `h1 "Dự án"` + search bar + nút `+ Tạo dự án` (Admin only)
- Filter chips: All · Detection · Segmentation · Classification
- Grid 3 cột: project card gồm tên, loại bài toán, progress bar, số ảnh, ngày tạo
- Empty state: icon + "Chưa có dự án nào"
- Pagination

---

### `pages/projects/detail.html`

**Tabs:** Overview · Ảnh · Phân công · Thành viên · Labels · Cài đặt

UI:
- Metric cards (4): Tổng ảnh · Đã gắn nhãn · Chờ duyệt · Đã duyệt
- Tab content mặc định là Overview
- Overview: mô tả dự án, thành viên, timeline, danh sách class label
- Action bar: **Export** only (Admin) — Upload và Phân công đã chuyển vào tab tương ứng

---

#### Tab "Phân công" — Giao theo thư mục *(Admin only, inline trong detail)*

> Phân công theo thư mục của storage backend. Mặc định khi add thành viên vào dự án = giao toàn bộ.

Tab Phân công có **2 sub-tab** (border-bottom underline style):
- **Theo thư mục** *(default active)* — xem và giao theo cấu trúc thư mục
- **Theo thành viên** — xem phạm vi từng người, sửa scope

**Sub-tab "Theo thư mục" — Bảng thư mục (tree 2 cấp, default expanded):**
- Mặc định hiển thị 2 cấp (depth configurable trong Cài đặt)
- **Folder cha**: chevron expand/collapse + icon màu + path monospace · số ảnh · avatar stack + chip "Toàn bộ"/"N người" · progress · nút Sửa
- **Folder con**: indent 22px + ký tự `└` + icon xám · avatar mờ + badge italic "↑ Kế thừa" nếu không override · badge "Override" amber nếu có gán riêng
- Thư mục chưa giao: row mờ, nút "Giao" primary
- Card header hiển thị path gốc (`data/raw/`) + badge "Depth 2"

**Sub-tab "Theo thành viên" — Phạm vi từng thành viên:**
- Mỗi người: avatar + tên · chip phạm vi ("Toàn bộ dự án" xanh / tên folder xám) · Đang làm · Hoàn thành · Tỉ lệ duyệt · nút "Sửa phạm vi"
- Hàng quá hạn: highlight amber + badge "Quá hạn"

**Modal "Giao / Sửa thư mục"** (dùng cho cả folder row lẫn "Sửa phạm vi"):
- Tiêu đề = tên folder hoặc tên người
- Checklist annotators: thành viên "Toàn bộ" → checkbox checked + disabled + chip "Toàn bộ"; các người khác toggle tự do
- Nút Lưu / Hủy

**Modal "Phân công tự động"**:
- Dropdown thư mục áp dụng (mặc định: chưa giao)
- Dropdown phương thức: Chia đều / Theo tỉ lệ hoàn thành
- Preview: avatar + tên + số ảnh + folder
- Nút Xác nhận / Hủy

---

#### Tab "Labels" — Quản lý class labels

Labels đi theo **project type** (Detection / Segmentation / Classification). Hai nhóm rõ ràng:

**Labels từ template** (khóa — không xóa được, có thể ẩn/hiện từng class):
- Hiển thị tên template pack + số class: "YOLO Detection Common · 5 classes"
- Mỗi hàng có toggle on/off → khi off, hàng mờ (opacity 0.5) và class không hiện trong editor
- Không có nút xóa; chỉ có Sửa màu/phím tắt khi đang bật

**Labels tùy chỉnh** (full CRUD):
- Thêm, sửa màu, sửa phím tắt, xóa
- Nút "+ Thêm class mới" inline ở footer card

**Header bar** của tab:
- Tên "Class Labels" + chip loại dự án (vd: "Detection")
- Nút "Chọn template" (secondary) → mở modal
- Nút "+ Thêm class" (primary) → mở modal

**Modal "Thêm class"** (max-width 440px):
- Input tên class (lowercase, dùng _)
- Color picker: 8 swatches preset + selected state
- Input phím tắt (tùy chọn, auto-gán)

**Modal "Chọn template"** (max-width 500px):
- Tiêu đề + ghi chú loại dự án
- Danh sách template options (radio-like):
  - YOLO Detection Common (vehicle, person, bicycle, truck, motorcycle)
  - COCO 80 classes
  - Xe cộ & Biển số (car, truck, motorcycle, license_plate, plate_text)
  - Không dùng template
- Warning: đổi template thay labels mặc định, không ảnh hưởng annotations
- Nút Áp dụng template / Hủy

---

#### Tab "Thành viên" — Quản lý thành viên dự án *(Admin only)*

UI:
- Header: "Thành viên dự án" + nút `+ Thêm thành viên` (primary)
- Bảng thành viên hiện tại:

| Cột | Nội dung |
|---|---|
| Thành viên | Avatar + Tên đầy đủ + email |
| Vai trò | Badge: `Annotator` / `Reviewer` / `Admin` |
| Tham gia | Ngày được thêm vào dự án |
| Tiến độ | Mini progress bar: ảnh hoàn thành / được giao |
| Hành động | Đổi vai trò · Xóa khỏi dự án |

- Badge vai trò có màu riêng: Admin → blue · Reviewer → purple · Annotator → gray

**Modal "Thêm thành viên"** (`max-width: 560px`):
- Search field: tìm theo tên hoặc email (gợi ý từ user directory / GitLab)
- Danh sách kết quả tìm kiếm: Avatar + Tên + Email + nút `Thêm`
- Dropdown chọn vai trò trong dự án: `Annotator` (default) · `Reviewer` · `Admin`
- Thêm nhiều người cùng lúc: danh sách "Sẽ thêm" phía dưới search, có thể xóa từng người
- Nút `Xác nhận thêm` / `Hủy`
- Success toast: "Đã thêm 2 thành viên vào dự án"

**Inline action — Đổi vai trò**:
- Click icon bút chì trên row → dropdown chọn vai trò mới inline
- Confirm bằng click ngoài hoặc Enter
- Toast: "Đã cập nhật vai trò của Nguyễn A thành Reviewer"

**Inline action — Xóa khỏi dự án**:
- Click icon xóa → confirm dialog nhỏ: "Xóa [Tên] khỏi dự án? Các ảnh đang giao sẽ trở về trạng thái chưa phân công."
- Nút `Xóa` (danger) · `Hủy`

**States cần prototype**:
- Empty state: "Chưa có thành viên nào. Thêm thành viên để bắt đầu phân công."
- Search không có kết quả: "Không tìm thấy người dùng nào."
- Cảnh báo nếu xóa Admin cuối: "Dự án phải có ít nhất một Admin."

---

### `pages/projects/images.html` *(standalone — vẫn giữ)*

> Tab "Ảnh" trong `detail.html` giờ chứa toàn bộ bộ quản lý ảnh inline. `images.html` giữ làm standalone fallback / deep-link.

#### Tab "Ảnh" trong `detail.html` *(inline image manager)*

UI:
- **Storage banner**: repo URL + path gốc + trạng thái kết nối + nút Đồng bộ ngay + link Cài đặt
- **Folder path navigator** (giữa banner và toolbar):
  - Breadcrumb: `data/raw/` / `[batch_day/ ▾]` — click segment cha để về root, click tên folder hiện tại để mở dropdown
  - Dropdown picker: tree 2 cấp — folder cha + folder con indent, mỗi item hiển thị số ảnh + nút trash (hover) để xóa
  - Phải: `480 ảnh trong thư mục này` + nút **Upload vào [tên folder]** (primary) + nút **Tạo thư mục** (secondary)
  - Tạo thư mục: modal nhập tên + hiển thị thư mục cha; xóa thư mục: confirm dialog
- **Grid view**: hiển thị folder cards (nền accent-light, folder icon) trước image cards cho các thư mục con
- **List view**: section header "Thư mục con · N" + folder rows (folder icon thumbnail, tên, số ảnh, assignees inherited) + section header "Ảnh · N" + image rows
  - Folder row click → navigate vào thư mục đó; nút "Mở" bên phải
- Toolbar: search tên file + filter chip status + dropdown người thực hiện + toggle Grid/List
- **Bulk action bar** (sticky top, hiện khi chọn ≥1 ảnh): Phân công · Đổi trạng thái · Xóa · Bỏ chọn
- **Grid view**: grid auto-fill minmax 148px, mỗi card — placeholder gradient theo status, badge góc phải, checkbox góc trái (hiện khi hover/selected), tên file + assignee
- **List view**: table Checkbox · Thumb · Tên file+dimensions · Trạng thái · Người thực hiện · Cập nhật · Action (Gắn nhãn / Review / Xem)
- Pagination (31 trang)

---

### `pages/projects/upload.html`

UI:
- Drop zone lớn, dashed border, icon upload + text hướng dẫn
- Hỗ trợ: `.jpg`, `.jpeg`, `.png`, `.zip`
- Khi có file: danh sách preview (tên file, kích thước, thumbnail nhỏ)
- Với file `.zip`: hiện "Giải nén: 142 ảnh"
- Progress bar per file + overall progress
- States: idle · dragging · uploading · done · error

**Section "Phương thức upload khác"** (bên dưới dropzone):
- Banner hiển thị storage backend đang cấu hình + trạng thái kết nối + link → Cài đặt
- Tabs: `Git / DVC` · `rsync / SSH` · `API`
- Tab Git: 2 bước (git add/commit/push → dvc push) với code block + copy button + nút "Đồng bộ ngay"
- Tab rsync: lệnh rsync và scp có sẵn path server từ config
- Tab API: curl snippet upload đơn + batch, link API docs

---

## Phase 3 — Annotation Tool

**Thời gian:** Tuần 3–4 (2 tuần vì phức tạp nhất)  
**Mục tiêu:** Canvas editor đầy đủ interaction, dark theme, layout 3-panel

### `pages/annotate/editor.html`

**Layout:** Full-screen, dark theme độc lập với layout thường

```
┌─────────────────────────────────────────────────────────┐
│ topbar-dark: tên dự án > tên ảnh      [Save] [Submit]   │
├──────────┬──────────────────────────────┬───────────────┤
│ panel-L  │        canvas area           │   panel-R     │
│ 240px    │       (flex-1)               │   260px       │
│          │                              │               │
│ image    │  toolbar (bbox/poly/select/  │ class list    │
│ list     │  zoom/undo/redo)             │ + shortcut    │
│          │                              │               │
│ prev/    │  [image on dark bg]          │ annotations   │
│ next     │                              │ on this img   │
│          │  statusbar: coords, zoom %,  │               │
│          │  autosave indicator          │ [Submit]      │
└──────────┴──────────────────────────────┴───────────────┘
```

**Panel trái — Image list**
- Danh sách ảnh được giao (scroll)
- Thumbnail nhỏ + status badge + tên file
- Ảnh đang xem: highlighted border
- Nút Prev / Next ở bottom

**Toolbar (ngang, trên canvas)**

| Tool | Phím tắt | Icon |
|---|---|---|
| Select | `V` | cursor |
| Bounding Box | `B` | square |
| Polygon | `P` | pentagon |
| Zoom In | `+` | zoom-in |
| Zoom Out | `-` | zoom-out |
| Undo | `Ctrl+Z` | arrow-back |
| Redo | `Ctrl+Shift+Z` | arrow-forward |

- Active state: background sáng hơn, border highlight
- Tooltip khi hover: tên tool + phím tắt

**Canvas area**
- Background `#1c1c1e`
- Ảnh render centered, fit trong viewport
- Bbox: rect có resize handles 4 góc + 4 cạnh
- Polygon: điểm click với circle handles, double click đóng
- Zoom/pan: scroll để zoom, Space + drag để pan
- Placeholder mock: render ảnh tĩnh + 2–3 bbox demo

**Panel phải — Labels & Annotations**

*Section 1: Class list*
- Mỗi class: color swatch 12px + tên class + badge phím tắt `1`–`9`
- Click để chọn class → active state

*Section 2: Annotation list*
- Mỗi item: icon type (rect/polygon) + tên class + nút xóa
- Hover item → highlight annotation tương ứng trên canvas (mock bằng CSS)

*Section 3: Actions*
- Indicator: `✓ Đã tự lưu lúc 14:32`
- Nút `Lưu nháp` (secondary)
- Nút `Nộp để duyệt` (primary)

---

### `pages/projects/assign.html`

UI:
- Header: tên dự án + "Phân công ảnh"
- Summary bar: tổng ảnh chưa phân công
- Bảng annotators: Avatar · Tên · Đang làm · Hoàn thành · Quota · Action
- Action per row: "Giao thêm" dropdown (nhập số lượng hoặc chọn ảnh cụ thể)
- Bulk assign: chọn ảnh từ grid → giao cho người
- Cảnh báo overdue: row highlight amber nếu có ảnh quá hạn

---

### `pages/annotate/review.html`

**Roles:** Admin / Reviewer

UI:
- Layout tương tự editor nhưng canvas read-only (không vẽ được)
- Panel phải thay bằng review form:
  - Tiêu đề "Kiểm tra annotation"
  - Checklist tiêu chí (optional)
  - Textarea ghi chú
  - Nút `Duyệt` (green) · `Trả lại` (amber — bắt buộc nhập ghi chú)
- Navigation: Prev / Next trong batch review

---

## Phase 4 — Dashboard & Admin

**Thời gian:** Tuần 5  
**Mục tiêu:** Dashboard theo role, export, version management, báo cáo

### `pages/dashboard/annotator.html`

UI:
- Greeting: "Xin chào, [Tên] 👋"
- Metric cards (3): Được giao · Hoàn thành · Trả lại cần sửa
- CTA nổi bật: `▶ Tiếp tục gắn nhãn` (ảnh tiếp theo trong queue)
- Queue section: 5 ảnh tiếp theo, thumbnail + tên dự án + deadline
- Progress tuần này: progress bar `38/50 ảnh`

---

### `pages/dashboard/admin.html`

UI:
- Metric cards (4): Tổng ảnh · Hoàn thành · Chờ duyệt · Trả lại
- Bar chart (Chart.js): ảnh hoàn thành theo ngày (7 ngày gần nhất)
- Donut chart: phân bố trạng thái toàn bộ dataset
- Bảng team: Annotator · Hoàn thành · Tỉ lệ duyệt · Đang làm
- Recent activity feed: "Nguyễn A hoàn thành 12 ảnh · 2h trước"

---

### `pages/admin/users.html` — Quản lý người dùng hệ thống *(Admin only)*

**Header**: "Quản lý người dùng" + nút "+ Mời người dùng" (primary)

**Stats bar** (4 thẻ): Tổng tài khoản · Đang hoạt động · Admin hệ thống · Ngừng hoạt động

**Filter bar**: Search (tên/email) + chips: Tất cả | Admin | Member | Ngừng HĐ | Đã mời

**Bảng người dùng** (6 cột):

| Cột | Nội dung |
|---|---|
| Người dùng | Avatar + Tên + Email |
| Vai trò hệ thống | Badge Admin/Member + icon bút chì → đổi inline |
| Dự án | Số dự án đang tham gia |
| Hoạt động cuối | Relative time |
| Trạng thái | Badge: Hoạt động / Ngừng HĐ / Đã mời |
| Hành động | Tuỳ theo trạng thái (xem bên dưới) |

**Trạng thái người dùng và action tương ứng:**
- **Hoạt động (Admin hệ thống)**: Đặt lại MK · icon ngừng HĐ (ghost)
- **Hoạt động (Member)**: Ngừng HĐ
- **Ngừng HĐ**: hàng mờ opacity .55 · Kích hoạt · Xóa (danger text)
- **Đã mời**: hàng nền vàng nhạt · Gửi lại · Hủy

**Inline đổi vai trò**: Click icon bút chì cạnh badge → dropdown nổi (Admin/Member), click ngoài để đóng

**Modal "Mời người dùng"** (max-width 480px):
- Input email + nút "+ Thêm email" → staged list (có thể xóa từng email)
- Select vai trò hệ thống: Member (default) / Admin
- Textarea ghi chú (tùy chọn)
- Gửi lời mời cho nhiều người cùng lúc

**Confirm "Ngừng hoạt động"**: Ghi rõ dữ liệu annotation được giữ nguyên, có thể kích hoạt lại

**Confirm "Xóa vĩnh viễn"**: Cảnh báo không thể hoàn tác

---

### `pages/admin/export.html`

UI:
- Form export:
  - Radio format: `YOLOv8` · `COCO JSON` · `ImageFolder`
  - Slider train/val/test: default 70 / 20 / 10 (tổng = 100)
  - Checkbox: "Chỉ xuất ảnh đã duyệt" (mặc định checked)
  - Preview: "Sẽ xuất 1,240 ảnh — train: 868 / val: 248 / test: 124"
- Nút `Tạo file .zip`
- Bảng lịch sử export: Ngày · Format · Số ảnh · Người tạo · Tải về

---

### `pages/admin/versions.html`

UI:
- Timeline dọc: v1 → v2 → v3 → latest
- Mỗi version card: số version · ngày tạo · số ảnh · diff với version trước (`+48 ảnh, 3 label mới`)
- DVC command được generate sẵn:  
  ```
  dvc pull dataset/v2
  ```
  Nút copy vào clipboard
- Nút `Đặt làm phiên bản chính` · `Khôi phục`

---

### `pages/admin/reports.html`

UI:
- Date range picker (filter)
- Bar chart ngang: phân bố class label — class nào nhiều/ít annotation
- Line chart: ảnh hoàn thành theo ngày
- Bảng annotator performance: Tên · Tổng hoàn thành · Tỉ lệ duyệt · Tỉ lệ trả lại · Avg. thời gian/ảnh
- Lịch sử sync DVC: ngày · version · người trigger · trạng thái

---

## Checklist build order

```
Phase 1
  [ ] styles/base.css
  [ ] styles/components.css
  [ ] components/layout.html
  [ ] components/ui.html

Phase 2
  [ ] pages/login.html
  [ ] pages/projects/index.html
  [ ] pages/projects/detail.html
  [ ] pages/projects/images.html
  [ ] pages/projects/upload.html

Phase 3
  [ ] pages/annotate/editor.html        ← 2–3 ngày riêng
  [ ] pages/projects/assign.html
  [ ] pages/annotate/review.html

Phase 4
  [ ] pages/dashboard/annotator.html
  [ ] pages/dashboard/admin.html
  [ ] pages/admin/export.html
  [ ] pages/admin/versions.html
  [ ] pages/admin/reports.html
```

---

## Dependencies (CDN, không cần build step)

| Thư viện | Dùng cho | CDN |
|---|---|---|
| Google Fonts | Fraunces + Inter | fonts.googleapis.com |
| Lucide Icons | Icon set | unpkg.com/lucide |
| Chart.js | Dashboard charts, reports | cdnjs.cloudflare.com |
| Konva.js | Canvas annotation (Phase 3) | cdnjs.cloudflare.com |

---

## Ghi chú kỹ thuật

**Storage backends** — mỗi dự án có một storage backend cấu hình trong tab Cài đặt:

| Backend | Dùng khi | Upload path |
|---|---|---|
| Git repo (DVC) | Dataset quản lý qua GitLab + DVC | git push + dvc push |
| Thư mục server | NFS / server nội bộ | rsync, scp, hoặc web UI |

Cấu hình gồm: URL/path · branch hoặc host · giao thức · trạng thái kết nối. Các lệnh trong `upload.html` tự điền path từ config dự án.

---

**Annotation editor** dùng dark theme riêng biệt — không kế thừa `base.css` màu sắc thông thường. File `editor.html` tự quản lý CSS vars cho canvas context.

**Role simulation** trong prototype: thêm query param `?role=admin` hoặc `?role=annotator` để toggle visibility của các element theo role, dùng JS đơn giản không cần auth thật.

**Responsive priority**: mobile-first nhưng annotation editor chỉ cần desktop (≥ 1280px) vì canvas tool không phù hợp màn hình nhỏ.

**Handoff sang Next.js**: mỗi `pages/*.html` tương ứng 1 route trong App Router. `components/layout.html` → `app/layout.tsx`. `styles/base.css` → chuyển sang CSS Modules hoặc Tailwind config.
