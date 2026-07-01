let toastTimer;
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.style.opacity = '0'; }, 3000);
  }

  function setFilter(btn) {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
  }

  /* ── Role change inline ── */
  function openRoleSelect(wrapId) {
    const sel = document.getElementById(wrapId.replace('role-wrap', 'role-select'));
    sel.classList.toggle('open');
    document.addEventListener('click', function close(e) {
      if (!document.getElementById(wrapId).contains(e.target)) {
        sel.classList.remove('open');
        document.removeEventListener('click', close);
      }
    });
  }

  function changeRole(wrapId, selId, role, badgeClass, name) {
    const wrap = document.getElementById(wrapId);
    const badge = wrap.querySelector('.badge');
    badge.textContent = role;
    badge.className = 'badge ' + badgeClass;
    document.getElementById(selId).classList.remove('open');
    showToast(`Đã cập nhật vai trò của ${name} thành ${role}`);
  }

  /* ── Invite ── */
  const pendingInvites = [];

  function openInviteModal() {
    document.getElementById('modal-invite').classList.add('open');
    document.getElementById('invite-name').value = '';
    document.getElementById('invite-email').value = '';
    document.getElementById('invite-note').value = '';
    pendingInvites.length = 0;
    renderInviteList();
    setTimeout(() => document.getElementById('invite-name').focus(), 50);
  }

  function addInviteEmail() {
    const val = document.getElementById('invite-email').value.trim();
    if (!val || !val.includes('@')) return;
    if (!pendingInvites.includes(val)) {
      pendingInvites.push(val);
      renderInviteList();
    }
    document.getElementById('invite-email').value = '';
    document.getElementById('invite-email').focus();
  }

  function renderInviteList() {
    const list = document.getElementById('invite-list');
    list.innerHTML = pendingInvites.map((e, i) => `
      <div style="display:flex;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-3);background:var(--color-bg);border-radius:4px;font-size:var(--text-sm);">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        <span style="flex:1;">${e}</span>
        <button style="background:none;border:none;cursor:pointer;color:var(--color-text-muted);font-size:16px;line-height:1;padding:0 2px;" onclick="removePendingInvite(${i})">×</button>
      </div>`).join('');
  }

  function removePendingInvite(i) {
    pendingInvites.splice(i, 1);
    renderInviteList();
  }

  function confirmInvite() {
    const name = document.getElementById('invite-name').value.trim();
    const email = document.getElementById('invite-email').value.trim();
    if (email && email.includes('@')) pendingInvites.push(email);
    if (pendingInvites.length === 0) {
      showToast('Nhập ít nhất một địa chỉ email');
      return;
    }
    const count = pendingInvites.length;
    document.getElementById('modal-invite').classList.remove('open');
    showToast(count === 1 && name ? `Đã gửi lời mời đến ${name}` : `Đã gửi lời mời đến ${count} người dùng`);
  }

  /* ── Deactivate ── */
  let pendingDeactivateName = '';

  function openDeactivate(name) {
    pendingDeactivateName = name;
    document.getElementById('deactivate-title').textContent = `Ngừng hoạt động "${name}"?`;
    document.getElementById('deactivate-desc').textContent =
      `Tài khoản ${name} sẽ không thể đăng nhập. Dữ liệu và lịch sử annotation được giữ nguyên. Có thể kích hoạt lại bất kỳ lúc nào.`;
    document.getElementById('confirm-deactivate').classList.add('open');
  }

  function doDeactivate() {
    document.getElementById('confirm-deactivate').classList.remove('open');
    showToast(`Đã ngừng hoạt động tài khoản "${pendingDeactivateName}"`);
  }

  /* ── Delete ── */
  let pendingDeleteName = '';

  function openDeleteUser(name) {
    pendingDeleteName = name;
    document.getElementById('delete-user-title').textContent = `Xóa tài khoản "${name}"?`;
    document.getElementById('delete-user-desc').textContent =
      `Hành động này không thể hoàn tác. Toàn bộ dữ liệu của ${name} sẽ bị xóa vĩnh viễn.`;
    document.getElementById('confirm-delete-user').classList.add('open');
  }

  function doDeleteUser() {
    document.getElementById('confirm-delete-user').classList.remove('open');
    showToast(`Đã xóa tài khoản "${pendingDeleteName}"`);
  }
