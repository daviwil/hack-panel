import { OAuth2Client } from "google-auth-library";

export type StreamDetails = {
  id: string;
  liveChatId: string;
};

export type ChatMessagesResponse = {
  items: any[];
  nextPageToken: string;
  pollingIntervalMillis: number;
};

export class YouTubeClient {
  constructor(private apiClient: OAuth2Client) {
  }

  public async getCurrentStream(): Promise<StreamDetails> {
    const response =
      await this.apiClient.request<any>({
        url: "https://www.googleapis.com/youtube/v3/liveBroadcasts",
        params: {
          mine: true,
          part: "snippet,status",
        },
      });

    const results = response.data.items.filter(b => b.status!.lifeCycleStatus === "live");
    return results.length > 0 ? {
      id: results[0].id,
      liveChatId: results[0].snippet.liveChatId
    } : undefined;
  }

  public async getViewerCount(streamId: string): Promise<number> {
    const response =
      await this.apiClient.request<any>({
        url: "https://www.googleapis.com/youtube/v3/videos",
        params: {
          id: streamId,
          part: "liveStreamingDetails"
        }
      });

    return response.data.items[0].liveStreamingDetails.concurrentViewers || 0;
  }

  public async getChatMessages(liveChatId: string, pageToken?: string): Promise<ChatMessagesResponse> {
    const response = await this.apiClient.request<ChatMessagesResponse>({
      url: "https://www.googleapis.com/youtube/v3/liveChat/messages",
      params: {
        liveChatId,
        pageToken,
        part: "snippet"
      }
    });

    return response.data;
  }
}
