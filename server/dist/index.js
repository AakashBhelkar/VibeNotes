"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const PORT = 3000;
app_1.default.listen(PORT, () => {
    // Only log in development mode
    if (process.env.NODE_ENV !== 'production') {
        console.log(`Server running on port ${PORT}`);
    }
});
