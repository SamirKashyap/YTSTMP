var timestamps = [];
ytplayer = document.getElementsByClassName("ytp-time-current");

window.onload = () => {
    $('#description').children().text('C0rnH4ck5');
};  

onmousedown = () => {
    timestamps.push(ytplayer[0].innerText);
    console.log(timestamps)
}