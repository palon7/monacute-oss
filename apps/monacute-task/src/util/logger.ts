/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import bunyan from "bunyan";
import { LoggingBunyan } from "@google-cloud/logging-bunyan";
import { productionMode } from "./constant";

const logLevel = productionMode ? "info" : "trace";

export const getLogger = (name: string): bunyan => {
  const streams: bunyan.Stream[] = [
    // Log to the console at 'info' and above
    { stream: process.stdout, level: logLevel },
  ];

  if (process.env.LOG_STACKDRIVER === "true") {
    // Creates a Bunyan Cloud Logging client
    const loggingBunyan: LoggingBunyan = new LoggingBunyan();
    streams.push(loggingBunyan.stream(logLevel));
  }
  return bunyan.createLogger({ name: `task.${name}`, streams });
};
export const logger = getLogger("main");
