import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AxiosRequestConfig } from 'axios';
import { Observable } from 'rxjs';
import { SettingsService } from './settings.service';
import { map, mergeMap, take } from 'rxjs/operators';
import { parse } from 'node-html-parser';

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
        return this.httpClient.post<T>('/api/http-proxy', body, { responseType: 'json' });
      }),
    );
  }

  getFoodMenu(): Observable<string> {
    const body: AxiosRequestConfig = {
      method: 'GET',
      url: 'https://api.malcajt.com/getApiData.php?action=embed&id=2030&show=1001&color1=666666&color2=cc0000',
    };
    return this.httpClient.post('/api/http-proxy', body, { responseType: 'text' });
  }

  getParsedFoodMenu(): Observable<string | undefined> {
    return this.getFoodMenu().pipe(
      map((menuHtml) => {
        const root = parse(menuHtml);
        const today = root.querySelector('#day0');

        if (!today || !today.innerHTML) {
          throw new Error('Failed to parse Food Menu HTML.');
        }

        return today.innerHTML.replace(/<br>/g, '\n');
      }),
    );
  }

  getTextFromImage(imageUrl: string): Observable<string | null> {
    return this.httpClient
      .post<TextDetectionResponse>('/api/image-text-detection', { imageUrl }, { responseType: 'json' })
      .pipe(map(({ text }) => text));
  }
}
