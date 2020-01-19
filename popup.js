function submit() {
    let data = {
        type: $('#type').val(),
        start: $('#start').val(),
        end: $('#end').val(),
        description: $('#description').val()
    }
    chrome.runtime.sendMessage({
        data: data
    }, (res) => {
        console.log(res)
    });
}

$(document).ready(function () {
    $('#submitButton').on('click', () => {
        submit();
    })
});