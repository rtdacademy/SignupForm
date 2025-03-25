// src/edbotz/functions/imageFunctions.js

import { Schema } from "firebase/vertexai";

// Define separate function declarations for retrieving
// (a) AI analysis text, (b) image name, and (c) image URL.
// Each function expects an "imageId" parameter that
// tells your code which image to query.

export const imageFunctionDeclarations = [
  {
    name: "getImageAnalysis",
    description: "Fetch the AI-understanding text for a given image by ID.",
    parameters: Schema.object({
      // Overall function-level description (optional):
      description:
        "Parameters required to get the AI Analysis text for a specific image",
      properties: {
        imageId: Schema.string({
          description: "The ID of the image whose AI analysis we want",
        }),
      },
    }),
  },
  {
    name: "getImageName",
    description: "Retrieve the display name for a given image by ID.",
    parameters: Schema.object({
      description:
        "Parameters required to fetch the display name for a specific image",
      properties: {
        imageId: Schema.string({
          description: "The ID of the image whose name we want",
        }),
      },
    }),
  },
  {
    name: "getImageUrl",
    description: "Retrieve the direct download/view URL for a given image by ID.",
    parameters: Schema.object({
      description:
        "Parameters required to fetch the direct URL for a specific image",
      properties: {
        imageId: Schema.string({
          description: "The ID of the image whose URL we want",
        }),
      },
    }),
  },
];
