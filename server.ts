import * as WebSocket from "ws";
import * as express from "express";
import * as http from "http";

export class Server {
  private wss: WebSocket.Server;
  private app: express.Express;
  private httpServer: http.Server;
  private wsClients: WebSocket[] = [];

  public router: express.Router;

  constructor(private httpPort: number = 3000, private wsPort: number = 3001) {
    this.wss = new WebSocket.Server({ port: wsPort });
    this.router = express.Router();
  }

  public start() {
    this.wss.on('connection', ws => {
      ws.on('message', function incoming(message) {
        console.log('received: %s', message);
      });

      this.wsClients.push(ws);
    });

    this.app = express();
    this.app.use(express.static('public'));
    this.app.use('/', this.router);

    this.httpServer = this.app.listen(this.httpPort, () => {
      console.log(`Example app listening at http://localhost:${this.httpPort}`)
    });
  }

  public broadcastMessage(message: any) {
    for (const client of this.wsClients) {
      client.send(JSON.stringify(message));
    }
  }
}
