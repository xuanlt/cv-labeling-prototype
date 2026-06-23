document.addEventListener('DOMContentLoaded', () => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const textColor = isDark ? '#8a8a88' : '#6b6b6b';
    const surfaceColor = isDark ? '#1c1c1a' : '#ffffff';

    Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
    Chart.defaults.font.size = 11;

    // Bar chart
    new Chart(document.getElementById('barChart'), {
      type: 'bar',
      data: {
        labels: ['03/06', '04/06', '05/06', '06/06', '07/06', '08/06', '09/06'],
        datasets: [{
          label: 'Ảnh hoàn thành',
          data: [42, 58, 35, 67, 48, 72, 38],
          backgroundColor: '#2b6cb0',
          borderRadius: 3,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor } },
          y: { grid: { color: gridColor }, ticks: { color: textColor }, beginAtZero: true }
        }
      }
    });

    // Donut chart
    new Chart(document.getElementById('donutChart'), {
      type: 'doughnut',
      data: {
        labels: ['Chưa phân công', 'Đang làm', 'Chờ duyệt', 'Đã duyệt'],
        datasets: [{
          data: [372, 1552, 458, 3868],
          backgroundColor: ['#888780', '#378ADD', '#BA7517', '#3B6D11'],
          borderWidth: 0,
          hoverOffset: 4,
        }]
      },
      options: {
        responsive: true,
        cutout: '65%',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.formattedValue}` } }
        }
      }
    });
  });
