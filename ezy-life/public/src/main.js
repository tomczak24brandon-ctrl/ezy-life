import './styles.css'
import './firebase.js'
import './state.js'
import './auth.js'
import './core.js'
import './ui.js'
import './home-blocks.js'
import './quicklinks.js'
import './hie.js'
import './sidebar-groups.js'
import './categories.js'
import './timepicker.js'
import './nce.js'
import './notes.js'
import './gcal.js'
import './tasks.js'
import './goals.js'
import './kanban.js'
import './vehicles.js'
import './biz.js'
import './financials.js'
// Expose core functions to window for HTML inline listeners
// (modules assign to window directly — no named exports needed)
if (typeof window !== 'undefined') {
  window.toggleTheme = typeof toggleTheme !== 'undefined' ? toggleTheme : null;
  window.loadSidebarFromStorage = typeof loadSidebarFromStorage !== 'undefined' ? loadSidebarFromStorage : null;
}

document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.appInit === 'function') {
        window.appInit();
    } else if (typeof window.renderDashboard === 'function') {
        window.renderDashboard();
    }
});
