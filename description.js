var timestamps = [];
ytplayer = document.getElementsByClassName('ytp-time-current');
const api_key = 'AIzaSyChX7b0VFxndHfnqsbMCXRFXzVmMTBlTcQ';

window.onload = () => {
    let video_id = window.location.search.split('v=')[1];
    let ampersandPosition = video_id.indexOf('&');
    if (ampersandPosition != -1) {
        video_id = video_id.substring(0, ampersandPosition);
    }
    let url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${video_id}&fields=items/snippet/title,items/snippet/description&key=${api_key}`;
    console.log(url);

    fetch(url)
        .then((data) => {
            return data.json();
        })
        .then((response) => {
            let description = response.items[0].snippet.description;
            parseDescription(description);
        })
        .catch((error) => {
            console.log(error);
        });

    // $('#description')
    //     .children()
    //     .text('C0rnH4ck5');
    onmousedown = () => {
        timestamps.push(ytplayer[0].innerText);
        console.log(timestamps);
    };
};

function parseDescription(description) {
    let lines = description.split('\n');
    let timestamps = [];
    for (line of lines) {
        //console.log(line);
        const regex = /[1-9]?[0-9]:[0-9][0-9]/;
        if (regex.test(line)) {
            let text = line.replace(regex, '');
            let stamp = line.match(regex)[0];
            console.log({ text, stamp });
            timestamps.push({ text, stamp });
        }
    }
    return timestamps;
}
