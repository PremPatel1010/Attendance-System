import app from "./src/app.js";
import http from 'http';


const PORT = 3000;

const server = http.createServer(app);


server.listen(PORT, () => {
  console.log(`Server is runnning on PORT ${PORT}`);
})


