import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StreamsComponent } from '../components/streams/streams.component';
import { TokenService } from '../services/token.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [StreamsComponent],
  exports: [StreamsComponent],
  providers: [TokenService]
})
export class StreamsModule { }
