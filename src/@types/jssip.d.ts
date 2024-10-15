// src/jssip.d.ts
declare module 'jssip' {
  export class UA {
      stop() {
          throw new Error('Method not implemented.');
      }
      constructor(configuration: any);
      on(event: string, callback: (e: any) => void): void;
      start(): void;
  }

  export class WebSocketInterface {
      constructor(url: string);
  }

  export class RTCSession {
      id: string;
      answer(options: any): void;
      terminate(): void;
  }
}
