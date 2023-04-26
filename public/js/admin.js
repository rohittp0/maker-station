const auth = firebase.auth();
const db = firebase.firestore();

const table = document.getElementById("tableBody");

const venues = [
    "Rajadhani Institute of Engineering and Technology, Attingal",
    "Sree Buddha College of Engineering, Pattoor",
    "College of Engineering, Vadakara",
    "College of Engineering, Chengannur",
    "Government Engineering College, Wayanad",
    "Mar Baselios Christian College of Engineering and Technology, Peermade",
    "TKM College of Engineering, Kollam",
    "College of Engineering Thiruvananthapuram",
    "Christ College of Engineering, Irinjalakkuda",
    "TinkerSpace Kochi"
]

const data = {}

function getRow(venue, visitors, time) {
    return `<tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
      <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
        ${venue}
      </th>
      <td class="px-6 py-4">
        ${visitors}
      </td>
      <td class="px-6 py-4" >
        ${time}
      </td>
      <td class="px-6 py-4">
      </td>
    </tr>`;
}

function getData() {
    db.collection("users").onSnapshot((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const venue = doc.data().venue;

            if(!(venue in data))
                data[venue] = {
                    visitors: 0,
                    time: 0
                }

            data[venue].visitors += 1;
            data[venue].time += doc.data().visited || 0;
        });

        updateTable();
    });
}

function updateTable() {
    let totalVisitors = 0;
    let totalTime = 0;

    table.innerHTML = Object.keys(data).map((venue) => {
        totalVisitors += data[venue].visitors;
        totalTime += data[venue].time;

        return getRow(venue, data[venue].visitors, data[venue].time);
    })
        .join();

    table.innerHTML += getRow("Total", totalVisitors, totalTime);
}

venues.forEach((venue) => {
   data[venue] = {
       visitors: 0,
       time: 0
   }
});

updateTable();
getData();
