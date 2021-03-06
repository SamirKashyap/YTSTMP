// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
//     if(request.todo == "showIcon"){
//         chrome.tabs.query({active:true, currentWindow: true}, function(tabs){
//             chrome.pageAction.show(tabs[0].id);
//         });
//     }
// });

//Listen for when a Tab changes state
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo && changeInfo.status == "complete") {
        //console.log("Tab updated: " + tab.url);

        chrome.tabs.sendMessage(tabId, {
            data: tab
        }, function (response) {
            console.log(response);
        });

    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.data.type === 'Ad' || request.data.type === 'Timestamp') {
        chrome.tabs.getSelected(null, function (tab) {
            chrome.tabs.sendMessage(tab.id, {
                data: request.data
            }, function (response) {
                console.log(response);
            });
        });
    }


});
