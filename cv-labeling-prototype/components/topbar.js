(function () {
  var el = document.getElementById('topbar-user');
  if (!el) return;

  el.innerHTML = `
<div class="user-menu-wrap">
  <button class="topbar-avatar-btn" id="userMenuBtn" onclick="toggleUserMenu(event)">
    <div class="avatar avatar-sm" style="background:#5a8a3a;">NA</div>
    <span class="topbar-name">Nguyễn Admin</span>
    <svg class="chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
  </button>
  <div class="user-dropdown" id="userDropdown">
    <div class="user-dropdown__head">
      <div class="avatar" style="background:#5a8a3a;width:34px;height:34px;font-size:13px;flex-shrink:0;">NA</div>
      <div class="user-dropdown__info">
        <div class="user-dropdown__name">Nguyễn Admin</div>
        <div class="user-dropdown__role">Admin · ASI CVLabel</div>
        <div class="user-dropdown__email">admin@asi.vn</div>
      </div>
    </div>
    <a href="profile.html" class="dd-item">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      Hồ sơ cá nhân
    </a>
    <a href="#" class="dd-item">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      Cài đặt
    </a>
    <div class="dd-sep"></div>
    <button class="dd-item danger" onclick="doLogout()">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      Đăng xuất
    </button>
  </div>
</div>`;

  window.toggleUserMenu = function (e) {
    e.stopPropagation();
    var btn = document.getElementById('userMenuBtn');
    var dd  = document.getElementById('userDropdown');
    var open = dd.classList.toggle('open');
    btn.classList.toggle('open', open);
  };

  window.doLogout = function () {
    document.getElementById('userDropdown').classList.remove('open');
    document.getElementById('userMenuBtn').classList.remove('open');
    window.location.href = 'login.html';
  };

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.user-menu-wrap')) {
      var dd  = document.getElementById('userDropdown');
      var btn = document.getElementById('userMenuBtn');
      if (dd)  dd.classList.remove('open');
      if (btn) btn.classList.remove('open');
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var dd  = document.getElementById('userDropdown');
      var btn = document.getElementById('userMenuBtn');
      if (dd)  dd.classList.remove('open');
      if (btn) btn.classList.remove('open');
    }
  });
}());
