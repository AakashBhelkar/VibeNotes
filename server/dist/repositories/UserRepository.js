"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = exports.findById = exports.findByEmail = void 0;
const db_1 = __importDefault(require("../config/db"));
const findByEmail = async (email) => {
    return db_1.default.user.findUnique({
        where: { email },
    });
};
exports.findByEmail = findByEmail;
const findById = async (id) => {
    return db_1.default.user.findUnique({
        where: { id },
    });
};
exports.findById = findById;
const create = async (data) => {
    return db_1.default.user.create({
        data,
    });
};
exports.create = create;
