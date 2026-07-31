const fs = require('fs');
const html = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');
const lines = html.split('\n');
for (var i=0; i<lines.length; i++) {
  var l = lines[i];
  if ((l.includes('goal') || l.includes('Goal')) &&
      (l.includes('var ') || l.includes('function ') || l.includes('page-goal') ||
       l.includes('id="goal') || l.includes('renderGoal') || l.includes('_goal') ||
       l.includes('goalGroup') || l.includes('GoalGroup') || l.includes('ezy_goal'))) {
    console.log('['+i+']: '+l.trim().substring(0,120));
  }
}
