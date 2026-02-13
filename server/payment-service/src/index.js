import dotenv from "dotenv";
import app from "./app.js";

dotenv.config({ path: "./.env" });

const startServer = async () => {
    try {
        app.listen(process.env.PORT || 5006, () => {
            console.log(`Server started at PORT: ${process.env.PORT}`);
        });
    } catch (error) {
        console.error("Server error:", error.message);
        process.exit(1);
    }
};

startServer();
