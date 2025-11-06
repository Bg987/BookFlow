// const axios = require("axios")

// async function data() {
//     const temp="bhaji bhai"
//     const res = await axios.get(`http://localhost:5000/test/:${temp}`, {
//       params: {
//         x: "bhavvya",
//         y: "godhaniya",
//       },
//     });
//     console.log(res.data);
// }
// data();
// const http = require("http");

// const server = http.createServer((req, res) => {
//   if (req.url === "/") {
//     res.end("Home Page");
//   } else if (req.url === "/data") {
//     // Simulate a slow operation (like DB query)
//     setTimeout(() => {
//       res.end("Data fetched");
//     }, 10000);
//   }
// });

// server.listen(3500, () => console.log("Server running..."));
const axios = require("axios");

async function fetchSequential() {
  console.time("Sequential Time");
  const res1 = await axios.get("https://jsonplaceholder.typicode.com/posts/1");
  const res2 = await axios.get("https://jsonplaceholder.typicode.com/posts/2");
  console.timeEnd("Sequential Time");
  return [res1.data, res2.data];
}

async function fetchParallel() {
  console.time("Parallel Time");
  const [res1, res2] = await Promise.all([
    axios.get("https://jsonplaceholder.typicode.com/posts/1"),
    axios.get("https://jsonplaceholder.typicode.com/posts/2"),
  ]);
  console.timeEnd("Parallel Time");
  return [res1.data, res2.data];
}

(async () => {
  console.log("Running Sequential Fetch...");
  await fetchSequential();

  console.log("\nRunning Parallel Fetch...");
  await fetchParallel();
})();
