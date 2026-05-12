import { Router } from "express";
import multer from "multer";
import { db } from "../db.js";
import { supabase } from "../supabase.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
});


export default router;