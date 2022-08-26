# Telegram App Bot

This bot uses Telegram App APIs as the workaround.

## Configuration

You need to get some environment variables ready if you want this bot to work smoothly and faster:

```env
API_ID=<api_id>
API_HASH=<api_hash>
SESSION=<login_session_string>
PHONE_NUMBER=<your_phone_number i.e. +62123456789>
PASSWORD=<your_2FA_password>
GOOGLE_SHEET_ID=<google_sheet_id>
GOOGLE_SERVICE_ACCOUNT_EMAIL=<service_account_email>
GOOGLE_PRIVATE_KEY=<private_key>
```

Please visit [here](my.telegram.org) to retrieve your App API information such as ID and Hash.

## Google Spreadsheet

This bot uses Google Spreadsheet as the minimal database. You have to retrieve your authentication key and store it as environment variables above. Visit this [link](https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication) to learn how to get your service account authentication key.

After you set up the authentication, now you have set up a spreadsheet with certain sheets like below:

**Sheet Name:** users
| identifier    | keywords_permitted |
| :-----------: | :----------------: |
| 6212345678910 | &#9744;            |
| hreesangsb    | &#9745;            |

**Sheet Name:** keywords
| key           | text               |
| :-----------: | :----------------: |
| /test         | Hello World!

## Running

Install the needed dependencies:

```powershell
npm install --save-dev
npm install
```

Build the project:

```powershell
npm run build
```

Start the project in production:

```powershell
npm run start
```

### Development

For development purpose, you can run the project with

```powershell
npm run dev
```

It will watch changes to perform an auto-build and auto-run.

## What does this bot do?

### Auto PM

Sends a direct message to a user who inputted the auto PM keywords. That user will receive the auto PM message based on the keywords.
