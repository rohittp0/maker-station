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
            data[doc.id] = {venue: doc.data().venue, visited: doc.data().visited};
            updateTable();
        });
    });
}

function updateTable() {
    let totalVisitors = 0;
    let totalTime = 0;

    const tableData = {};

    Object.keys(data).forEach((user) => {
        user = data[user];
        if (!(user.venue in tableData))
            tableData[user.venue] = {
                visitors: 0,
                time: 0
            };

        tableData[user.venue].visitors += 1;
        tableData[user.venue].time += user.visited || 0;
    });

    table.innerHTML = Object.keys(tableData).map((venue) => {
        totalVisitors += tableData[venue].visitors;
        totalTime += tableData[venue].time;

        return getRow(venue, tableData[venue].visitors, tableData[venue].time);
    })
        .join();

    table.innerHTML += getRow("Total", totalVisitors, totalTime);
}

updateTable();
getData();
