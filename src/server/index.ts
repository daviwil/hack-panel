import * as fs from "fs";
import { Server } from "./server";
import { ChatPoller } from "./chatPoller";
import { YouTubeClient } from "./youTubeClient";
import { Credentials, OAuth2Client } from "google-auth-library";

require('dotenv').config();

async function authenticateClient(server: Server): Promise<OAuth2Client> {
  const oauthClient =
    new OAuth2Client(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      "http://localhost:3000/oauth2_callback");

  let token: Credentials | undefined = undefined;
  if (fs.existsSync(".cached-token.json")) {
    token = JSON.parse(fs.readFileSync(".cached-token.json").toString());
  } else {
    const authUrl = oauthClient.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/youtube.force-ssl',
        'https://www.googleapis.com/auth/youtube.readonly',
      ]
    });

    console.log("*** Please go to the following URL and log in:\n\n", authUrl, "\n");

    let authKeyResolve = undefined;
    const authKeyPromise = new Promise<Credentials>((resolve, reject) => {
      authKeyResolve = resolve;
    });

    server.router.get('/oauth2_callback', (req, res) => {
      const code = req.query["code"] as string;
      res.sendStatus(200);

      oauthClient.getToken(code, (err, token) => {
        if (err) {
          console.error("Error while calling getToken:", err);
        } else {
          fs.writeFileSync(".cached-token.json", JSON.stringify(token, undefined, 2));
          authKeyResolve(token);
        }
      });
    });

    token = await authKeyPromise;
  }

  oauthClient.credentials = token;

  return oauthClient;
}

async function main() {
  // 1. Start the server
  const server = new Server();
  server.start();

  // 2. Set up the client (authenticate)
  const oauthClient = await authenticateClient(server);

  // 3. Start polling live data
  const client = new YouTubeClient(oauthClient);
  const currentStream = await client.getCurrentStream();

  if (!currentStream) {
    // TODO: Poll until stream starts?
    console.error("There is no current live stream, exiting...\n");
    process.exit(1);
  }

  console.log("Viewers:", await client.getViewerCount(currentStream.id));

  let chatMessageResolve = undefined;
  const chatMessagePromise = new Promise<any[]>((resolve, reject) => {
    chatMessageResolve = resolve;
  });

  const chatPoller = new ChatPoller(currentStream.liveChatId, client);

  chatPoller.observable.forEach(m => {
    server.broadcastMessage(m);
  });

  server.router.get('/', (req, res) => {
    // chatMessagePromise.then((messages: any[]) => {
    //   let chatString = "";
    //   for (const m of messages) {
    //     chatString += m.snippet.textMessageDetails.messageText + "<br />";
    //   }
    //   res.send(`<html><head><link rel="stylesheet" type="text/css" href="page.css"></head><body><h1>Hello World!</h1>${chatString}<script src="client.js"></script></body></html>`);
    // });
    res.send(`<html><head><link rel="stylesheet" type="text/css" href="page.css"></head><body><h1>Hello World!</h1><script src="client.js"></script></body></html>`);
  });

  chatPoller.startPolling();
}

main().then(() => console.log("Done!")).catch(err => console.error("ERROR:", err));
