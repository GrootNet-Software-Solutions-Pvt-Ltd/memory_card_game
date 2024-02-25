import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { MemoryCardGameService } from 'src/app/Services/memory-card-game.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})

export class GameComponent implements OnInit, OnDestroy {
  // Flag
  gameStarted: boolean = false;
  showWaitingListMessage: boolean = false;

  //Data
  players: any = [];
  cards: any = [];
  userId: string = "";
  // Subscriptions
  playerCardSubscription!: Subscription;
  private playerExistsSubscription!: Subscription;
  private waitingListSubscription!: Subscription;
  private showMatchSubscription!: Subscription;
  private playerJoinedSubscription!: Subscription;
  private playerFindCard!: Subscription;
  private winnerSubscription!: Subscription;
  constructor(
    private memoryCardGameService: MemoryCardGameService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.isPlayerExist;

    //Check for Player waitng
    this.isPlayerWaiting;

    // Subscribe to showMatch event
    this.showMatchSubscription =
      this.memoryCardGameService.showMatchSubscriber.subscribe(
        ({ card, winner }) => {
          this.showCardMatchHandler(card, winner);
        }
      );

    this.winnerSubscription =
      this.memoryCardGameService.winnerSubscriber.subscribe(
        ({ card, winner }) => {
          this.winnerHandler(card, winner);
        }
      );
    this.memoryCardGameService.flipCardSubscriber.subscribe((data: any) => {
      let containerReference = document.getElementById('card-' + data.id);
      containerReference?.classList.add('flip');
      containerReference?.classList.add('match');
    });
    this.resetFlip();
  }

  ngOnDestroy(): void {
    // Unsubscribe from subscriptions to avoid memory leaks
    this.unsubscribeSubscriptions();
  }

  get isPlayerExist() {
    // Subscribe to playerExists event
    return this.playerExistsSubscription =
      this.memoryCardGameService.playerExistsSubscriber.subscribe(() => {
        // Handle Message for playerExists
        this.toastr.error("Sorry, that username is already in use. Please choose a different one.");
      });
  }

  get isPlayerWaiting() {
    // Subscribe to waitingList event
    return this.waitingListSubscription =
      this.memoryCardGameService.waitingListSubscriber.subscribe(() => {
        this.showWaitingListMessage = true;
        if (this.showWaitingListMessage) {
          this.toastr.info("At this time there is not an opponent. As soon as one joins your game will begin.");
        }
      });
  }

  onJoinGameClick() {
    // Retrieve username from input field
    const username = (document.getElementById('usernameTb') as HTMLInputElement).value;
    this.memoryCardGameService.joinGame(username);

    // Subscribe to playerJoined event
    this.playerJoinedSubscription =
      this.memoryCardGameService.playerJoinedSubscriber.subscribe(
        (player: any) => {
          console.log("playerplayer", player);
          this.userId = player.id;
          this.players.push(player);
          this.gameStarted = true;
          this.showWaitingListMessage = false; // Hide waiting list message once game starts
        }
      );

    // Subscribe to buildBoard event
    this.playerCardSubscription = this.memoryCardGameService.buildBoardSubscriber.subscribe(
      (player: any) => {
        this.cards = player.board.pieces.map((card: any) => {
          return { ...card, image: `${card.image}` };
        });
        this.gameStarted = true;
        this.showWaitingListMessage = false; // Hide waiting list message once game starts
        console.log("sadsadadas", player);

        const alertElement = (document.getElementById('alert')) as HTMLDivElement;
        if (alertElement && this.userId == player.whosTurn) {
          alertElement.innerHTML = "Let's begin the game.  You get to go first!";
        } else if (alertElement) {
          alertElement.innerHTML = "Let's begin the game.  Your opponent gets to go first!";
        }

      }
    );
  }

  onFlipCardClick(event: any) {
    // Logic for flipping cards
    let getCardClass = event.currentTarget.classList;
    let getCardIdName = event.currentTarget.id;
    let isCardMatchClassAvailable = getCardClass.contains('match');
    let isCardFlipClassAvailable = getCardClass.contains('flip');

    if (!(isCardMatchClassAvailable && isCardFlipClassAvailable)) {
      console.log(this.players, 'players');
      this.memoryCardGameService.flipCardHandler(
        getCardIdName,
        this.players[0].name
      );
    }




  }

  resetFlip() {
    this.memoryCardGameService.resetFlipCardSubscribe.subscribe((data: any) => {
      let cardA = document.getElementById('card-' + data.cardA.id);
      let cardB = document.getElementById('card-' + data.cardB.id);
      setTimeout(function () {
        cardA?.classList.remove('flip');
        cardB?.classList.remove('flip');
      }, 1500);
    });
  }

  showCardMatchHandler(card: any, winner: string): void {
    // Handle showMatch event
    // Update UI, display messages, etc.
    console.log(`Match found! Card: ${card}, Winner: ${winner}`);
    const cardElement = document.getElementById(card.name);
    const cardPair = document.getElementById("card-" + card.Pair) as HTMLElement;
    if (cardElement) {
      cardElement.classList.add('match');
      //cardPair.classList.add("match");
    }

    const alertElement = document.getElementById('alert');
    if (alertElement) {
      alertElement.innerHTML = `<strong>Yay</strong> ${winner} found a match!`;
    }

    let data = document.getElementById('usernameTb');
    console.log(data);

    if (
      winner ===
      (document.getElementById('spanusernameTb') as HTMLSpanElement)?.innerText
    ) {
      const winsElement = document.getElementById('wins');
      console.log(winsElement, 'test');

      if (winsElement) {
        winsElement.innerHTML += `<li><img src='${card.image}' width='30' height='30'></li>`;
      }
    }
    this.removeElementsByClass("match");
  }
  removeElementsByClass(className: string) {
    const elements = document.getElementsByClassName(className) as HTMLCollectionOf<HTMLDivElement>;
    while (elements.length > 0) {
      elements[0].parentNode?.removeChild(elements[0]);
    }
  }
  winnerHandler(card: any, winner: string): void {
    // Handle showMatch event
    // Update UI, display messages, etc.
    console.log(`Match found! Card: ${card}, Winner: ${winner}`);
    const cardElement = document.getElementById(card.id) as HTMLElement;
    const cardPair = document.getElementById("#card-" + card.Pair) as HTMLElement;
    if (cardElement) {
      cardElement.classList.add('match');
      cardPair.classList.add('match');
    }

    const alertElement = document.getElementById('alert');
    if (alertElement) {
      alertElement.innerHTML = `<strong>Yay</strong> ${winner} found a match!`;
    }

    let data = document.getElementById('usernameTb');
    console.log(data);

    if (
      winner ===
      (document.getElementById('spanusernameTb') as HTMLSpanElement)?.innerText
    ) {
      alert("you win")
    }
    else {
      alert("you lost")
    }



  }
  checkCard(cardId: string) {
    // Get username from input field
    const username = (document.getElementById('usernameTb') as HTMLInputElement).value;
    console.log(username, 'username');

    // Call checkCard method of MemoryCardGameService
    this.memoryCardGameService.checkCard(cardId, username);
  }

  private unsubscribeSubscriptions() {
    this.unsubscribe(this.playerFindCard);
    this.unsubscribe(this.playerFindCard);
    this.unsubscribe(this.playerJoinedSubscription);
    this.unsubscribe(this.playerExistsSubscription);
    this.unsubscribe(this.waitingListSubscription);
    this.unsubscribe(this.showMatchSubscription);
    this.unsubscribe(this.winnerSubscription);
  }

  private unsubscribe(subscription: Subscription) {
    if (subscription && !subscription.closed) {
      subscription.unsubscribe();
    }
  }
}
