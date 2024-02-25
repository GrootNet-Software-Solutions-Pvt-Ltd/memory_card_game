import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HubConnection } from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class MemoryCardGameService {
  signalRConnection: any;
  hubConnection!: HubConnection;
  baseHubUrlConnection: string = "https://localhost:7176/gameshub";

  // Subjects for communication with components
  playerJoinedSubscriber = new Subject<any>();
  findCardSubscriber = new Subject<any>();
  buildBoardSubscriber = new Subject<any>();
  flipSubscriber = new Subject<any>();
  flipCardSubscriber = new Subject<any>();
  resetFlipCardSubscribe = new Subject<any>();
  playerExistsSubscriber = new Subject<void>();
  waitingListSubscriber = new Subject<void>();
  showMatchSubscriber = new Subject<any>();
  winnerSubscriber = new Subject<any>();

  constructor(
    private http: HttpClient,
    private toastr: ToastrService
  ) {
    this.initiateSignalrConnection();
  }

  async initiateSignalrConnection(): Promise<void> {
    try {
      // Create and start SignalR connection
      this.signalRConnection = new signalR.HubConnectionBuilder()
        .withUrl(this.baseHubUrlConnection)
        .withAutomaticReconnect()
        .build();
      let parent = this;
      await this.signalRConnection.start({ withCredentials: false }).then(async function () {
        // Set up event handlers for incoming messages
        await parent.setupEventHandlers();

        //Handle Message for sucessfully SignalR Connection
        parent.toastr.success(`SignalR Connected Sucessfully. ConnectionId: ${parent.signalRConnection.connectionId}`);
        console.log(`SignalR Connected Sucessfully. ConnectionId: ${parent.signalRConnection.connectionId}`);

      });

    }
    catch (error) {
      //Handle Message for error in SignalR Connection
      this.toastr.success(`SignalR connection error: ${error}`);
      console.log(`SignalR connection error: ${error}`);
    }
  }

  private async setupEventHandlers(): Promise<void> {
    // Handle events received from SignalR server
    this.signalRConnection.on('playerJoined', (data: any) => {
      this.playerJoinedSubscriber.next(data);
    });

    this.signalRConnection.on('FindCard', (data: any) => {
      this.findCardSubscriber.next(data);
    });

    this.signalRConnection.on('buildBoard', (data: any) => {
      this.buildBoardSubscriber.next(data);
    });

    this.signalRConnection.on('flipCard', (data: any) => {
      this.flipCardSubscriber.next(data);
    });

    this.signalRConnection.on('resetFlip', (cardA: any, cardB: any) => {
      this.resetFlipCardSubscribe.next({ cardA, cardB });
    });

    this.signalRConnection.on('playerExists', () => {
      this.playerExistsSubscriber.next();
    });

    this.signalRConnection.on('waitingList', () => {
      this.waitingListSubscriber.next();
    });

    this.signalRConnection.on('showMatch', (card: any, winner: string) => {
      this.showMatchSubscriber.next({ card, winner });
    });

    this.signalRConnection.on('winner', (card: any, winner: string) => {
      this.winnerSubscriber.next({ card, winner });
    });
  }

  // Method to initiate a flip of a card
  flipCardHandler(idName: string, userName: string): void {
    this.flipSubscriber = this.signalRConnection.invoke('flip', idName, userName)
      .then((result: boolean) => {
        if (result) {
          this.checkCard(idName, userName);
        }
      })
      .catch((err: any) =>
        console.error('Error while invoking "flip" method: ', err)
      );
  }

  // Method to get initial game board
  getInitialBoard() {
    return this.http.get(this.baseHubUrlConnection);
  }

  // Method to flip a card
  flipCard(cardName: string): void {
    this.hubConnection.invoke('Flip', cardName)
      .catch((err) => console.error(err));
  }

  // Method to check a card
  checkCard(cardName: string, username: string): void {
    this.signalRConnection.invoke('CheckCard', cardName, username)
      .catch((err: any) => console.error(err));
  }

  // Method to join the game
  joinGame(username: string) {
    this.signalRConnection.invoke('Join', username);
  }
}
