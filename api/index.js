import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";

// Get the directory name of the current module file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
import authRoutes from "./routes/auth.js";
import incubatorRoutes from "./routes/incubator.js";
import startupRoutes from "./routes/startup.js";
import chatRoutes from "./routes/chat.js";

const app = express();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//Middlewares
app.use(bodyParser.json());
app.use(cookieParser());

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true, // Allow credentials (cookies)
};

app.use(cors(corsOptions));
app.use(express.static(__dirname));

//PORT
const port = process.env.PORT || 8000;

//My Routes
app.use("/api/auth", authRoutes);
app.use("/incubator", incubatorRoutes);
app.use("/startup", startupRoutes);
app.use("/chat", chatRoutes);

//Starting a server
app.listen(port, () => {
  console.log(`app is running at ${port}`);
});
