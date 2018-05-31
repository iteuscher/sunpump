var imageWidth = 2048,
    imageHeight = 1364,
    imageAspectRatio = imageWidth / imageHeight,
    $window = $(window);

var hotSpots = [{
  'title': 'Mouth',
  'description': 'scream.',
  'x': -600,
  'y': -180
}, {
  'title': 'Body',
  'description': 'Look at it.',
  'x': 108,
  'y': 20
}, {
  'title': 'Antlers',
  'description': 'They crazy.',
  'x': 40,
  'y': -170
}, {
  'title': 'This Ear',
  'description': 'It can hear things.',
  'x': -265,
  'y': -145
}];

function appendHotSpots() {
  for (var i = 0; i < hotSpots.length; i++) {
    var $hotSpot = $('<div>').addClass('hot-spot');
    $('.hotspot-img-container').append($hotSpot);
  }
  positionHotSpots();
}

function appendSpeechBubble() {
  var $speechBubble = $('<div>').addClass('speech-bubble');
  $('.hotspot-img-container').append($speechBubble);
}

function handleHotSpotMouseover(e) {
  console.log("handleHotSpotMouseover function runs in index.js")
  var $currentHotSpot = $(e.currentTarget),
      currentIndex = $currentHotSpot.index(),
      $speechBubble = $('.speech-bubble'),
      title = hotSpots[currentIndex]['title'],
      description = hotSpots[currentIndex]['description'],
      hotSpotTop = $currentHotSpot.offset().top,
      hotSpotLeft = $currentHotSpot.offset().left,
      hotSpotHalfSize = $currentHotSpot.width() / 2,
      speechBubbleHalfSize = $speechBubble.width() / 2,
      topTarget = hotSpotTop - $speechBubble.height(),
      leftTarget = (hotSpotLeft - (speechBubbleHalfSize)) + hotSpotHalfSize;

  $speechBubble.empty();
  $speechBubble.append($('<h1>').text(title));
  $speechBubble.append($('<p>').text(description));

  $speechBubble.css({
    'top': topTarget - 20,
    'left': leftTarget,
    'display': 'block'
  }).stop().animate({
    opacity: 1
  }, 200);
}

function handleHotSpotMouseout(){
  var $speechBubble = $('.speech-bubble');
  $speechBubble.stop().animate({
    opacity: 0
  }, 200, function(){
    $speechBubble.hide();
  });
}

function positionHotSpots() {
  var windowWidth = $window.width(),
    windowHeight = $window.height(),
    windowAspectRatio = windowWidth / windowHeight,
    $hotSpot = $('.hot-spot');

  $hotSpot.each(function(index) {
    var xPos = hotSpots[index]['x'],
        yPos = hotSpots[index]['y'],
        desiredLeft = 0,
        desiredTop = 0;

    if (windowAspectRatio > imageAspectRatio) {
      yPos = (yPos / imageHeight) * 100;
      xPos = (xPos / imageWidth) * 100;
    } else {
      yPos = ((yPos / (windowAspectRatio / imageAspectRatio)) / imageHeight) * 100;
      xPos = ((xPos / (windowAspectRatio / imageAspectRatio)) / imageWidth) * 100;
    }

    $(this).css({
      'margin-top': yPos + '%',
      'margin-left': xPos + '%'
    });

  });
}

appendHotSpots();
appendSpeechBubble();
$(window).resize(positionHotSpots);
$('.hot-spot').on('mouseover', handleHotSpotMouseover);
$('.hot-spot').on('mouseout', handleHotSpotMouseout);
