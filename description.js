const api_key = 'AIzaSyChX7b0VFxndHfnqsbMCXRFXzVmMTBlTcQ';

let ads = new Map();
ads.set('X089oYPc5Pg', {
    start: '00:29',
    end: '00:40'
});
ads.set('DevM3bbGtoA', {
    start: '00:21',
    end: '00:31'
});

window.onload = () => {
    clearMarkers();
    scrapeDescription();
    loadAds();
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    //here we get the new
    console.log('URL CHANGED: ' + request.data.url);
    clearMarkers();
    scrapeDescription();
});

function Submit() {
    let Type = document.getElementById('Type').value;
    let Description = document.getElementByName('Description').value;
    let EndTime = document.getElementByName('EndTime').value;
    let StartTime = document.getElementByName('StartTime').value;
    console.log(Type, StartTime, EndTime, Description);
}

function addMarker(percentage, description) {
    if (percentage > 50) {
        $('.ytp-progress-list').prepend(
            `<div class="ytstmp-mrkr" style="left:${percentage}%;"">
          <span class="ytstmp-description" id="right">${description}</span>
        </div>`
        );
    } else if (percentage < 50) {
        $('.ytp-progress-list').prepend(
            `<div class="ytstmp-mrkr" style="left:${percentage}%;"">
          <span class="ytstmp-description" id="left">${description}</span>
        </div>`
        );
    } else {
        $('.ytp-progress-list').prepend(
            `<div class="ytstmp-mrkr" style="left:${percentage}%;"">
          <span class="ytstmp-description" id="center">${description}</span>
        </div>`
        );
    }
}

function addAd(start, end) {
    let width = end - start;
    $('.ytp-progress-list').prepend(
        `<div class="ytstmp-admrkr" style=width:${width}%;left:${start}%;></div>`
    );
}

$('video').on('timeupdate', function(event) {
    let video_id = getVideoID();
    if (
        Math.floor(this.currentTime) === calculateTime(ads.get(video_id).start)
    ) {
        this.currentTime = calculateTime(ads.get(video_id).end);
    }
});


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

function getVideoID() {
    let video_id = window.location.search.split('v=')[1];
    if (video_id && video_id.includes('&')) {
        let ampersandPosition = video_id.indexOf('&');
        if (ampersandPosition != -1) {
            video_id = video_id.substring(0, ampersandPosition);
        }
    }

    return video_id;
}

function scrapeDescription() {
    let video_id = getVideoID();
    let url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${video_id}&fields=items/snippet/title,items/snippet/description,items/contentDetails/duration&key=${api_key}`;

    fetch(url)
        .then((data) => {
            return data.json();
        })
        .then((response) => {
            let description = response.items[0].snippet.description;

            let duration = response.items[0].contentDetails.duration;
            let iso8601DurationRegex = /(-)?P(?:([.,\d]+)Y)?(?:([.,\d]+)M)?(?:([.,\d]+)W)?(?:([.,\d]+)D)?(?:T(?:([.,\d]+)H)?(?:([.,\d]+)M)?(?:([.,\d]+)S)?)?/;
            let durationParsed = parseISO8601Duration(
                duration,
                iso8601DurationRegex
            );
            let finalDuration = `${('' + durationParsed.hours).padStart(
                2,
                '0'
            )}:${('' + durationParsed.minutes).padStart(2, '0')}:${(
                '' + durationParsed.seconds
            ).padStart(2, '0')}`;

            let newStamps = parseDescription(description);

            for (stamp of newStamps) {
                let percentage = calculateTimePercentage(
                    stamp.stamp,
                    finalDuration
                );
                addMarker(percentage, stamp.text);
            }
        })
        .catch((error) => {
            console.log(error);
        });
}

function loadAds() {
    let video_id = getVideoID();
    let url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${video_id}&fields=items/snippet/title,items/snippet/description,items/contentDetails/duration&key=${api_key}`;

    fetch(url)
        .then((data) => {
            return data.json();
        })
        .then((response) => {
            let description = response.items[0].snippet.description;

            let duration = response.items[0].contentDetails.duration;
            let iso8601DurationRegex = /(-)?P(?:([.,\d]+)Y)?(?:([.,\d]+)M)?(?:([.,\d]+)W)?(?:([.,\d]+)D)?(?:T(?:([.,\d]+)H)?(?:([.,\d]+)M)?(?:([.,\d]+)S)?)?/;
            let durationParsed = parseISO8601Duration(
                duration,
                iso8601DurationRegex
            );
            let finalDuration = `${('' + durationParsed.hours).padStart(
                2,
                '0'
            )}:${('' + durationParsed.minutes).padStart(2, '0')}:${(
                '' + durationParsed.seconds
            ).padStart(2, '0')}`;

            let newStamps = parseDescription(description);
            let start = calculateTimePercentage(
                ads.get(video_id).start,
                finalDuration
            );
            let end = calculateTimePercentage(
                ads.get(video_id).end,
                finalDuration
            );
            addAd(start, end);
        })
        .catch((error) => {
        });
}

fetch('http://localhost:4000/graphql', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        mode: 'no-cors'
    },
    body: JSON.stringify({ query: '{ videos { id, length } }' })
})
    .then((r) => r.json())
    .then((data) => console.log('data returned:', data));

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
}

function clearMarkers() {
    $('div').remove('.ytstmp-mrkr');
    $('div').remove('.ytstmp-admrkr');
}

function calculateTimePercentage(currentTime, totalTime) {
    return (calculateTime(currentTime) / calculateTime(totalTime)) * 100.0;
}

function calculateTime(time) {
    time = time.split(':');
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
