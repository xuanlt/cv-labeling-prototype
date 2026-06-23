/* ── Tab switching ── */
  function switchTab(id, btn) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + id).classList.add('active');
  }

  function switchTabByName(id) {
    const tabs = document.querySelectorAll('.tab');
    const tab = [...tabs].find(t => t.getAttribute('onclick') && t.getAttribute('onclick').includes("'" + id + "'"));
    if (tab) switchTab(id, tab);
  }

  /* ── Toast ── */
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(t._tid);
    t._tid = setTimeout(() => t.style.opacity = '0', 3000);
  }

  /* ── Add Member Modal ── */
  const MOCK_USERS = [
    { initials:'PD', color:'#6b3fb0', name:'Phạm Dũng',   email:'dung.pham@cvlabel.ai' },
    { initials:'HN', color:'#2b7a6b', name:'Hoàng Nga',   email:'nga.hoang@cvlabel.ai' },
    { initials:'VT', color:'#b05a2b', name:'Vũ Thanh',    email:'thanh.vu@cvlabel.ai'  },
    { initials:'KA', color:'#2b4cb0', name:'Kim Anh',     email:'anh.kim@cvlabel.ai'   },
    { initials:'QH', color:'#5a3ab0', name:'Quốc Hưng',   email:'hung.quoc@cvlabel.ai' },
  ];

  let willAdd = [];

  function openAddMember() {
    document.getElementById('modal-add-member').classList.add('open');
    document.getElementById('member-search').focus();
    willAdd = [];
    renderWillAdd();
    document.getElementById('search-results').classList.remove('visible');
    document.getElementById('member-search').value = '';
  }
  function closeAddMember() {
    document.getElementById('modal-add-member').classList.remove('open');
  }
  function closeOnOverlay(e) {
    if (e.target === e.currentTarget) closeAddMember();
  }

  function onMemberSearch(q) {
    const results = document.getElementById('search-results');
    const trimmed = q.trim().toLowerCase();
    if (!trimmed) { results.classList.remove('visible'); return; }
    const matched = MOCK_USERS.filter(u =>
      (u.name.toLowerCase().includes(trimmed) || u.email.toLowerCase().includes(trimmed)) &&
      !willAdd.find(w => w.email === u.email)
    );
    if (!matched.length) {
      results.innerHTML = `<div style="padding:var(--space-3);font-size:var(--text-sm);color:var(--color-text-muted);text-align:center;">Không tìm thấy người dùng nào.</div>`;
    } else {
      results.innerHTML = matched.map(u => `
        <div class="search-result-item" onclick="addToWillAdd('${u.email}')">
          <div class="avatar avatar-sm" style="background:${u.color};">${u.initials}</div>
          <div class="search-result-item__info">
            <div class="search-result-item__name">${u.name}</div>
            <div class="search-result-item__email">${u.email}</div>
          </div>
          <button class="btn btn-ghost btn-sm" style="flex-shrink:0;">Thêm</button>
        </div>`).join('');
    }
    results.classList.add('visible');
  }

  function addToWillAdd(email) {
    const user = MOCK_USERS.find(u => u.email === email);
    if (!user || willAdd.find(w => w.email === email)) return;
    willAdd.push(user);
    renderWillAdd();
    document.getElementById('member-search').value = '';
    document.getElementById('search-results').classList.remove('visible');
  }

  function removeFromWillAdd(email) {
    willAdd = willAdd.filter(u => u.email !== email);
    renderWillAdd();
  }

  function renderWillAdd() {
    const section = document.getElementById('will-add-section');
    const list = document.getElementById('will-add-list');
    const btn = document.getElementById('confirm-add-btn');
    if (!willAdd.length) {
      section.style.display = 'none';
      btn.disabled = true;
      return;
    }
    section.style.display = 'block';
    btn.disabled = false;
    list.innerHTML = willAdd.map(u => `
      <div class="will-add-item">
        <div class="avatar avatar-sm" style="background:${u.color};font-size:10px;">${u.initials}</div>
        <span class="will-add-item__name">${u.name}</span>
        <span style="font-size:11px;color:var(--color-text-muted);">${u.email}</span>
        <button class="will-add-remove" onclick="removeFromWillAdd('${u.email}')" title="Bỏ">×</button>
      </div>`).join('');
  }

  function confirmAddMembers() {
    const role = document.getElementById('new-member-role').value;
    const count = willAdd.length;
    closeAddMember();
    showToast(`Đã thêm ${count} thành viên vào dự án`);
    updateMemberCount(count);
  }

  function updateMemberCount(added) {
    const badge = document.querySelector('[onclick*="members"] .badge');
    if (badge) {
      const cur = parseInt(badge.textContent) || 4;
      badge.textContent = cur + added;
    }
  }

  /* ── Folder nav (Images tab) ── */
  function toggleFolderPicker(e) {
    e.stopPropagation();
    document.getElementById('folder-picker').classList.toggle('open');
  }
  document.addEventListener('click', () => {
    document.getElementById('folder-picker')?.classList.remove('open');
  });
  function setImgFolder(path, label, count) {
    document.getElementById('folder-picker').classList.remove('open');
    document.querySelectorAll('#folder-picker .fp-item').forEach(i => i.classList.remove('active'));
    event.currentTarget.classList.add('active');
    const isRoot = path === 'root';
    const displayLabel = isRoot ? 'Tất cả' : label.split('/').filter(Boolean).pop() + '/';
    document.getElementById('img-folder-label').childNodes[0].textContent = displayLabel + ' ';
    document.getElementById('img-folder-count').textContent = count.toLocaleString();
    const uploadBtn = document.getElementById('img-upload-btn');
    uploadBtn.childNodes[uploadBtn.childNodes.length - 1].textContent = isRoot ? ' Upload vào data/raw/' : ' Upload vào ' + displayLabel;
  }

  /* ── Sub-tabs (assign) ── */
  function switchSubTab(id, btn) {
    btn.closest('.sub-tabs').querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.sub-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('subpanel-' + id).classList.add('active');
  }

  /* ── Folder tree ── */
  function toggleChildren(id, chevron) {
    const rows = document.querySelectorAll('[data-parent="' + id + '"]');
    const isOpen = chevron.classList.contains('open');
    chevron.classList.toggle('open', !isOpen);
    rows.forEach(r => r.style.display = isOpen ? 'none' : '');
  }

  /* ── Folder assign ── */
  function openFolderAssign(folder, count) {
    document.getElementById('folderAssignTitle').textContent = folder;
    document.getElementById('folderAssignSub').textContent = count + ' ảnh · Chọn annotator cho thư mục này';
    document.getElementById('folderAssignModal').classList.add('open');
  }

  function openMemberScope(name) {
    document.getElementById('folderAssignTitle').textContent = 'Phạm vi của ' + name;
    document.getElementById('folderAssignSub').textContent = 'Chọn thư mục người này sẽ thực hiện';
    document.getElementById('folderAssignModal').classList.add('open');
  }

  /* ── Image manager ── */
  function imgToggleSelect(card) {
    card.classList.toggle('selected');
    card.querySelector('.image-card__checkbox').checked = card.classList.contains('selected');
    imgUpdateBulkBar();
  }
  function imgClearSelection() {
    document.querySelectorAll('#imgGridView .image-card.selected').forEach(c => {
      c.classList.remove('selected');
      c.querySelector('.image-card__checkbox').checked = false;
    });
    imgUpdateBulkBar();
  }
  function imgUpdateBulkBar() {
    const count = document.querySelectorAll('#imgGridView .image-card.selected').length;
    const bar = document.getElementById('imgBulkBar');
    document.getElementById('imgSelectedCount').textContent = count + ' ảnh đã chọn';
    bar.classList.toggle('hidden', count === 0);
  }
  function imgToggleAll(cb) {
    document.querySelectorAll('#imgListView .table input[type=checkbox]').forEach(c => c.checked = cb.checked);
  }
  function imgSetView(view) {
    const grid = document.getElementById('imgGridView');
    const list = document.getElementById('imgListView');
    const gridBtn = document.getElementById('img-gridBtn');
    const listBtn = document.getElementById('img-listBtn');
    if (view === 'grid') {
      grid.classList.remove('hidden'); list.classList.remove('active');
      gridBtn.classList.add('active'); listBtn.classList.remove('active');
    } else {
      grid.classList.add('hidden'); list.classList.add('active');
      listBtn.classList.add('active'); gridBtn.classList.remove('active');
    }
  }
  function imgFilterChip(el) {
    el.closest('.chip-group').querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
  }

  /* ── Inject delete buttons into grid image cards ── */
  document.querySelectorAll('#imgGridView .image-card:not(.folder-card) .image-card__info').forEach(info => {
    const btn = document.createElement('button');
    btn.className = 'img-del';
    btn.title = 'Xóa';
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>';
    btn.addEventListener('click', e => { e.stopPropagation(); showToast('Đã xóa ảnh'); });
    info.appendChild(btn);
  });

  /* ── Folder management ── */
  function openCreateFolder() {
    document.getElementById('modal-create-folder').classList.add('open');
    const inp = document.getElementById('new-folder-name');
    inp.value = '';
    setTimeout(() => inp.focus(), 50);
  }

  function confirmCreateFolder() {
    const name = document.getElementById('new-folder-name').value.trim();
    if (!name) return;
    document.getElementById('modal-create-folder').classList.remove('open');
    showToast('Đã tạo thư mục "' + name + '/"');
  }

  function deleteFolder(path) {
    document.getElementById('folder-picker').classList.remove('open');
    document.getElementById('confirm-delfolder-name').textContent = path;
    document.getElementById('confirm-delfolder-dialog').classList.add('open');
  }

  function doDeleteFolder() {
    const name = document.getElementById('confirm-delfolder-name').textContent;
    document.getElementById('confirm-delfolder-dialog').classList.remove('open');
    showToast('Đã xóa thư mục "' + name + '"');
  }

  function imgNavToFolder(path, label, count) {
    const displayLabel = label.split('/').filter(Boolean).pop() + '/';
    document.getElementById('img-folder-label').childNodes[0].textContent = displayLabel + ' ';
    document.getElementById('img-folder-count').textContent = count.toLocaleString();
    const uploadBtn = document.getElementById('img-upload-btn');
    uploadBtn.childNodes[uploadBtn.childNodes.length - 1].textContent = ' Upload vào ' + displayLabel;
    document.querySelectorAll('#folder-picker .fp-item').forEach(i => i.classList.remove('active'));
    showToast('Đang xem: ' + path);
  }

  /* ── Storage type toggle ── */
  function switchStorageType(type) {
    const isGit = type === 'git';
    document.getElementById('storage-git').style.display = isGit ? 'flex' : 'none';
    document.getElementById('storage-server').style.display = isGit ? 'none' : 'flex';
    const btnGit = document.getElementById('btn-git');
    const btnSrv = document.getElementById('btn-server');
    const accent = 'border-color:var(--color-accent);background:var(--color-accent-light);color:var(--color-accent);';
    const plain = '';
    btnGit.style.cssText  = isGit ? accent : plain;
    btnSrv.style.cssText  = isGit ? plain : accent + 'flex:1;justify-content:center;';
    btnGit.style.flex = '1'; btnGit.style.justifyContent = 'center';
    btnSrv.style.flex = '1'; btnSrv.style.justifyContent = 'center';
    if (isGit) { btnGit.style.borderColor='var(--color-accent)'; btnGit.style.background='var(--color-accent-light)'; btnGit.style.color='var(--color-accent)'; btnSrv.style.borderColor=''; btnSrv.style.background=''; btnSrv.style.color=''; }
    else { btnSrv.style.borderColor='var(--color-accent)'; btnSrv.style.background='var(--color-accent-light)'; btnSrv.style.color='var(--color-accent)'; btnGit.style.borderColor=''; btnGit.style.background=''; btnGit.style.color=''; }
  }

  /* ── Role change ── */
  function onRoleChange(sel, name) {
    const role = sel.value;
    const labels = { admin:'Admin', reviewer:'Reviewer', annotator:'Annotator' };
    showToast(`Đã cập nhật vai trò của ${name} thành ${labels[role]}`);
  }

  /* ── Remove member ── */
  let pendingRemoveName = '';
  let pendingRemoveRole = '';

  function confirmRemove(name, role) {
    pendingRemoveName = name;
    pendingRemoveRole = role;
    const adminRows = document.querySelectorAll('[data-role="admin"]');
    if (role === 'admin' && adminRows.length <= 1) {
      showToast('Dự án phải có ít nhất một Admin.');
      return;
    }
    document.getElementById('confirm-remove-title').textContent = `Xóa ${name} khỏi dự án?`;
    document.getElementById('confirm-remove-desc').textContent =
      'Các ảnh đang được giao sẽ trở về trạng thái chưa phân công. Hành động này không thể hoàn tác.';
    document.getElementById('confirm-remove-dialog').classList.add('open');
  }

  function closeRemoveDialog(e) {
    if (!e || e.target === e.currentTarget) {
      document.getElementById('confirm-remove-dialog').classList.remove('open');
    }
  }

  function doRemoveMember() {
    closeRemoveDialog();
    showToast(`Đã xóa ${pendingRemoveName} khỏi dự án`);
  }

  /* ── Labels tab ── */
  function openAddLabelModal() {
    document.getElementById('modal-add-label').classList.add('open');
    document.getElementById('new-label-name').value = '';
    document.getElementById('new-label-shortcut').value = '';
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
    document.querySelector('.color-swatch[data-color="#e53e3e"]').classList.add('selected');
    setTimeout(() => document.getElementById('new-label-name').focus(), 50);
  }

  function confirmAddLabel() {
    const name = document.getElementById('new-label-name').value.trim();
    if (!name) return;
    document.getElementById('modal-add-label').classList.remove('open');
    showToast(`Đã thêm class "${name}"`);
  }

  function selectLabelColor(btn) {
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
    btn.classList.add('selected');
  }

  function openTemplateModal() {
    document.getElementById('modal-choose-template').classList.add('open');
  }

  function selectTemplate(el, key) {
    document.querySelectorAll('#template-list .template-opt').forEach(o => o.classList.remove('tpl-active'));
    el.classList.add('tpl-active');
  }

  function applyTemplate() {
    const active = document.querySelector('#template-list .template-opt.tpl-active');
    const name = active ? active.querySelector('div > div:first-child').textContent.trim() : 'template';
    document.getElementById('modal-choose-template').classList.remove('open');
    showToast(`Đã áp dụng template "${name}"`);
  }

  function toggleTemplateLabel(name) {
    const row = document.getElementById('lrow-t-' + name);
    const btn = document.getElementById('lt-' + name);
    const isOn = btn.classList.toggle('on');
    row.classList.toggle('lrow-inactive', !isOn);
    btn.title = isOn ? 'Ẩn class' : 'Hiện class';
  }
