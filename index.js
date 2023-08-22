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

  // We can't directly set the rewrites for some reason, so we'll have to do that separately
  delete data.rewrites;

  // Delete any arrays that are empty in the parent account's configuration
  for (const key in data) {
    if (Array.isArray(data[key]) && data[key].length === 0) {
      console.log(
        `Deleting array ${key} from the configuration because it is empty`
      );
      delete data[key];
    }
  }

  if (process.env.DEBUG) console.log(JSON.stringify(data, null, 2));

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
  if (process.env.DEBUG) console.log(await res.text());
  return res.ok;
}

// Function to get the rewrites of an account
async function getRewrites(apiKey, config_id) {
  const res = await fetch(`https://api.nextdns.io/profiles/${config_id}/rewrites`, {
    headers: {
      "X-Api-Key": apiKey,
    },
  });
  const { data } = await res.json();
  if (process.env.DEBUG) console.log(JSON.stringify(data, null, 2));
  return data;
}

// Function to delete a rewrite from an account
async function deleteRewrite(apiKey, config_id, rewrite_id) {
  const res = await fetch(`https://api.nextdns.io/profiles/${config_id}/rewrites/${rewrite_id}`, {
    method: "DELETE",
    headers: {
      "X-Api-Key": apiKey,
    },
  });
  if (process.env.DEBUG) console.log(await res.text());
  return res.ok;
}

// Function to add a rewrite to an account
// rewrite: { "name": "domain", "content": "ip" }
async function addRewrite(apiKey, config_id, rewrite) {
  const res = await fetch(`https://api.nextdns.io/profiles/${config_id}/rewrites`, {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rewrite),
  });
  if (process.env.DEBUG) console.log(await res.text());
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

  // Get the rewrites from the parent account
  const rewrites = await getRewrites(config.parent_account_api_key, config.parent_account_config_id);

  // Loop over child accounts
  for (const child of config.child_accounts) {
    // Get the rewrites from the child account
    const childRewrites = await getRewrites(child.api_key, child.config_id);

    // Loop over the rewrites of the child account
    for (const rewrite of childRewrites) {
      // Delete the rewrite from the child account
      const ok = await deleteRewrite(child.api_key, child.config_id, rewrite.id);
      if (ok) {
        console.log(`Deleted rewrite ${rewrite.name} from ${child.name}`);
      } else {
        console.log(`Failed to delete rewrite ${rewrite.name} from ${child.name}`);
      }
    }

    // Loop over the rewrites from the parent account
    for (const rewrite of rewrites) {
      delete rewrite.id;
      delete rewrite.type;
      if (process.env.DEBUG) console.log(JSON.stringify(rewrite, null, 2));
      // Add the rewrite to the child account
      await addRewrite(child.api_key, child.config_id, rewrite);
      console.log(`Added rewrite ${rewrite.name} to ${child.name}`);
    }
  }
}

main();
