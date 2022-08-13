# Telegram App Bot

This bot uses Telegram App APIs as the workaround.

## Configuration

You need to get some environment variables ready if you want this bot to work smoothly and faster:

```env
API_ID=<api id>
API_HASH=<api hash>
SESSION=<login session string that>
PHONE_NUMBER=<your phone number i.e. +62123456789>
PASSWORD=<your 2FA password>
```

Please visit [here](my.telegram.org) to retrieve your App API information such as ID and Hash.

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
