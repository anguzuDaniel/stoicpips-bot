"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../config/supabase");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function listUsers() {
    console.error("Listing profiles to file...");
    const { data: profiles, error } = await supabase_1.supabase
        .from('profiles')
        .select('*')
        .limit(10);
    if (error) {
        console.error("Error fetching profiles:", error);
    }
    else {
        const outputPath = path_1.default.resolve(__dirname, '../../users_dump.json');
        fs_1.default.writeFileSync(outputPath, JSON.stringify(profiles, null, 2));
        console.error(`Wrote ${profiles?.length} profiles to ${outputPath}`);
    }
}
listUsers().catch(console.error);
