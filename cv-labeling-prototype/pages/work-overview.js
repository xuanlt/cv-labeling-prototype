function switchStats(tab, btn) {
      document.getElementById('stats-week').style.display  = tab === 'week'  ? '' : 'none';
      document.getElementById('stats-month').style.display = tab === 'month' ? '' : 'none';
      btn.closest('.stats-tabs').querySelectorAll('.stats-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }

    function applyRoleView() {
      const params = new URLSearchParams(window.location.search);
      const role = params.get('role') || 'hybrid';
      const normalized = ['annotator', 'reviewer', 'hybrid'].includes(role) ? role : 'hybrid';

      document.querySelectorAll('.annotator-only').forEach(el => el.classList.toggle('role-hidden', normalized === 'reviewer'));
      document.querySelectorAll('.reviewer-only').forEach(el => el.classList.toggle('role-hidden', normalized === 'annotator'));
      document.querySelectorAll('[data-role-copy]').forEach(el => {
        el.style.display = el.dataset.roleCopy === normalized ? '' : 'none';
      });

      const badge = document.querySelector('.role-badge');
      if (badge) badge.textContent = normalized === 'hybrid' ? 'Reviewer + Annotator' : normalized;
    }

    function confirmBulkApprove() {
      window.alert('Prototype: Duyệt tất cả chỉ áp dụng cho ảnh trong bộ lọc hiện tại, không có flag và đã qua tiêu chí kiểm tra.');
    }

    function quickPreview(filename) {
      window.alert(`Prototype: mở preview lớn cho ${filename} kèm annotations đã gán.`);
    }

    applyRoleView();
