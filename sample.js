import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { readFileSync } from "node:fs";

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.github.ai/inference";
const modelName = "meta/Llama-3.2-90B-Vision-Instruct";

export async function main() {

  const client = ModelClient(
    endpoint,
    new AzureKeyCredential(token),
  );

  const response = await client.path("/chat/completions").post({
    body: {
      messages: [
        { role: "system", content: "You are a frontend developer." },
        { role: "user", content: [
            { type: "text", text: "Write HTML and CSS code for a web page based on the following hand-drawn sketch." },
            { type: "image_url", image_url: {
                url: getImageDataUrl("contoso_layout_sketch.jpg", "jpg"), details: "low"}}
          ]
        }
      ],
      model: modelName
    }
  });

  if (isUnexpected(response)) { 
    throw response.body.error;
  }

  console.log(response.body.choices[0].message.content);
}

/**
 * Get the data URL of an image file.
 * @param {string} imageFile - The path to the image file.
 * @param {string} imageFormat - The format of the image file. For example: "jpeg", "png".
 * @returns {string} The data URL of the image.
 */
function getImageDataUrl(imageFile, imageFormat) {
  try {
      const imageBuffer = readFileSync(imageFile);
      const imageBase64 = imageBuffer.toString('base64');
      return `data:image/${imageFormat};base64,${imageBase64}`;
  } catch (error) {
      console.error(`Could not read '${imageFile}'.`);
      console.error('Set the correct path to the image file before running this sample.');
      process.exit(1);
  }
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});