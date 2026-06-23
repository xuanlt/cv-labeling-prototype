function filterChip(el) {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
  }

  // Role simulation
  const role = new URLSearchParams(location.search).get('role') || 'admin';
  if (role !== 'admin') {
    document.getElementById('adminActions').style.display = 'none';
  }
