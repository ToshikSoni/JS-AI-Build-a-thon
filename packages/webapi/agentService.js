import { AIProjectsClient } from "@azure/ai-projects";
import { DefaultAzureCredential } from "@azure/identity";

async function runAgentConversation() {
  
const client = AIProjectsClient.fromConnectionString(
  "eastus2.api.azureml.ms;8ff006f0-42bb-47fe-a5bc-8930eb72c518;rg-Agents;Agents",
  new DefaultAzureCredential()
);
  
const agent = await client.agents.getAgent("asst_l721zi1PZLi7jVIX96cKXJlC");
console.log(`Retrieved agent: ${agent.name}`);
  
const thread = await client.agents.getThread("thread_NztDhXvcLoN7uDENsuNzwRvx");
console.log(`Retrieved thread, thread ID: ${thread.id}`);
  
const message = await client.agents.createMessage(thread.id, {
  role: "user",
  content: "Hi my-agent"
});
console.log(`Created message, message ID: ${message.id}`);
  
// Create run
let run = await client.agents.createRun(thread.id, agent.id);

// Poll until the run reaches a terminal status
while (
  run.status === "queued" ||
  run.status === "in_progress"
) {
  // Wait for a second
  await new Promise((resolve) => setTimeout(resolve, 1000));
  run = await client.agents.getRun(thread.id, run.id);
}

console.log(`Run completed with status: ${run.status}`);
  
// Retrieve messages
const messages = await client.agents.listMessages(thread.id);

// Display messages
for (const dataPoint of messages.data.reverse()) {
  console.log(`${dataPoint.createdAt} - ${dataPoint.role}:`);
  for (const contentItem of dataPoint.content) {
    if (contentItem.type === "text") {
      console.log(contentItem.text.value);
    }
  }
}
}

// Main execution
runAgentConversation().catch(error => {
  console.error("An error occurred:", error);
});