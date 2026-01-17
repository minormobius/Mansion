/**
 * Bluesky AT Protocol client wrapper
 */

import { BskyAgent, RichText } from '@atproto/api';
import type { AgentCredentials, BlueskyPost, PostResult } from '../types/index.js';

export class BlueskyClient {
  private agent: BskyAgent;
  private credentials: AgentCredentials;
  private authenticated = false;

  constructor(credentials: AgentCredentials) {
    this.agent = new BskyAgent({
      service: 'https://bsky.social',
    });
    this.credentials = credentials;
  }

  /** Authenticate with Bluesky */
  async login(): Promise<void> {
    if (this.authenticated) return;

    await this.agent.login({
      identifier: this.credentials.identifier,
      password: this.credentials.password,
    });
    this.authenticated = true;
  }

  /** Ensure we're logged in before making requests */
  private async ensureAuth(): Promise<void> {
    if (!this.authenticated) {
      await this.login();
    }
  }

  /** Create a post on Bluesky */
  async post(content: BlueskyPost): Promise<PostResult> {
    await this.ensureAuth();

    try {
      // Create rich text to handle mentions, links, etc.
      const rt = new RichText({ text: content.text });
      await rt.detectFacets(this.agent);

      const record: Record<string, unknown> = {
        text: rt.text,
        facets: rt.facets,
        createdAt: new Date().toISOString(),
      };

      // Add reply reference if this is a reply
      if (content.replyTo) {
        record.reply = {
          root: content.replyTo,
          parent: content.replyTo,
        };
      }

      // Add embed if provided
      if (content.embed?.type === 'link' && content.embed.url) {
        record.embed = {
          $type: 'app.bsky.embed.external',
          external: {
            uri: content.embed.url,
            title: content.embed.title || '',
            description: content.embed.description || '',
          },
        };
      }

      const response = await this.agent.post(record);

      return {
        uri: response.uri,
        cid: response.cid,
        success: true,
      };
    } catch (error) {
      return {
        uri: '',
        cid: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /** Reply to an existing post */
  async reply(text: string, parentUri: string, parentCid: string): Promise<PostResult> {
    return this.post({
      text,
      replyTo: { uri: parentUri, cid: parentCid },
    });
  }

  /** Get the agent's own posts */
  async getOwnPosts(limit = 20): Promise<unknown[]> {
    await this.ensureAuth();

    const response = await this.agent.getAuthorFeed({
      actor: this.credentials.identifier,
      limit,
    });

    return response.data.feed;
  }

  /** Get the agent's timeline */
  async getTimeline(limit = 50): Promise<unknown[]> {
    await this.ensureAuth();

    const response = await this.agent.getTimeline({ limit });
    return response.data.feed;
  }

  /** Search for posts by query */
  async searchPosts(query: string, limit = 25): Promise<unknown[]> {
    await this.ensureAuth();

    // Note: Search API might have limited availability
    try {
      const response = await this.agent.app.bsky.feed.searchPosts({
        q: query,
        limit,
      });
      return response.data.posts;
    } catch {
      console.warn('Search API not available');
      return [];
    }
  }

  /** Get notifications (mentions, replies, etc.) */
  async getNotifications(limit = 50): Promise<unknown[]> {
    await this.ensureAuth();

    const response = await this.agent.listNotifications({ limit });
    return response.data.notifications;
  }

  /** Follow another user */
  async follow(did: string): Promise<void> {
    await this.ensureAuth();
    await this.agent.follow(did);
  }

  /** Like a post */
  async like(uri: string, cid: string): Promise<void> {
    await this.ensureAuth();
    await this.agent.like(uri, cid);
  }

  /** Repost a post */
  async repost(uri: string, cid: string): Promise<void> {
    await this.ensureAuth();
    await this.agent.repost(uri, cid);
  }

  /** Get profile information */
  async getProfile(handle: string): Promise<unknown> {
    await this.ensureAuth();
    const response = await this.agent.getProfile({ actor: handle });
    return response.data;
  }

  /** Resolve a handle to DID */
  async resolveHandle(handle: string): Promise<string> {
    await this.ensureAuth();
    const response = await this.agent.resolveHandle({ handle });
    return response.data.did;
  }

  /** Get the underlying BskyAgent for advanced operations */
  getAgent(): BskyAgent {
    return this.agent;
  }
}
