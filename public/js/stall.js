const auth = firebase.auth();
const db = firebase.firestore();

const stall = document.getElementById("stall");

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
    const stalls = await db.collection("stalls").doc("stall_list").get();
    const options = []

    const learning = stalls.data().learning;
    const project = stalls.data().project;

    for(const stall in learning)
        options.push(`<option value="${learning[stall]}" data-type="learning">${stall}</option>`);

    for(const stall in project)
        options.push(`<option value="${project[stall]}" data-type="project">${stall}</option>`);

    stall.innerHTML = options.join("");
}

async function saveStall(){
    const {uid} = await user;
    const stall = document.getElementById("stall").value;
    await db.collection("mentors").doc(uid).update({stall});
    window.location.href = "/mentor";
}

document.getElementById("save").addEventListener("click", saveStall);
getStallsAsOptions().catch(console.error);

document.getElementById("stallType").addEventListener("change", e => {
   const value = e.target.value;
   const options = document.querySelectorAll("#stall option");

    if(value)
        stall.value = "";

   options.forEach(option => {
         if(!value || option.dataset.type === value)
              option.style.display = "block";
         else
              option.style.display = "none";
   });
});
