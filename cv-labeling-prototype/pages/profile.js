/* ── Tabs ── */
  function switchTab(name) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('tab-' + name).classList.add('active');
    document.getElementById('panel-' + name).classList.add('active');
  }

  /* ── Save profile ── */
  function saveProfile(e) {
    e.preventDefault();
    showToast('Đã lưu thông tin cá nhân');
  }

  function resetProfile() {
    document.getElementById('field-name').value     = 'Nguyễn Admin';
    document.getElementById('field-display').value  = 'Nguyễn Admin';
    document.getElementById('field-email').value    = 'admin@asi.vn';
    document.getElementById('field-phone').value    = '+84 93 456 7890';
    document.getElementById('field-dept').value     = 'AI Development';
    document.getElementById('field-location').value = 'Hà Nội, Việt Nam';
    document.getElementById('field-bio').value      = 'Quản trị viên hệ thống ASI CVLabel. Phụ trách quản lý dự án và đảm bảo chất lượng dữ liệu gắn nhãn.';
    showToast('Đã đặt lại về giá trị gốc');
  }

  /* ── Password ── */
  function checkPwdStrength(val) {
    const bars = [
      document.getElementById('pbar1'),
      document.getElementById('pbar2'),
      document.getElementById('pbar3'),
      document.getElementById('pbar4'),
    ];
    const hint = document.getElementById('pwd-hint');
    bars.forEach(b => b.className = 'pwd-bar');
    if (!val) return;

    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const cls = score <= 1 ? 'filled-weak' : score === 2 ? 'filled-medium' : 'filled-strong';
    const labels = ['', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'];
    for (let i = 0; i < score; i++) bars[i].classList.add(cls);
    hint.textContent = score > 0 ? 'Độ mạnh: ' + labels[score] : 'Tối thiểu 8 ký tự, nên bao gồm chữ hoa, số và ký tự đặc biệt.';
  }

  function savePassword(e) {
    e.preventDefault();
    const cur = document.getElementById('pwd-current').value;
    const nw  = document.getElementById('pwd-new').value;
    const cfm = document.getElementById('pwd-confirm').value;
    if (!cur) { showToast('Vui lòng nhập mật khẩu hiện tại'); return; }
    if (nw.length < 8) { showToast('Mật khẩu mới tối thiểu 8 ký tự'); return; }
    if (nw !== cfm) { showToast('Mật khẩu xác nhận không khớp'); return; }
    document.getElementById('pwd-current').value = '';
    document.getElementById('pwd-new').value = '';
    document.getElementById('pwd-confirm').value = '';
    document.querySelectorAll('.pwd-bar').forEach(b => b.className = 'pwd-bar');
    document.getElementById('pwd-hint').textContent = 'Tối thiểu 8 ký tự, nên bao gồm chữ hoa, số và ký tự đặc biệt.';
    showToast('Đã cập nhật mật khẩu thành công');
  }

  /* ── Toast ── */
  let _toastTimer;
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => { t.style.opacity = '0'; }, 3000);
  }
