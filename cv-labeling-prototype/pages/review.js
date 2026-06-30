  // ─── State ─────────────────────────────────────────────────────────────────

  let currentReviewImg = 'img_0042.jpg';
  let currentFilter = 'all';
  let selectionMode = false;
  let lastSelectedImg = null;
  const selectedItems = new Set();

  const reviewStatuses = {
    'img_0038.jpg': 'approved',
    'img_0039.jpg': 'rejected',
    'img_0042.jpg': 'pending',
    'img_0043.jpg': 'pending',
    'img_0044.jpg': 'pending',
  };

  // ─── Toast ─────────────────────────────────────────────────────────────────

  function showToast(msg, color) {
    const el = document.createElement('div');
    el.style.cssText = `padding:8px 14px;background:${color || '#212529'};border:1px solid #343a40;border-radius:6px;font-size:12px;color:#f8f9fa;pointer-events:all;box-shadow:0 4px 12px rgba(0,0,0,0.15);transition:opacity 0.3s;`;
    el.textContent = msg;
    document.getElementById('toastContainer').appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 2500);
  }

  // ─── Single review actions ──────────────────────────────────────────────────

  function handleApprove() {
    reviewStatuses[currentReviewImg] = 'approved';
    updateItemStatus(currentReviewImg, 'approved');
    updateReviewCount();
    showToast('Đã duyệt · Chuyển sang ảnh tiếp theo', '#212529');
    setTimeout(() => navigateImage(1), 500);
  }

  function handleReject() {
    const note = document.getElementById('reviewNote').value.trim();
    if (!note) {
      document.getElementById('reviewNote').style.borderColor = '#dc2626';
      document.getElementById('reviewNote').focus();
      showToast('Vui lòng nhập ghi chú trước khi trả lại');
      return;
    }
    reviewStatuses[currentReviewImg] = 'rejected';
    updateItemStatus(currentReviewImg, 'rejected');
    updateReviewCount();
    document.getElementById('reviewNote').style.borderColor = '';
    showToast('Đã trả lại · Annotator sẽ nhận thông báo');
    setTimeout(() => navigateImage(1), 500);
  }

  // ─── Item status update ─────────────────────────────────────────────────────

  function updateItemStatus(imgName, status) {
    const item = document.querySelector(`.img-list-item[data-img="${imgName}"]`);
    if (!item) return;
    item.dataset.status = status;
    const dot = item.querySelector('.status-dot');
    if (dot) {
      dot.className = 'status-dot ' + status;
      dot.textContent = status === 'approved' ? 'Đã duyệt' : status === 'rejected' ? 'Trả lại' : 'Chờ duyệt';
    }
    const thumb = item.querySelector('.img-thumb');
    if (thumb) {
      const svgEl = thumb.querySelector('svg');
      if (status === 'approved') {
        thumb.style.background = 'linear-gradient(135deg,#2a3a28,#1e2832)';
        if (svgEl) svgEl.setAttribute('stroke', '#4caf50');
      } else if (status === 'rejected') {
        thumb.style.background = 'linear-gradient(135deg,#3a2a1e,#2a1e18)';
        if (svgEl) svgEl.setAttribute('stroke', '#f87171');
      } else {
        thumb.style.background = '';
        if (svgEl) svgEl.setAttribute('stroke', 'currentColor');
      }
    }
    // Re-apply filter — hide item if it no longer matches
    if (currentFilter !== 'all' && status !== currentFilter) {
      item.style.display = 'none';
    }
  }

  // ─── Filter ────────────────────────────────────────────────────────────────

  function filterReviewImages(filter, btn) {
    currentFilter = filter;
    document.querySelectorAll('.img-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.img-list-item').forEach(item => {
      const show = filter === 'all' || item.dataset.status === filter;
      item.style.display = show ? '' : 'none';
    });
    updateReviewCount();
    // Clear selection when filter changes
    if (selectionMode) clearSelection();
  }

  function updateReviewCount() {
    const total = Object.keys(reviewStatuses).length;
    const pending = Object.values(reviewStatuses).filter(s => s === 'pending').length;
    const done = total - pending;
    document.getElementById('reviewCount').textContent = `${done} / ${total}`;
  }

  // ─── Image navigation ───────────────────────────────────────────────────────

  function selectReviewImage(imgName, event) {
    // In selection mode: toggle checkbox instead of navigating
    if (selectionMode) {
      toggleSelectionFromItem(imgName, event);
      return;
    }
    if (imgName === currentReviewImg) return;
    currentReviewImg = imgName;
    document.querySelectorAll('.img-list-item').forEach(el => {
      const active = el.dataset.img === imgName;
      el.classList.toggle('active', active);
      const nameEl = el.querySelector('.img-list-item__name');
      if (nameEl) nameEl.style.color = active ? 'var(--cv-accent)' : '';
      const thumb = el.querySelector('.img-thumb');
      if (thumb) thumb.style.border = active ? '1px solid var(--cv-accent)' : '';
    });
    const crumb = document.querySelector('.breadcrumb-current');
    if (crumb) crumb.textContent = 'Review · ' + imgName;
    const lbl = document.querySelector('.mock-image-label');
    if (lbl) lbl.textContent = imgName + ' · Annotator: Trần Bình';
    document.getElementById('reviewNote').value = '';
    document.getElementById('reviewNote').style.borderColor = '';
  }

  function navigateImage(dir) {
    const items = Array.from(document.querySelectorAll('.img-list-item')).filter(el => el.style.display !== 'none');
    const idx = items.findIndex(el => el.dataset.img === currentReviewImg);
    const next = items[idx + dir];
    if (next) selectReviewImage(next.dataset.img);
    else showToast(dir > 0 ? 'Đây là ảnh cuối' : 'Đây là ảnh đầu tiên');
  }

  // ─── Selection mode ────────────────────────────────────────────────────────

  function toggleSelectionMode() {
    selectionMode = !selectionMode;
    document.getElementById('imgList').classList.toggle('selection-mode', selectionMode);
    const btn = document.getElementById('btnSelectMode');
    btn.style.color = selectionMode ? 'var(--cv-accent)' : '';
    btn.style.borderColor = selectionMode ? 'var(--cv-accent)' : '';
    document.getElementById('panelNav').style.display = selectionMode ? 'none' : '';
    document.getElementById('bulkBar').classList.toggle('visible', selectionMode);
    if (!selectionMode) clearSelection();
  }

  function toggleItemSelection(imgName, checked) {
    if (checked) selectedItems.add(imgName);
    else selectedItems.delete(imgName);
    const item = document.querySelector(`.img-list-item[data-img="${imgName}"]`);
    if (item) {
      item.classList.toggle('sel-checked', checked);
      const cb = item.querySelector('.sel-cb');
      if (cb) cb.checked = checked;
    }
    updateBulkBar();
  }

  function handleSelectionCheckbox(imgName, checked, event) {
    event.stopPropagation();
    if (event.shiftKey) {
      selectRangeTo(imgName, checked);
      return;
    }
    toggleItemSelection(imgName, checked);
    lastSelectedImg = imgName;
  }

  function toggleSelectionFromItem(imgName, event) {
    const item = document.querySelector(`.img-list-item[data-img="${imgName}"]`);
    if (!item) return;
    const shouldSelect = !selectedItems.has(imgName);
    if (event?.shiftKey) {
      selectRangeTo(imgName, shouldSelect);
      return;
    }
    toggleItemSelection(imgName, shouldSelect);
    lastSelectedImg = imgName;
  }

  function selectRangeTo(imgName, checked) {
    const visibleItems = Array.from(document.querySelectorAll('.img-list-item'))
      .filter(item => item.style.display !== 'none');
    const anchor = lastSelectedImg || imgName;
    const start = visibleItems.findIndex(item => item.dataset.img === anchor);
    const end = visibleItems.findIndex(item => item.dataset.img === imgName);
    if (start === -1 || end === -1) {
      toggleItemSelection(imgName, checked);
      lastSelectedImg = imgName;
      return;
    }
    const [from, to] = start < end ? [start, end] : [end, start];
    visibleItems.slice(from, to + 1).forEach(item => {
      toggleItemSelection(item.dataset.img, checked);
    });
    lastSelectedImg = imgName;
  }

  function selectAllVisible() {
    document.querySelectorAll('.img-list-item').forEach(item => {
      if (item.style.display === 'none') return;
      const imgName = item.dataset.img;
      toggleItemSelection(imgName, true);
    });
    lastSelectedImg = null;
    updateBulkBar();
  }

  function selectVisiblePending() {
    document.querySelectorAll('.img-list-item').forEach(item => {
      if (item.style.display === 'none' || item.dataset.status !== 'pending') return;
      toggleItemSelection(item.dataset.img, true);
    });
    lastSelectedImg = null;
    updateBulkBar();
  }

  function clearSelection() {
    selectedItems.clear();
    lastSelectedImg = null;
    syncCheckboxes();
    updateBulkBar();
  }

  function syncCheckboxes() {
    document.querySelectorAll('.img-list-item').forEach(item => {
      item.classList.remove('sel-checked');
      const cb = item.querySelector('.sel-cb');
      if (cb) cb.checked = false;
    });
  }

  function updateBulkBar() {
    const n = selectedItems.size;
    document.getElementById('bulkInfo').textContent = n ? `${n} ảnh đã chọn` : 'Chưa chọn ảnh nào';
    document.querySelectorAll('.bulk-count').forEach(el => el.textContent = n);
  }

  // ─── Bulk actions ──────────────────────────────────────────────────────────

  function bulkApprove() {
    if (!selectedItems.size) { showToast('Chưa chọn ảnh nào'); return; }
    const n = selectedItems.size;
    selectedItems.forEach(imgName => {
      reviewStatuses[imgName] = 'approved';
      updateItemStatus(imgName, 'approved');
    });
    selectedItems.clear(); syncCheckboxes(); updateBulkBar(); updateReviewCount();
    showToast(`Đã duyệt ${n} ảnh`, '#212529');
  }

  function bulkReject() {
    if (!selectedItems.size) { showToast('Chưa chọn ảnh nào'); return; }
    const n = selectedItems.size;
    selectedItems.forEach(imgName => {
      reviewStatuses[imgName] = 'rejected';
      updateItemStatus(imgName, 'rejected');
    });
    selectedItems.clear(); syncCheckboxes(); updateBulkBar(); updateReviewCount();
    showToast(`Đã trả lại ${n} ảnh`);
  }

  // ─── Fullscreen ────────────────────────────────────────────────────────────

  function toggleFullscreen() {
    const shell = document.querySelector('.app-shell');
    const entering = shell.classList.toggle('is-fullscreen');
    const icon = document.getElementById('fsIcon');
    const btn = document.getElementById('btnFullscreen');
    if (entering) {
      icon.innerHTML = '<polyline points="4 14 10 14 10 20"/><polyline points="20 14 14 14 14 20"/><polyline points="4 10 10 10 10 4"/><polyline points="20 10 14 10 14 4"/>';
      if (btn) btn.dataset.tooltip = 'Thoát toàn màn hình (F)';
    } else {
      icon.innerHTML = '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>';
      if (btn) btn.dataset.tooltip = 'Toàn màn hình (F)';
      document.querySelector('.editor-body').classList.remove('is-focus');
    }
  }

  // ─── Keyboard ──────────────────────────────────────────────────────────────

  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowUp') && !e.ctrlKey && !e.metaKey) {
      e.preventDefault(); navigateImage(-1);
    } else if ((e.key === 'ArrowRight' || e.key === 'ArrowDown') && !e.ctrlKey && !e.metaKey) {
      e.preventDefault(); navigateImage(1);
    } else if (e.key === 'f' || e.key === 'F') {
      toggleFullscreen();
    } else if (e.key === 'Tab') {
      e.preventDefault(); document.querySelector('.editor-body').classList.toggle('is-focus');
    } else if ((e.key === 'a' || e.key === 'A') && !selectionMode) {
      handleApprove();
    } else if ((e.key === 'r' || e.key === 'R') && !selectionMode) {
      handleReject();
    } else if (e.key === 'Escape') {
      if (selectionMode) toggleSelectionMode();
      else if (document.querySelector('.app-shell').classList.contains('is-fullscreen')) toggleFullscreen();
    }
  });

  // ─── Init ──────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', updateReviewCount);
