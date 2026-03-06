import jwt from "configs/jwt.ts";
import mailer from "configs/mailer.ts";
import app from "configs/app.ts";
import session from "configs/session.ts";
import cache from "configs/cache.ts";
import database from "configs/database.ts";
import cors from "configs/cors.ts";
import services from "configs/services.ts";
import filesystems from "configs/filesystems.ts";
import auth from "configs/auth.ts";
import logging from "configs/logging.ts";

export default {
  jwt,
  mailer,
  app,
  session,
  cache,
  database,
  cors,
  services,
  filesystems,
  auth,
  logging,
};
