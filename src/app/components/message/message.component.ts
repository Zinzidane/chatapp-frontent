import { Component, OnInit, AfterViewInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TokenService } from 'src/app/services/token.service';
import { MessageService } from 'src/app/services/message.service';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from 'src/app/services/users.service';
import io from 'socket.io-client';
import { CaretEvent, EmojiEvent, EmojiPickerOptions } from 'ng2-emoji-picker';
import _ from 'lodash';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() users;
  receiver: string;
  receiverData: any;
  user: any;
  message: string;
  messages = [];
  socket: any;
  typingMessage;
  typing = false;
  isOnline = false;

  eventMock;
  eventPosMock;

  direction = Math.random() > 0.5 ? (Math.random() > 0.5 ? 'top' : 'bottom') : (Math.random() > 0.5 ? 'right' : 'left');
  toggled = false;
  content = ' ';

  _lastCaretEvent: CaretEvent;

  constructor(
    private tokenService: TokenService,
    private usersService: UsersService,
    private msgService: MessageService,
    private route: ActivatedRoute,
    private emojiPickerOptions: EmojiPickerOptions
    ) {
      this.socket = io('http://localhost:3000');
      // this.emojiPickerOptions.setEmojiSheet({
      //   url: 'sheet_apple_32.png',
      //   locator: EmojiPickerAppleSheetLocator
      // });
    }

  ngOnInit() {
    this.user = this.tokenService.GetPayload();

    this.route.params.subscribe(params => {
      this.receiver = params.name;
      this.GetUserByUsername(this.receiver);

      this.socket.on('refreshPage', () => {
        this.GetUserByUsername(this.receiver);
        this.GetMessages(this.user._id, this.receiverData._id);
      });

      this.socket.on('is_typing', data => {
        if(data.sender === this.receiver) {
          this.typing = true;
        }
      });

      this.socket.on('has_stopped_typing', data => {
        if(data.sender === this.receiver) {
          this.typing = false;
        }
      });
    });
  }

  ngAfterViewInit() {
    const params = {
      room1: this.user.username,
      room2: this.receiver
    };

    this.socket.emit('join_chat', params);
  }

  ngOnChanges(changes: SimpleChanges) {
    const title = document.querySelector('.nameCol');
    if(changes.users.currentValue.length > 0) {
      const result = _.indexOf(changes.users.currentValue, this.receiver);
      if(result > -1) {
        this.isOnline = true;
        (title as HTMLElement).style.marginTop = '10px';
      } else {
        this.isOnline = false;
        (title as HTMLElement).style.marginTop = '20px';
      }
    }
  }


  GetUserByUsername(username) {
    this.usersService.GetUserByName(username).subscribe(data => {
      this.receiverData = data.result;

      this.GetMessages(this.user._id, this.receiverData._id);
    });
  }

  GetMessages(senderId, receiverId) {
    this.msgService.GetAllMessages(senderId, receiverId).subscribe(data => {
      this.messages = data.messages.message;
      console.log(data.messages);
    });
  }

  SendMessage() {
    if (this.message) {
      this.msgService.SendMessage(this.user._id, this.receiverData._id, this.receiverData.username, this.message).subscribe(data => {
        this.socket.emit('refresh', {});
        this.message = '';
      });
    }
  }

  IsTyping() {
    this.socket.on('start_typing', {
      sender: this.user.username,
      receiver: this.receiver
    });

    if(this.typingMessage) {
      clearTimeout(this.typingMessage);
    }

    this.typingMessage = setTimeout(() => {
      this.socket.emit('stop_typing', {
        sender: this.user.username,
        receiver: this.receiver
      });
    }, 500);
  }

  Toggled() {
    this.toggled = !this.toggled;
  }

  HandleSelection(event: EmojiEvent) {
    this.content = this.content.slice(0, this._lastCaretEvent.caretOffset) + event.char + this.content.slice(this._lastCaretEvent.caretOffset);
    this.eventMock = JSON.stringify(event);

    this.message = this.content;

    this.toggled = !this.toggled;
    // Clear emoji
    this.content = '';
  }

  HandleCurrentCaret(event: CaretEvent) {
    this._lastCaretEvent = event;
    this.eventPosMock = `{ caretOffset : ${event.caretOffset}, caretRange: Range{...}, textContent: ${event.textContent} }`;
  }
}
