import { Observable, Subscriber } from "rxjs";
import { YouTubeClient } from "./youTubeClient";

export type ChatMessage = {
  message: string;
  sender: string;
};

export class ChatPoller {
  private subscriber: Subscriber<ChatMessage>;
  public observable: Observable<ChatMessage>;

  constructor(private liveChatId: string, private youTubeClient: YouTubeClient) {
    this.observable = new Observable(subscriber => this.subscriber = subscriber);
  }

  public startPolling() {
    this.getNextMessages();
  }

  private getNextMessages(pageToken?: string) {
    this.youTubeClient
      .getChatMessages(this.liveChatId, pageToken)
      .then(
        response => {
          const chatMessages = response.items;
          const nextPageToken = response.nextPageToken;
          const delayUntilNextMs = response.pollingIntervalMillis;

          for (const message of chatMessages) {
            this.subscriber.next({
              sender: message.authorDetails.displayName,
              message: message.snippet.textMessageDetails.messageText,
            });
          }

          if (nextPageToken) {
            const pollInterval = setInterval(() => {
              clearInterval(pollInterval);
              this.getNextMessages(nextPageToken);
            }, delayUntilNextMs + 150);
          }
    });
  }
}
