function switchTab(name, btn) {
    document.querySelectorAll('.report-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-projects').style.display   = name === 'projects'   ? '' : 'none';
    document.getElementById('tab-annotators').style.display = name === 'annotators' ? '' : 'none';
    if (name === 'annotators') initAnnotatorChart();
  }

  function filterProj(type, el) {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
  }

  let _chartInit = false;
  function initAnnotatorChart() {
    if (_chartInit) return;
    _chartInit = true;
    const gridColor = 'rgba(0,0,0,0.06)';
    const textColor = '#6c757d';
    Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
    Chart.defaults.font.size = 11;
    new Chart(document.getElementById('annotatorChart'), {
      type: 'bar',
      data: {
        labels: ['Trần Bình', 'Lê Chi', 'Phạm Dũng', 'Nguyễn Mai', 'Hồ Thanh'],
        datasets: [
          {
            label: 'Được duyệt',
            data: [295, 246, 126, 193, 131],
            backgroundColor: '#27AE60',
            borderRadius: 3,
            stack: 'total',
          },
          {
            label: 'Bị trả lại',
            data: [25, 34, 42, 17, 14],
            backgroundColor: '#e67e22',
            borderRadius: 3,
            stack: 'total',
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              footer: (items) => {
                const total = items.reduce((s, i) => s + i.raw, 0);
                return 'Tổng: ' + total;
              }
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor }, stacked: true },
          y: { grid: { color: gridColor }, ticks: { color: textColor }, stacked: true, beginAtZero: true }
        }
      }
    });
  }

  function showToast(msg) {
    const c = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    c.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, 3000);
  }
