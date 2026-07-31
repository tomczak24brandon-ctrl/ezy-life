const https = require('https');
https.get('https://ezy-life.vercel.app', r => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => {
    console.log('_showPageInternal defined:', d.includes('function _showPageInternal'));
    console.log('renderHomeBlocks defined:', d.includes('function renderHomeBlocks'));
    console.log('renderSidebar defined:', d.includes('function renderSidebar'));
    console.log('loadData defined:', d.includes('function loadData'));
    console.log('highlightNav defined:', d.includes('function highlightNav'));
    console.log('updateNavButtons defined:', d.includes('function updateNavButtons'));
    console.log('renderCalendar defined:', d.includes('function renderCalendar'));

    // Check for any syntax errors - look for the script tag end
    const scriptEnd = d.lastIndexOf('</script>');
    console.log('\n=== end of last script tag ===');
    console.log(d.substring(scriptEnd - 200, scriptEnd + 20));
  });
});
