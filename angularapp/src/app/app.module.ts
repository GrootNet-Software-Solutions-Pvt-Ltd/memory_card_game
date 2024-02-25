import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { MemoryCardGameService } from './Services/memory-card-game.service';
import { CardComponent } from './sharedComponent/card/card.component';
import { GameComponent } from './sharedComponent/game/game.component';
import { AppRoutingModule } from './app-routing.module';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
    declarations: [
        AppComponent,
        CardComponent,
        GameComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        AppRoutingModule,
        ToastrModule.forRoot(),
    ],
    providers: [
        MemoryCardGameService,
        // {
        //     provide: APP_INITIALIZER,
        //     useFactory: (signalrService: MemoryCardGameService) => () => signalrService.initiateSignalrConnection(),
        //     deps: [MemoryCardGameService],
        //     multi: true,
        // }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
