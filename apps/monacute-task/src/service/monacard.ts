/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import FormData from "form-data";
import fs, { unlinkSync } from "fs";
import https from "https";
import { logger } from "../util/logger";

export const downloadCardImage = async (
  url: string,
  path: string
): Promise<void> => {
  const file = fs.createWriteStream(path);
  const request = https.get(url, (response) => {
    response.pipe(file);
  });
  return new Promise((resolve, reject) => {
    file.on("finish", () => {
      file.close();
      resolve();
    });
    file.on("error", (err) => {
      fs.unlink(path, (error) => {
        if (err) throw err;
      });
      reject(err);
    });
  });
};

export const postMonacardIPFS = async (imagePath: string): Promise<string> => {
  const formData = new FormData();
  formData.append("image", fs.createReadStream(imagePath));
  const options = {
    method: "POST",
    hostname: "card.mona.jp",
    port: 443,
    path: "/api/upload_image",
    headers: formData.getHeaders(),
  };
  const req = https.request(options, (res) => {
    res.on("data", (d) => {
      logger.debug(d);
    });
  });

  req.on("error", (error) => {
    logger.error(error);
    throw new Error("Failed to post monacard image");
  });

  formData.pipe(req);
  return new Promise((resolve, reject) => {
    req.on("response", (response) => {
      response.on("data", (chunk) => {
        const data = JSON.parse(chunk.toString());
        if (data.success) {
          resolve(data.success.cid);
        } else {
          reject(data.error.message);
        }
      });
    });
  });
};

export const postMonacardFromURL = async (url: string): Promise<string> => {
  const filename = `/tmp/monacute_${Date.now()}.png`;

  logger.info("Download image...");
  await downloadCardImage(url, filename);
  logger.info("Posting...");
  const cid = await postMonacardIPFS(filename);

  logger.trace("Clean up image...");
  unlinkSync(filename);
  return cid;
};
