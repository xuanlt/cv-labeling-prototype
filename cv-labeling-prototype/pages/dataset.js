let _currentProject = null;
  let _currentImages = 0;
  let _currentVer = 0;
  let _currentFmt = 'yolo';

  const fmtLabels = { yolo: 'YOLOv8', coco: 'COCO JSON', folder: 'ImageFolder' };
  const typeSuggest = { DETECTION: 'yolo', SEGMENTATION: 'coco', CLASSIFICATION: 'folder' };

  function openExport(name, type, suggestedFmt, images, lastVer) {
    _currentProject = name;
    _currentImages = images;
    _currentVer = lastVer;
    _currentFmt = suggestedFmt;

    document.getElementById('modalTitle').textContent = 'Export · ' + name;
    document.getElementById('modalMeta').textContent = type + ' · ' + images.toLocaleString() + ' ảnh đã duyệt';

    // Reset format selection
    document.querySelectorAll('.fmt-opt').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('input[name=fmt]').forEach(el => el.checked = false);

    // Hide all suggest tags
    ['suggestYolo','suggestCoco','suggestFolder'].forEach(id => document.getElementById(id).style.display = 'none');

    // Apply suggestion
    const suggest = typeSuggest[type] || suggestedFmt;
    const suggestMap = { yolo: 'suggestYolo', coco: 'suggestCoco', folder: 'suggestFolder' };
    const fmtElMap = { yolo: 'fmtYolo', coco: 'fmtCoco', folder: 'fmtFolder' };
    document.getElementById(suggestMap[suggest]).style.display = 'block';
    document.getElementById(fmtElMap[suggest]).classList.add('selected');
    document.querySelector(`input[value="${suggest}"]`).checked = true;
    _currentFmt = suggest;

    updatePreview();
    document.getElementById('exportModal').style.display = 'flex';
  }

  function closeExport() {
    document.getElementById('exportModal').style.display = 'none';
  }

  function selectFmt(fmt, el) {
    document.querySelectorAll('.fmt-opt').forEach(e => e.classList.remove('selected'));
    el.classList.add('selected');
    _currentFmt = fmt;
    document.getElementById('previewFmt').textContent = fmtLabels[fmt];
  }

  function syncSplit(field) {
    const val = parseInt(document.getElementById(field + 'Slider').value);
    document.getElementById(field + 'Pct').value = val;
    updatePreview();
  }

  function updatePreview() {
    const t = parseInt(document.getElementById('trainPct').value) || 0;
    const v = parseInt(document.getElementById('valPct').value) || 0;
    const te = parseInt(document.getElementById('testPct').value) || 0;
    const total = t + v + te;
    const warn = document.getElementById('splitWarn');

    if (total !== 100) {
      warn.textContent = '⚠ Tổng = ' + total + '%, cần đúng 100%';
      warn.style.color = 'var(--color-danger)';
    } else {
      warn.textContent = '';
    }

    const n = _currentImages;
    document.getElementById('previewTotal').textContent = n.toLocaleString() + ' ảnh';
    document.getElementById('previewTrain').textContent = Math.round(n * t / 100) + ' ảnh (' + t + '%)';
    document.getElementById('previewVal').textContent = Math.round(n * v / 100) + ' ảnh (' + v + '%)';
    document.getElementById('previewTest').textContent = Math.round(n * te / 100) + ' ảnh (' + te + '%)';
    document.getElementById('previewVer').textContent = 'v' + (_currentVer + 1) + ' (mới)';
    document.getElementById('previewFmt').textContent = fmtLabels[_currentFmt];
  }

  function doExport() {
    closeExport();
    showToast('Đang tạo dataset · ' + _currentProject + ' v' + (_currentVer + 1) + '...', 'success');
  }

  function showToast(msg, type) {
    const c = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = 'toast' + (type ? ' toast-' + type : '');
    el.textContent = msg;
    c.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, 3000);
  }
