let selectedCount = 0;

  function toggleSelect(card) {
    const checkbox = card.querySelector('.image-card__checkbox');
    card.classList.toggle('selected');
    checkbox.checked = card.classList.contains('selected');
    updateBulkBar();
  }

  function clearSelection() {
    document.querySelectorAll('.image-card.selected').forEach(c => {
      c.classList.remove('selected');
      c.querySelector('.image-card__checkbox').checked = false;
    });
    updateBulkBar();
  }

  function updateBulkBar() {
    const count = document.querySelectorAll('.image-card.selected').length;
    const bar = document.getElementById('bulkBar');
    const countEl = document.getElementById('selectedCount');
    if (count > 0) {
      bar.classList.remove('hidden');
      countEl.textContent = count + ' ảnh đã chọn';
    } else {
      bar.classList.add('hidden');
    }
  }

  function toggleAll(checkbox) {
    document.querySelectorAll('.table input[type=checkbox]:not(:first-child)').forEach(cb => cb.checked = checkbox.checked);
  }

  function setView(view) {
    const grid = document.getElementById('gridView');
    const list = document.getElementById('listView');
    const gridBtn = document.getElementById('gridBtn');
    const listBtn = document.getElementById('listBtn');
    if (view === 'grid') {
      grid.classList.remove('hidden');
      list.classList.remove('active');
      gridBtn.classList.add('active');
      listBtn.classList.remove('active');
    } else {
      grid.classList.add('hidden');
      list.classList.add('active');
      listBtn.classList.add('active');
      gridBtn.classList.remove('active');
    }
  }

  function filterChip(el) {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
  }

  const PROJECT_COUNTS = { '': 6250, lp: 1240, ts: 980, ped: 1420, night: 860, bike: 1120, hel: 630 };

  function filterProject(val) {
    const count = PROJECT_COUNTS[val] ?? 0;
    document.getElementById('totalCount').textContent = '(' + count.toLocaleString() + ')';
    const sel = document.getElementById('projectFilter');
    if (val) {
      sel.style.borderColor = 'var(--color-accent)';
    } else {
      sel.style.borderColor = '';
    }
  }
