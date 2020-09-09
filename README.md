# Hack Panel

A live stream manager and OBS overlay server for hackers.  At this time only YouTube's
live streaming APIs are supported.  Other platforms may be added at a later date.  If
you'd like to contribute a backend for Twitch or another platform, please file an issue
and we can talk about it!

## Usage

Since the source code of this program is meant to be customized for your own use,
the way to use it is to clone the repo and run it directly using Node.js:

```
# Clone the code
cd ~/Projects
git clone https://github.com/daviwil/hack-panel
cd hack-panel

# Install dependencies and then run it
npm install
npm start
```

## Authenticating With YouTube

Before you'll be able to make requests with YouTube's API, you'll have to create
Google API credentials for this application so that it will be able to access
your private YouTube account data.  Follow [these
instructions](https://support.google.com/googleapi/answer/6158849) to create the
credentials and make sure to select "Web application" for the application type.

You'll also need to add an "Authorized redirect URI" for
http://localhost:3000/oauth2_callback so that the server can receive the
authentication details once you have successfully authenticated.

Once you create your credentials, you will be given a client ID and client
secret.  Create a file called `.env` in the `hack-panel` repository folder
and populate it with those details just like in the example below:

**Example .env file:**

```
CLIENT_ID=23oi32jfo23jf.apps.googleusercontent.com
CLIENT_SECRET=230823jfo24g23g98h32
```

> No, those aren't real credentials.

Now you can start the server with `npm start`.

Once the server starts up you will need to authenticate with YouTube, making
sure to select the YouTube account that you'll be live streaming with.  To do
this, open your web browser and navigate to the authentication URL that gets
printed to the console when the server starts up.

Once you've authenticated, the token will be cached for future server runs.  If
you want to log in again, delete the file `.cached-token.json` and you will be
authenticated from scratch on next startup.
