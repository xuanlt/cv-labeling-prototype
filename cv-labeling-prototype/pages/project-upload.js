function showToast(msg) {
    const t = document.getElementById('toast-up');
    t.textContent = msg; t.style.opacity = '1';
    clearTimeout(t._tid);
    t._tid = setTimeout(() => t.style.opacity = '0', 3000);
  }

  function switchMethod(id, btn) {
    document.querySelectorAll('.method-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.method-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('method-' + id).classList.add('active');
  }

  function copyCode(id) {
    const text = document.getElementById(id).textContent.trim();
    navigator.clipboard.writeText(text).then(() => showToast('Đã copy vào clipboard'));
  }

  // State simulation
  function setState(el, state) {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');

    const dropzone = document.getElementById('dropzone');
    const section = document.getElementById('fileListSection');

    dropzone.classList.remove('dragging');

    if (state === 'idle') {
      section.style.display = 'none';
    } else if (state === 'dragging') {
      section.style.display = 'none';
      dropzone.classList.add('dragging');
    } else if (state === 'uploading' || state === 'done' || state === 'error') {
      section.style.display = 'block';
      const pcts = { uploading: 55, done: 100, error: 80 };
      document.getElementById('overallBar').style.width = pcts[state] + '%';
      document.getElementById('overallPct').textContent = pcts[state] + '%';
    }
  }

  // Show file list on page load for demo
  document.getElementById('fileListSection').style.display = 'block';
  document.getElementById('overallBar').style.width = '55%';
  document.getElementById('overallPct').textContent = '55%';
