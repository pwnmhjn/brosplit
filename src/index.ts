import connectDB from "./db/index.db";
import { app } from "./app";
import dotenv from "dotenv";
dotenv.config();
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(
        `BroSplit App is listing on port number ${
          process.env.PORT
        }\nhttp://localhost:${process.env.PORT || 3000}/api-docs`
      );
    });
  })
  .catch((err) => {
    console.log(`MongoDb Connection Failed ${err}`);
  });
