const db = firebase.firestore();
const auth = firebase.auth();

const time = document.getElementById('time');
const name = document.getElementById('name');
const project = document.getElementById('project');
const learning = document.getElementById('learning');
const venue = document.getElementById('venue');
const major = document.getElementById('major');

const user = new Promise((resolve, reject) => {
    auth.onAuthStateChanged((user) => {
        if (!user) {
            reject("User not logged in");
            window.location.href = "/";
        } else {
            resolve(user);
            checkMentor(user.uid).then(r => r && (window.location.href = "/mentor"));
        }
    });
});

async function getVenue() {
    const {uid} = await user;

    const docRef = db.collection("users").doc(uid);
    const doc = await docRef.get();

    let venueName = doc.data().venue;

    if (venueName.length > 30)
        venueName = venueName.substring(0, 30) + "...";

    venue.innerHTML = `Venue: ${venueName}`;
}

async function getDetails() {
    const {uid} = await user;
    const stations = await db.collection(`users/${uid}/stalls`).orderBy("time", "desc").get();

    if (stations.docs.length === 0)
        return window.alert("Please visit some stations first!");

    const lastTime = stations.docs[0].data().time.seconds;
    const firstTime = stations.docs[stations.docs.length - 1].data().time.seconds;

    const timeDiff = lastTime - firstTime;
    const timeDiffMinutes = Math.floor(timeDiff / 60);

    time.innerHTML = `${timeDiffMinutes} Minutes`;

    const totalProjects = stations.docs.reduce((acc, cur) => {
        if (cur.data().type === "project")
            return acc + 1;
        return acc;
    }, 0);

    const totalLearning = stations.docs.reduce((acc, cur) => {
        if (cur.data().type === "learning")
            return acc + 1;
        return acc;
    }, 0);

    fillProgress1(totalProjects / 0.24);
    fillProgress2(totalLearning / 0.24);

    let mostTime = null;
    let timeSpent = 0;

    for (let i = 1; i < stations.docs.length; i++) {
        const current = stations.docs[i].data().time.seconds;
        const previous = stations.docs[i - 1].data().time.seconds;

        const timeSpentHere = previous - current;

        if (timeSpentHere > timeSpent) {
            timeSpent = timeSpentHere;
            mostTime = stations.docs[i].data().name;
        }
    }

    project.innerHTML = `${totalProjects}/24`;
    learning.innerHTML = `${totalLearning}/24`;
    major.innerHTML = mostTime;
}

async function svgToPng(svgImage, url) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = svgImage.width;
    canvas.height = svgImage.height;

    ctx.drawImage(svgImage, 0, 0);

    if(url)
        return canvas.toDataURL('image/png');

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            } else {
                reject('Canvas is empty');
            }
        }, 'image/png');
    });
}

const loadImage = async url => {
    const img = document.createElement('img');

    img.width = 756;
    img.height = 1344;

    img.src = url;
    return new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}

function getSvgBlob() {
    const svg = document.querySelector('svg');

    const svgAsXML = (new XMLSerializer()).serializeToString(svg)
    const svgData = `data:image/svg+xml,${encodeURIComponent(svgAsXML)}`

    return loadImage(svgData);
}

async function shareImage() {
    const svgBlob = await getSvgBlob();

    const blobImageAsset = await svgToPng(svgBlob);

    const filesArray = [
        new File([blobImageAsset], "MakerStation.png", {
            type: 'image/png',
            lastModified: new Date().getTime(),
        }),
    ];
    const shareData = {
        title: "MakerStation Wrapped",
        files: filesArray,
    };

    if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
    }
}

async function downloadImage() {
    const svgBlob = await getSvgBlob();

    const blobImageAsset = await svgToPng(svgBlob, true);

    const link = document.createElement('a');
    link.download = 'MakerStation.png';
    link.href = blobImageAsset;
    link.click();
}

user.then(({displayName}) => {
    name.innerHTML = displayName;
});

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

function describeArc(x, y, radius, startAngle, endAngle) {

    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
}

function fillProgress1(percent) {
    const degree = percent * 3.6
    document.getElementById("progress1").setAttribute("d", describeArc(313, 965, 152, 180, 180 + degree - 1));
}

function fillProgress2(percent) {
    const degree = percent * 3.6
    document.getElementById("progress2").setAttribute("d", describeArc(770, 965, 152, 180, 180 + degree - 1));

}

getVenue().catch(console.error);
getDetails().catch(console.error);

document.getElementById('share').addEventListener('click', shareImage);
document.getElementById('download').addEventListener('click', downloadImage);

document.getElementById("share").hidden = !navigator.canShare || !navigator.canShare();
