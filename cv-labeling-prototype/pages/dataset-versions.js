function showToast(msg, type = '') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type ? 'toast-' + type : ''}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 3000);
  }

  function copyCmd(cmd) {
    navigator.clipboard?.writeText(cmd).then(() => showToast('Đã sao chép: ' + cmd));
  }

  function createVersion() {
    showToast('Đã tạo v4 từ ảnh đã duyệt, labels/schema, split và cấu hình export hiện tại', 'success');
  }

  function setMainVersion(version) {
    showToast(`Đã đặt ${version} làm phiên bản chính cho export/training mặc định`, 'success');
  }

  function restoreVersion(version) {
    showToast(`Đã tạo bản nháp khôi phục từ ${version}; dữ liệu hiện tại chưa bị ghi đè`);
  }
