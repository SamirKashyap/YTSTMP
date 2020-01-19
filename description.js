const api_key = 'AIzaSyChX7b0VFxndHfnqsbMCXRFXzVmMTBlTcQ';

let ads = [{
    video_id: 'k8V7XV8hjDs',
    start: '10:52',
    end: '11:26'
}]

window.onload = () => {
    clearMarkers();
    doSomething();
    doSomethingElse();
    // window.addEventListener("yt-navigate-start", () => {
    //     //chrome.webNavigation.onHistoryStateUpdated( () => {
    //     duration = $('.ytp-time-duration').text();
    //     clearMarkers();
    //     doSomething();
    // });
    //doSomething();
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    //here we get the new 
    console.log("URL CHANGED: " + request.data.url);
    clearMarkers();
    doSomething();
});

function addMarker(percentage) {
    $('.ytp-progress-list').prepend(
        `<div class="ytstmp-mrkr" style=background-color:#00FFFF;width:.40%;left:${percentage}%;z-index:100000;height:175%;position:absolute;top:-0.35em;></div>`
    );
}

function addAd(start, end) {
    let width = end - start;
    console.log(start);
    console.log(width);
    $('.ytp-progress-list').prepend(
        `<div class="ytstmp-mrkr" style=background-color:#FFFF00;width:${width}%;left:${start}%;z-index:100000;height:175%;position:absolute;top:-0.35em;></div>`
    );
}

$("video").on(
    "timeupdate",
    function (event) {
        if (Math.floor(this.currentTime) === calculateTime(ads[0].start)) {
            //window.location.href = `https://www.youtube.com/watch?v=${ads[0].video_id}&t=${calculateTime(ads[0].end)}s`;
            this.currentTime = calculateTime(ads[0].end);
        }
    });

// $('.ytp-time-current').on("change", () => {
//     console.log($('.ytp-time-current').text());
//     if (time === ads[0].start) {
//         window.location.href = `https://www.youtube.com/watch?v=${ads[0].video_id}&t=${calculateTime(ads[0].end)}s`;
//     }
// })

function parseDescription(description) {
    let lines = description.split('\n');
    let timestamps = [];
    for (line of lines) {
        const regex = /([1-9]?[0-9]:)?[0-5]?[0-9]:[0-5][0-9]/;
        if (regex.test(line)) {
            let text = line.replace(regex, '');
            let stamp = line.match(regex)[0];
            console.log({
                text,
                stamp
            });
            timestamps.push({
                text,
                stamp
            });
        }
    }
    return timestamps;
}

function doSomething() {
    let video_id = window.location.search.split('v=')[1];
    if (video_id && video_id.includes('&')) {
        let ampersandPosition = video_id.indexOf('&');
        if (ampersandPosition != -1) {
            video_id = video_id.substring(0, ampersandPosition);
        }
    }
    let url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${video_id}&fields=items/snippet/title,items/snippet/description,items/contentDetails/duration&key=${api_key}`;
    console.log(url);

    fetch(url)
        .then((data) => {
            return data.json();
        })
        .then((response) => {
            let description = response.items[0].snippet.description;

            let duration = response.items[0].contentDetails.duration;
            let iso8601DurationRegex = /(-)?P(?:([.,\d]+)Y)?(?:([.,\d]+)M)?(?:([.,\d]+)W)?(?:([.,\d]+)D)?(?:T(?:([.,\d]+)H)?(?:([.,\d]+)M)?(?:([.,\d]+)S)?)?/;
            let durationParsed = parseISO8601Duration(duration, iso8601DurationRegex);
            let finalDuration = `${('' + durationParsed.hours).padStart(2, '0')}:${('' + durationParsed.minutes).padStart(2, '0')}:${('' + durationParsed.seconds).padStart(2, '0')}`;

            let newStamps = parseDescription(description);

            console.log(finalDuration);
            for (stamp of newStamps) {
                let percentage = calculateTimePercentage(stamp.stamp, finalDuration)
                //console.log(percentage);
                addMarker(percentage);
            }
        })
        .catch((error) => {
            console.log(error);
        });
}

function doSomethingElse() {
    let video_id = window.location.search.split('v=')[1];
    if (video_id && video_id.includes('&')) {
        let ampersandPosition = video_id.indexOf('&');
        if (ampersandPosition != -1) {
            video_id = video_id.substring(0, ampersandPosition);
        }
    }
    let url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${video_id}&fields=items/snippet/title,items/snippet/description,items/contentDetails/duration&key=${api_key}`;
    console.log(url);

    fetch(url)
        .then((data) => {
            return data.json();
        })
        .then((response) => {
            let description = response.items[0].snippet.description;

            let duration = response.items[0].contentDetails.duration;
            let iso8601DurationRegex = /(-)?P(?:([.,\d]+)Y)?(?:([.,\d]+)M)?(?:([.,\d]+)W)?(?:([.,\d]+)D)?(?:T(?:([.,\d]+)H)?(?:([.,\d]+)M)?(?:([.,\d]+)S)?)?/;
            let durationParsed = parseISO8601Duration(duration, iso8601DurationRegex);
            let finalDuration = `${('' + durationParsed.hours).padStart(2, '0')}:${('' + durationParsed.minutes).padStart(2, '0')}:${('' + durationParsed.seconds).padStart(2, '0')}`;

            let newStamps = parseDescription(description);
            let start = calculateTimePercentage(ads[0].start, finalDuration)
            let end = calculateTimePercentage(ads[0].end, finalDuration)
            //console.log(percentage);
            addAd(start, end);
        })
        .catch((error) => {
            console.log(error);
        });

}

function parseISO8601Duration(iso8601Duration, iso8601DurationRegex) {
    var matches = iso8601Duration.match(iso8601DurationRegex);

    return {
        sign: matches[1] === undefined ? '+' : '-',
        years: matches[2] === undefined ? 0 : matches[2],
        months: matches[3] === undefined ? 0 : matches[3],
        weeks: matches[4] === undefined ? 0 : matches[4],
        days: matches[5] === undefined ? 0 : matches[5],
        hours: matches[6] === undefined ? 0 : matches[6],
        minutes: matches[7] === undefined ? 0 : matches[7],
        seconds: matches[8] === undefined ? 0 : matches[8]
    };
};

function clearMarkers() {
    $("div").remove(".ytstmp-mrkr")
};

function calculateTimePercentage(currentTime, totalTime) {
    return (calculateTime(currentTime) / calculateTime(totalTime)) * 100.0;
}

function calculateTime(time) {
    time = time.split(":");
    let totalTime = 0;
    let position = time.length - 1;
    let multiplier = 1;
    while (position >= 0) {
        totalTime += time[position] * multiplier;
        multiplier = multiplier * 60;
        position -= 1;
    }
    return totalTime;
}