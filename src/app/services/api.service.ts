import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AxiosRequestConfig } from 'axios';
import { Observable } from 'rxjs';
import { SettingsService } from './settings.service';
import { map, mergeMap, take } from 'rxjs/operators';

interface TextDetectionResponse {
  text: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private httpClient: HttpClient, private settingsService: SettingsService) {}

  sendSlackMessage<T>(text: string): Observable<T> {
    return this.settingsService.getGeneralSettings().pipe(
      take(1),
      mergeMap((settings) => {
        const params = [
          `token=${encodeURIComponent(settings.slackToken)}`,
          `channel=${encodeURIComponent(settings.slackChannel)}`,
          `text=${encodeURIComponent(text)}`,
        ];
        const body: AxiosRequestConfig = {
          method: 'GET',
          headers: { cookie: settings.slackCookie },
          url: `https://slack.com/api/chat.postMessage?${params.join('&')}`,
        };
        return this.httpClient.post<T>('/api/httpProxy', body, { responseType: 'json' });
      }),
    );
  }

  parseFromUrl(url: string, selector: string, responseType: 'text' | 'html'): Observable<string> {
    return this.httpClient
      .post('/api/httpHtmlParse', { url, selector, responseType }, { responseType: 'text' })
      .pipe(map((result) => {
        if (!result) {
          throw new Error('Failed to parse HTML.');
        }
        return result;
      }));
  }

  getTextFromImage(imageUrl: string): Observable<string | null> {
    return this.httpClient
      .post<TextDetectionResponse>('/api/imageTextDetection', { imageUrl }, { responseType: 'json' })
      .pipe(map(({ text }) => text));
  }
}
