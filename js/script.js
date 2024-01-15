console.log("mbdsmvnlfn");

let currentsong = new Audio();
let songs;
let currfolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`./${folder}/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}`)[1])
        }
    }
    let songUL = document.querySelector(".songslist ul");
    songUL.innerHTML = ""

    for (const song of songs) {
        // Replace all occurrences of "%20" with a space and append to the list
        songUL.innerHTML += `<li>
            <img class="invert" src="img/music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll(/%20/g, " ")}</div>
                <div>जय श्री राम!!!</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/playbutton.svg" alt="">
            </div>
        </li>`;
    }

    Array.from(document.querySelectorAll(".songslist li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });
    return songs
}

const playmusic = (track, pause = false) => {
    // Set the src attribute of the Audio element
    //let audio = new Audio("/songs/" + track);
    currentsong.src = `/${currfolder}/` + track;
    if (!pause) {
        currentsong.play()
        play.src = "img/pause.svg"
    }
    // Play the audio
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
};

async function displayAlbum() {
    let a = await fetch(`./songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardcontainer = document.querySelector(".cardcontainer");

    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
    
        // Remove http://127.0.0.1:5500 from e.href
        const cleanedHref = e.href.replace("http://127.0.0.1:5500", "");
    
        if (cleanedHref.includes("./songs") && (cleanedHref !== "/songs")) {
            let folder = cleanedHref.split("/").slice(-2)[1];
    
            let a = await fetch(`./songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response);
            
        
    
    

            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="card border">
                <div class="play">
                    <svg width="50" height="50" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <!-- Dark Orange Circle -->
                        <circle cx="12" cy="12" r="11" fill="#FF5733" />
                        <!-- Smaller Icon Path -->
                        <path d="M16.5 11.5L8.5 6.5V16.5L16.5 11.5Z" fill="#141B34" />
                    </svg>
                </div>
                <img src="/songs/${folder}/cover.jpg" alt="">
                <h1>${response.title}</h1>
                <p>${response.description}</p>
            </div>`;
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async () => {
            console.log("Fetching Songs");
            songs = await getsongs(`songs/${card.dataset.folder}`);
            playmusic(songs[0]);
        });
    });
}




async function main() {
    let songs = await getsongs("songs/ncs/");
    playmusic(songs[0], true)
    //console.log(songs);

    //display album 
    displayAlbum()

    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "img/playbutton.svg"
        }
    })
    //time updateevnt
    currentsong.addEventListener("timeupdate", () => {
        console.log(currentsong.currentTime, currentsong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}/
        ${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    })
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100
    })
    //onha,burge
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    //close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-130%"
    })

    previous.addEventListener("click", () => {
        console.log("previous clicked");
        console.log(currentsong);
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if (index - 1 >= 0) {
            playmusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        console.log("next clicked");
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) {
            playmusic(songs[index + 1]);
        }
    });
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("setting volume to", e.target.value, "/100")
        currentsong.volume = parseInt(e.target.value) / 100
    })
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentsong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })





}

main();
