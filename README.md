# nextdns-config-cloner

This script replaces the profile configuration of multiple child NextDNS accounts with that of a parent account in bulk, streamlining the management of multiple accounts.

## Usage

### Prerequisites

- Node.js, preferably the latest version as experimental features are used. Tested on v20.1.0.
- NextDNS accounts with profiles already created. The script does not create profiles, it only replaces their configuration.

### Code & dependencies

Clone the repository:

```bash
git clone https://github.com/mrrfv/nextdns-config-cloner
```

Change into the script directory and install the required dependencies using npm:

```bash
cd nextdns-config-cloner
npm install
```

### Configuration

Before you can use the script, you need to configure it. Create a `.config.json` file in the script directory with the following structure:

```json
{
    "parent_account_api_key": "YOUR_PARENT_ACCOUNT_API_KEY",
    "parent_account_config_id": "YOUR_PARENT_ACCOUNT_CONFIG_ID",
    "child_accounts": [
    {
        "name": "Child Account 1",
        "api_key": "CHILD_ACCOUNT_1_API_KEY",
        "config_id": "CHILD_ACCOUNT_1_CONFIG_ID"
    },
    {
        "name": "Child Account 2",
        "api_key": "CHILD_ACCOUNT_2_API_KEY",
        "config_id": "CHILD_ACCOUNT_2_CONFIG_ID"
    }
    // Add more child accounts as needed
    ]
}
```

Replace `YOUR_PARENT_ACCOUNT_API_KEY`, `YOUR_PARENT_ACCOUNT_CONFIG_ID`, `CHILD_ACCOUNT_1_API_KEY`, `CHILD_ACCOUNT_1_CONFIG_ID`, and so on, with the actual API keys and profile IDs of your NextDNS accounts. You can find the API key and profile ID of each account in the NextDNS web app.

### Running the script

Once you have configured the script, you can run it by executing `node index.js` in the script directory.
