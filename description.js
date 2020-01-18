var timestamps = [];
ytplayercurrent = document.getElementsByClassName('ytp-time-current');
ytplayertotal = document.getElementsByClassName('ytp-time-duration');
const api_key = 'AIzaSyChX7b0VFxndHfnqsbMCXRFXzVmMTBlTcQ';

window.onload = () => {
    totalTime = calculateTime(ytplayertotal[0].innerText.toString().split(":"));
    let video_id = window.location.search.split('v=')[1];
    if (video_id.includes('&')) {
        let ampersandPosition = video_id.indexOf('&');
        if (ampersandPosition != -1) {
            video_id = video_id.substring(0, ampersandPosition);
        }
    }
    let url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${video_id}&fields=items/snippet/title,items/snippet/description&key=${api_key}`;
    console.log(url);

    fetch(url)
        .then((data) => {
            return data.json();
        })
        .then((response) => {
            let description = response.items[0].snippet.description;
            let duration = $('.ytp-time-duration').text();
            console.log(duration);
            parseDescription(description);
        })
        .catch((error) => {
            console.log(error);
        });

    onmousedown = () => {
        timestamps.push(ytplayercurrent[0].innerText);
        currentTime = calculateTime(ytplayercurrent[0].innerText.toString().split(":"));
        timestamps.push(currentTime);
        placement = currentTime/totalTime;
        console.log(timestamps);
        console.log(placement);
    };
    $('.ytp-progress-list').prepend(
        '<div class="ytstmp-mrkr" style=background-color:#00FFFF;width:.40%;left:10%;z-index:100000;height:175%;position:relative;top:-0.35em;></div>'
    );
};

function parseDescription(description) {
    let lines = description.split('\n');
    let timestamps = [];
    for (line of lines) {
        const regex = /([1-9]?[0-9]:)?[0-5]?[0-9]:[0-5][0-9]/;
        if (regex.test(line)) {
            let text = line.replace(regex, '');
            let stamp = line.match(regex)[0];
            console.log({ text, stamp });
            timestamps.push({ text, stamp });
        }
    }
    return timestamps;
}

function calculateTime(time){
    let totalTime = 0;
    let position = time.length - 1; 
    let multiplier = 1;
    while(position >= 0){
        totalTime += time[position] * multiplier;
        multiplier = multiplier * 60;
        position -= 1;
    }
    return totalTime;
}