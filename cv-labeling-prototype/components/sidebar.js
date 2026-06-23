(function () {
  var p = window.location.pathname;

  window.toggleGroup = function (btn) {
    btn.classList.toggle('collapsed');
    btn.nextElementSibling.classList.toggle('hidden');
  };

  function a(seg) {
    return p.endsWith(seg) ? ' active' : '';
  }

  function aAny() {
    var segs = Array.prototype.slice.call(arguments);
    return segs.some(function(s) { return p.endsWith(s); }) ? ' active' : '';
  }

  var gcv = '<svg class="nav-group-chevron" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>';

  var html = `
<div class="sidebar-logo" style="gap:10px;">
  <img src="../assets/logo.svg" alt="ASI" style="height:26px;width:auto;flex-shrink:0;display:block;">
  <span class="sidebar-logo__text" style="font-family:'Plus Jakarta Sans',system-ui,sans-serif;font-size:13px;font-weight:700;color:rgba(255,255,255,0.75);letter-spacing:.06em;line-height:1;">CV Label</span>
</div>
<nav class="sidebar-nav">
  <div class="nav-group">
    <button class="nav-group-hd" onclick="toggleGroup(this)">
      Quản trị
      ${gcv}
    </button>
    <div class="nav-group-bd">
      <a href="dashboard.html" class="nav-item${a('/pages/dashboard.html')}">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        Dashboard
      </a>
      <a href="projects.html" class="nav-item${aAny('/pages/projects.html', '/pages/project-detail.html', '/pages/project-upload.html', '/pages/project-assign.html')}">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
        Dự án
      </a>
      <a href="users.html" class="nav-item${a('/pages/users.html')}">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        Người dùng
      </a>
      <a href="library.html" class="nav-item${a('/pages/library.html')}">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        Thư viện
      </a>
      <a href="dataset.html" class="nav-item${aAny('/pages/dataset.html', '/pages/dataset-versions.html')}">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
        Dataset
      </a>
      <a href="reports.html" class="nav-item${a('/pages/reports.html')}">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        Báo cáo
      </a>
    </div>
  </div>
  <div class="nav-group">
    <button class="nav-group-hd" onclick="toggleGroup(this)">
      Nhân viên
      ${gcv}
    </button>
    <div class="nav-group-bd">
      <a href="work-overview.html" class="nav-item${a('/pages/work-overview.html')}">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        Tổng quan công việc
      </a>
      <a href="labeling.html" class="nav-item${a('/pages/labeling.html')}">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
        Nghiệp vụ gắn nhãn
      </a>
      <a href="review.html" class="nav-item${a('/pages/review.html')}">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        Reviews
      </a>
    </div>
  </div>
</nav>
<div class="sidebar-footer">
  <div class="user-row">
    <div class="avatar" style="background:#5a8a3a;">NA</div>
    <div><div class="user-row__name">Nguyễn Admin</div><div class="user-row__role">Administrator</div></div>
  </div>
</div>`;

  var el = document.getElementById('sidebar-placeholder');
  if (el) el.innerHTML = html;
}());
