const api_key = 'AIzaSyChX7b0VFxndHfnqsbMCXRFXzVmMTBlTcQ';
let duration;

window.onload = () => {
    clearMarkers();
    doSomething();
  window.addEventListener("yt-navigate-start", () => {
  //chrome.webNavigation.onHistoryStateUpdated( () => {
  duration = $('.ytp-time-duration').text();
    clearMarkers();
    doSomething();
  });
  //doSomething();
};

function addMarker(percentage) {
  $('.ytp-progress-list').prepend(
      `<div class="ytstmp-mrkr" style=background-color:#00FFFF;width:.40%;left:${percentage}%;z-index:100000;height:175%;position:absolute;top:-0.35em;></div>`
  );
}

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
  let url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${video_id}&fields=items/snippet/title,items/snippet/description&key=${api_key}`;
  console.log(url);

  fetch(url)
      .then((data) => {
          return data.json();
      })
      .then((response) => {
          let description = response.items[0].snippet.description;
          let newStamps = parseDescription(description);
          for(stamp of newStamps) {
            let percentage = calculateTimePercentage(stamp.stamp,duration)
            console.log(percentage);
            addMarker(percentage);
          }
      })
      .catch((error) => {
          console.log(error);
      });
}

function clearMarkers() {
  $("div").remove(".ytstmp-mrkr")
};

function calculateTimePercentage(currentTime, totalTime){
    return (calculateTime(currentTime) / calculateTime(totalTime)) * 100.0;
}

function calculateTime(time){
    time = time.split(":");
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
