var flag = 0;
var rec_mail = "";
var message = "";
try {
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = new SpeechRecognition();
}
catch(e) {
  console.error(e);
  $('.no-browser-support').show();
  $('.app').hide();
}


var noteTextarea = $('#note-textarea');
var instructions = $('#recording-instructions');
var notesList = $('ul#notes');

var noteContent = '';

// Get all notes from previous sessions and display them.
var notes = getAllNotes();
renderNotes(notes);

//text to speech function
function textspeech(data){
  if ('speechSynthesis' in window) {
      var text = data
      var msg = new SpeechSynthesisUtterance();
      var voices = window.speechSynthesis.getVoices();
      msg.voice = voices[3];
      msg.rate = 1;
      msg.pitch = 1;
      msg.text = text;
      msg.onend = function(e) {
        console.log('Finished in ' + event.elapsedTime + ' seconds.');
      };

      speechSynthesis.speak(msg);
  } else {
    console.log("error occured");
  }
}

function modify(mail)
{
  mail = mail.trim();
  mail = mail.replace(/ +/g, "");
  mail = mail.toLowerCase();
  console.log(mail);
  return mail;
}

/*-----------------------------
      Voice Recognition 
------------------------------*/

// If false, the recording will stop after a few seconds of silence.
// When true, the silence period is longer (about 15 seconds),
// allowing us to keep recording even when the user pauses. 
recognition.continuous = true;

// This block is called every time the Speech APi captures a line. 
recognition.onresult = function(event) {

  // event is a SpeechRecognitionEvent object.
  // It holds all the lines we have captured so far. 
  // We only need the current one.
  var current = event.resultIndex;

  // Get a transcript of what was said.
  var transcript = event.results[current][0].transcript;

  // Add the current transcript to the contents of our Note.
  // There is a weird bug on mobile, where everything is repeated twice.
  // There is no official solution so far so we have to handle an edge case.
  var mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);
  if(!mobileRepeatBug) {
    console.log("flag: "+flag);
    if(transcript.trim() == "end" || transcript.trim() == "and" ||transcript.trim() == "tend" || transcript.trim() == "ind")
    {
      console.log("receiver mail: "+rec_mail);
      flag = 0;
      var msg = new SpeechSynthesisUtterance();
      var voices = window.speechSynthesis.getVoices();
      msg.text = "Please say the message to be send once finished say end message";
      flag = 2;
      msg.voice = voices[3];
      speechSynthesis.speak(msg); 
      transcript = "";
    }
    if(transcript.trim() == "end message" || transcript.trim() == "send message")
    {
      flag = 0;
      console.log("message: "+message);
      Email.send({
        Host : "smtp.elasticemail.com",
        Username : "rsreevishal111@gmail.com",
        Password : "f71c4fcf-076d-433e-a47e-e0c2fdeac106",
        To : modify(rec_mail),
        From : "rsreevishal111@gmail.com",
        Subject : "this is from voizaa",
        Body : message.trim()
    }).then(
      message => alert(message)
    );
    } 
    if(flag === 1)
    {
      rec_mail += transcript.trim();
    } 
    if(flag == 2)
    {
      message += transcript.trim();
    }
    noteContent += transcript;
    console.log(transcript);
    if(transcript.trim() == "open inbox")
    {
      //======================================================================
      jQuery.get('./messages/message.txt',(data)=>{
        document.getElementById("result").innerHTML = data;
        textspeech(data);
      });
    }
    else if(transcript.trim() == "stop")
    {
      window.speechSynthesis.cancel();
    }
    else if(transcript.trim() == "compose mail")
    {
      flag = 1;
      var msg = new SpeechSynthesisUtterance();
      var voices = window.speechSynthesis.getVoices();
      msg.text = "Please say the email of the receiver once finished say end";
      msg.voice = voices[3];
      speechSynthesis.speak(msg); 
    }
  
    noteTextarea.val(noteContent);
  }
};

recognition.onstart = function() { 
  instructions.text('Voice recognition activated. Try speaking into the microphone.');
}

recognition.onspeechend = function() {
  instructions.text('You were quiet for a while so voice recognition turned itself off.');
}

recognition.onerror = function(event) {
  if(event.error == 'no-speech') {
    instructions.text('No speech was detected. Try again.');  
  };
}



/*-----------------------------
      App buttons and input 
------------------------------*/

$('#start-record-btn').on('click', function(e) {
  if (noteContent.length) {
    noteContent += ' ';
  }
  recognition.start();
});


$('#pause-record-btn').on('click', function(e) {
  recognition.stop();
  instructions.text('Voice recognition paused.');
});

// Sync the text inside the text area with the noteContent variable.
noteTextarea.on('input', function() {
  noteContent = $(this).val();
})

$('#save-note-btn').on('click', function(e) {
  recognition.stop();

  if(!noteContent.length) {
    instructions.text('Could not save empty note. Please add a message to your note.');
  }
  else {
    // Save note to localStorage.
    // The key is the dateTime with seconds, the value is the content of the note.
    saveNote(new Date().toLocaleString(), noteContent);

    // Reset variables and update UI.
    noteContent = '';
    renderNotes(getAllNotes());
    noteTextarea.val('');
    instructions.text('Note saved successfully.');
  }
      
})


notesList.on('click', function(e) {
  e.preventDefault();
  var target = $(e.target);

  // Listen to the selected note.
  if(target.hasClass('listen-note')) {
    var content = target.closest('.note').find('.content').text();
    readOutLoud(content);
  }

  // Delete note.
  if(target.hasClass('delete-note')) {
    var dateTime = target.siblings('.date').text();  
    deleteNote(dateTime);
    target.closest('.note').remove();
  }
});



/*-----------------------------
      Speech Synthesis 
------------------------------*/

function readOutLoud(message) {
	var speech = new SpeechSynthesisUtterance();

  // Set the text and voice attributes.
	speech.text = message;
	speech.volume = 1;
	speech.rate = 1;
	speech.pitch = 1;
  
	window.speechSynthesis.speak(speech);
}



/*-----------------------------
      Helper Functions 
------------------------------*/

function renderNotes(notes) {
  var html = '';
  if(notes.length) {
    notes.forEach(function(note) {
      html+= `<li class="note">
        <p class="header">
          <span class="date">${note.date}</span>
          <a href="#" class="listen-note" title="Listen to Note">Listen to Note</a>
          <a href="#" class="delete-note" title="Delete">Delete</a>
        </p>
        <p class="content">${note.content}</p>
      </li>`;    
    });
  }
  else {
    html = '<li><p class="content">You don\'t have any notes yet.</p></li>';
  }
  notesList.html(html);
}


function saveNote(dateTime, content) {
  localStorage.setItem('note-' + dateTime, content);
}


function getAllNotes() {
  var notes = [];
  var key;
  for (var i = 0; i < localStorage.length; i++) {
    key = localStorage.key(i);

    if(key.substring(0,5) == 'note-') {
      notes.push({
        date: key.replace('note-',''),
        content: localStorage.getItem(localStorage.key(i))
      });
    } 
  }
  return notes;
}


function deleteNote(dateTime) {
  localStorage.removeItem('note-' + dateTime); 
}

/*if(transcript.trim() == "or")
        transcript = "r"; 
      else if(transcript.trim() == "see")
        transcript = "c";
      else if(transcript.trim() == "yes")
        transcript = "s";
      else if(transcript.trim() == "tea")
        transcript = "t";
      else if(transcript.trim() == "be")
        transcript = "b";
      else if(transcript.trim() == "be")
        transcript = "b";
      else if(transcript.trim() == "you")
        transcript = "u";
      else if(transcript.trim() == "we")
        transcript = "w";
      else if(transcript.trim() == "at")
        transcript = "@";
      else if(transcript.trim() == "dot")
        transcript = ".";
      else if(transcript.trim() == "end")
      {
        flag = 0;
        console.log("receiver email: "+rec_mail);
      }
      if(flag == 1)*/