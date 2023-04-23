const auth = firebase.auth();
const db = firebase.firestore();

// Listen for auth status changes
const user = new Promise((resolve, reject) => {
    auth.onAuthStateChanged(user => {
        if (!user)
            window.location.href = "/";

        checkMentor(user.uid).then(r => !r && (window.location.href = "/profile"));
        resolve(user);
    });
});


async function getStallsAsOptions(){
    const stalls = await db.collection("stalls").get();
    const options = stalls.docs.map(doc => `<option value="${doc.id}">${doc.data().name}</option>`);
    document.getElementById("stall").innerHTML = options.join("");
}

async function saveStall(){
    const {uid} = await user;
    const stall = document.getElementById("stall").value;
    await db.collection("mentors").doc(uid).update({stall});
    window.location.href = "/mentor";
}

document.getElementById("save").addEventListener("click", saveStall);
getStallsAsOptions().catch(console.error);
