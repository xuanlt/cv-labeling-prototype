function switchStats(tab, btn) {
      document.getElementById('stats-week').style.display  = tab === 'week'  ? '' : 'none';
      document.getElementById('stats-month').style.display = tab === 'month' ? '' : 'none';
      btn.closest('.stats-tabs').querySelectorAll('.stats-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
