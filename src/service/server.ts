import fs from "fs";
import path from "path";
import { cache } from "react";
import { FeatureCollection } from "geojson";

export const getMap = cache(
  async (filename: string): Promise<FeatureCollection> => {
    const filePath = path.join(process.cwd(), "public", "map", filename);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const geoJsonFile = JSON.parse(fileContents);
    return geoJsonFile;
  }
);
