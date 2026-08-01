const fs = require('fs');
const path = require('path');

// All functions that need window exposure (called from HTML onclick= attributes)
const windowExports = {
  'auth.js': ['doGoogleSignIn','doSignOut','doLogin','doForgotPass','doForgotUser'],
  'core.js': ['showPage','showModal','closeModal','toggleMobileSidebar','closeMobileSidebar','goBack','goHome','toggleTheme','highlightNav','updateNavButtons','setJTab','esc'],
  'ui.js': ['setAMPM','setEndAMPM','autoToggleAMPM','getPickedTime','getPickedEndTime','pickEmoji','requestNotifPermission','printPage','showCategoryMenu','gsearchRun','gsearchActEl','gsearchAct','gsearchBlur','gsearchKey'],
  'home-blocks.js': ['renderHomeBlocks','homeBlockClick','homeBlockDragStart','homeBlockDragOver','homeBlockDrop','homeBlockDragEnd','hbSaveOrder','hbLoadOrder'],
  'quicklinks.js': ['qlLoad','qlSave','renderQuickLinks','qlOpenModal','qlSelectItem','qlSaveShortcut','qlDelete'],
  'hie.js': ['hieLoad','hieOpenModal','hieTab','hiePickEmoji','hieEmojiTyped','hieFileChosen','hieSave'],
  'sidebar-groups.js': ['sgToggleCollapse','sgItemDragStart','sgItemDragOver','sgItemDrop','sgItemDragEnd','sgDragStart','sgDragOver','sgDrop','sgDragEnd','sgRename','sgItemEdit','sgitemPickEmoji','sgitemEmojiTyped','sgitemClearIcon','sgItemSave','sgAddItem','sgFinCatToggle','loadSaved','saveSidebarToStorage','loadSidebarFromStorage'],
  'categories.js': ['openCatModal','renameCat','catItemDragStart','catItemDragOver','catItemDrop','catItemDragEnd','renderCatList','openCatEP','addCat','delCat','toggleEP','closeAllEPs','buildTaskColorPicker','selectTaskColor','mcatToggleEP','mcatUploadIcon','mcatHandleUpload','mcatNewUpload','mcatSave','mcatDelete','mcatAdd','onGCatChange','addCustomCategory','openManageCatsModal','renderMcatList','_epSetCat','_epSearch','_renderEP'],
  'notes.js': ['openNoteModal','nmSelectColor','nmTogglePin','nmSave','nmDelete','noteInsertFormat','noteCardToggleCb','saveNotes','renderNotes','buildNoteCard','toggleNotePin','deleteNote','fetchGoogleNotes','buildNoteColorPicker'],
  'nce.js': ['nceGetValue','nceSetValue'],
  'gcal.js': ['setGCalView','gcalToday','gcalShift','renderGCal','gcalColClick','gcalClickDayHeader','gcalOpenTask','gcalMonthCellClick','renderGCalSchedule','_schedToggleTask','_schedToggleSub'],
  'tasks.js': ['setAMPM_td','setEndAMPM_td','autoToggleAMPM_td','getTdPickedTime','getTdPickedEndTime','buildTdColorPicker','pickTdColor','tdAddSub','remTdSub','updateTdSub','tdSave','tdDelete','openAddTaskModal','addTaskDateChanged','addNewSub','updateNewSub','remNewSub','onReminderChange','buildCustomReminder','onRruleChange','updateRruleFreqLabel','toggleRruleDay','scheduleTaskReminder','rescheduleAllReminders','saveTask','renderTdSubList','renderNewSubList'],
  'goals.js': ['addGoalStep','addDetailStep','toggleGoalStep','deleteGoalStep','renderGoalStepsList','renderGoalsDashboard','renderGoalsYearOverview','archToggleYear','openEditGoalModal','openAddGoalModal','saveGoal','updateGoalsCount','openGoalDetail','gdAddStep','gdDashToggleStep','gdDashStepDateChange','gdToggleStep','gdUpdateStepText','gdDeleteStep','gdSave','gdDeleteGoal','confirmReassign','goalsShowOverdue','goalsLoadTabs','goalsEditTabs','goalsEditTabsSave','goalsGoTab','goalsCarouselInit','checkStepOverdue'],
  'kanban.js': ['renderKanban','kcardComplete','kcardToggle','kbDragStart','kbDrop','kbCardDragOver','kbCardDragLeave','kbCardDrop'],
  'vehicles.js': ['openAddVehicleModal','saveVehicle','openAddMaintModal','saveMaint','viewReceipt','renderVehicles','deleteVehicle','openWorkOrderModal','saveWorkOrder','openInventoryModal','saveInventoryItem','openMileageModal','saveMileage','printMileageReport'],
  'biz.js': ['getBizData','renderBizPage','setBizTab','openBizIncomeModal','saveBizTransaction','viewBizReceipt'],
  'financials.js': ['setFinTab','renderFinPage','openFinAccount','renderFinAccount','setFinBudgetMonth','setFinOpeningBal','deleteFinAccount','openAddFinAccountModal','saveFinAccount','openBudgetItemModal','editBudgetItem','saveBudgetItem','deleteBudgetItem','openLedgerModal','saveLedgerTransaction','renderBudget','renderCheckbook','getCurrentMonthKey','getMonthLabel','getAccountBalance'],
  'state.js': ['saveData','loadData'],
  'timepicker.js': ['clockFaceClick','clockInitFace','clockKey','clockSelectMinute','clockSyncFromInputs','clockSyncHidden','clockUpdateDisplay','buildHourGrid','clockCustomMin'],
};

const srcDir = 'C:/Users/BIG D/.openclaw/workspace/ezy-life/src/';

for (const [file, fns] of Object.entries(windowExports)) {
  const filePath = srcDir + file;
  if (!fs.existsSync(filePath)) { console.log('MISSING:', file); continue; }
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove any existing window export block we added before
  content = content.replace(/\n\/\/ --- window exports ---[\s\S]*$/, '');
  
  // Add window exports at bottom
  const exports = fns.map(fn => `if (typeof ${fn} !== 'undefined') window.${fn} = ${fn};`).join('\n');
  content += '\n\n// --- window exports ---\n' + expor
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(file + ': added ' + fns.length + ' window exports');
}

console.log('Done!');
window.toggleTheme = toggleTheme
window._gcalAnchor = _gcalAnchor;
