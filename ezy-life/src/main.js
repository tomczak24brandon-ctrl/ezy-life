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
import { toggleTheme, renderDashboard } from './ui.js';
import { loadSidebarFromStorage, appInit } from './core.js';

window.toggleTheme = toggleTheme;
window.loadSidebarFromStorage = loadSidebarFromStorage;
window.appInit = appInit || renderDashboard;

document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.appInit === 'function') {
        window.appInit();
    } else if (typeof renderDashboard === 'function') {
        renderDashboard();
});
