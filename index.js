import fetch from "node-fetch";

// Load configuration
import config from "./.config.json" assert { type: "json" };

// Function to get the parent account's configuration
async function getParentConfig() {
  const res = await fetch(
    `https://api.nextdns.io/profiles/${config.parent_account_config_id}`,
    {
      headers: {
        "X-Api-Key": config.parent_account_api_key,
      },
    }
  );
  const { data } = await res.json();

  // Remove profile-specific settings from the parent account's configuration
  // Note: this doesn't remove the name
  delete data.id;
  delete data.fingerprint;
  delete data.setup;

  // Remove extraneous data
  for (const blocklist of data.privacy.blocklists) {
    delete blocklist.name;
    delete blocklist.description;
    delete blocklist.website;
    delete blocklist.entries;
    delete blocklist.updatedOn;
  }

  // Delete any arrays that are empty in the parent account's configuration
  for (const key in data) {
    if (Array.isArray(data[key]) && data[key].length === 0) {
      console.log(
        `Deleting array ${key} from the configuration because it is empty`
      );
      delete data[key];
    }
  }

  return data;
}

// Function to set the configuration of a child account
async function setChildConfig(apiKey, config_id, config) {
  const res = await fetch(`https://api.nextdns.io/profiles/${config_id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify(config),
  });
  return res.ok;
}

// Main async function
async function main() {
  // Get parent account's configuration
  const parentConfig = await getParentConfig();

  // Loop over child accounts
  for (const child of config.child_accounts) {
    // Set the parent account's configuration to the child account
    const ok = await setChildConfig(
      child.api_key,
      child.config_id,
      parentConfig
    );
    if (ok) {
      console.log(`Configuration set for ${child.name}`);
    } else {
      console.log(`Failed to set configuration for ${child.name}`);
    }
  }
}

main();
