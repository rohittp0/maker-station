async function checkMentor(uid){
    const docRef = db.collection("mentors").doc(uid);
    const doc = await docRef.get().catch(console.error);

    return doc?.exists;
}
