$(function(){
    if ('speechSynthesis' in window) {
      $('#speak').click(function(){
        var text = "welcome all guys"
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
      })
    } else {
      $('#modal1').openModal();
    }
  });