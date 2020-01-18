chrome.browserAction.onClicked.addListener(function (tab) {
    console.log('Injecting content script(s)');
    chrome.tabs.executeScript(tab.id, {
        code: 'document.getElementById(\'description\').innerText;'
    }, receiveText);
});

function receiveText(resultsArray) {
    console.log(resultsArray[0]);
}