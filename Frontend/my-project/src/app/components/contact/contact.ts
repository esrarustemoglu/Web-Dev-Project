import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-contact',
  imports: [FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  contactForm = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  constructor(){}
  ngOnInit(){}

  sendData(){
    const data={
      username: this.contactForm.name,
      email: this.contactForm.email,
      subject: this.contactForm.subject,
      message: this.contactForm.message
    }
    console.log(data);
  }

  submitFeedback(){
    console.log('Form Submitted: ', this.contactForm );
    alert('Thank you for feedback ' + this.contactForm.name);
  }
}
