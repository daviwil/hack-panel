import { Observable, Subscriber } from 'rxjs';
import { google, youtube_v3 } from "googleapis";

export type ChatMessage = {
  message: string;
  sender: string;
};

export class ChatPoller {
  private subscriber: Subscriber<ChatMessage>;
  public observable: Observable<ChatMessage>;

  constructor(private liveChatId: string, private youtubeClient: youtube_v3.Youtube) {
    this.observable = new Observable(subscriber => this.subscriber = subscriber);
  }

  public startPolling() {
    this.getNextMessages();
  }

  private getNextMessages(pageToken?: string) {
    this.youtubeClient.liveChatMessages.list({
      liveChatId: this.liveChatId,
      pageToken,
      part: ["snippet"]
    }).then(response => {
      const chatMessages = response.data.items;
      const nextPageToken = response.data.nextPageToken;
      const delayUntilNextMs = response.data.pollingIntervalMillis;
      
      for (const message of chatMessages) {
        this.subscriber.next({
          sender: 'Person',
          message: message.snippet.textMessageDetails?.messageText,
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
