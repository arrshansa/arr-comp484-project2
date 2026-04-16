/* 
   Rocky the Eridian - Giga Friend
   COMP 484 Project 2
   Rocky is a character from Andy Weir's "Project Hail Mary".
   He is a five-legged rock-armored alien who communicates through
   musical notes/tones. This Giga Friend lets you keep him happy. */

// Friend DATA
// Friend_info object with the four required keys plus "trust" for the new
// Science! button. Initial values are set so the Friend starts in a healthy,
// happy state.
var Friend_info = {
  name: "Rocky",
  weight: 45, // kilograms (Rocky is a dense little alien)
  happiness: 50, // musical notes per minute
  trust: 30, // extra stat driven by the new Science! button
};

// Rocky-themed speech lines that match the style from the book.
// Each action has a pool of possible phrases so comments feel varied.
var speechLines = {
  treat: [
    "Yum yum! Food, good.",
    "Ammonia! Best food!",
    "Thank you, friend.",
    "Stomach happy, question? Yes!",
  ],
  play: [
    "Music together! Good!",
    "Amaze! Amaze! Amaze!",
    "Note, note, chord!",
    "Friend play with Rocky. Happy.",
  ],
  chat: [
    "It is time go",
    "Rocky hate mark",
    "Fist my bump",
    "How do you know when the hug is done?",
    "Usually you not stupid. Why stupid, question?",
  ],
  science: [
    "SCIENCE! Best thing!",
    "Hypothesis, then test, then learn!",
    "Brain happy. Discover new thing!",
    "Grace and Rocky. Save the stars!",
  ],
  sad: [
    "Sad, sad. Friend help?",
    "Not feel good.",
    "Need attention, question?",
  ],
  tooFat: ["Too much food. Belly big.", "Cannot move. Heavy."],
  tooSkinny: ["Hungry. Need food, please.", "Thin. Weak. Food, question?"],
};

// DOCUMENT READY
// $(function() {...}) is shorthand for $(document).ready(...).
// It waits until the DOM is fully parsed before running code so
// that all the .name, .weight, .button elements actually exist.
$(function () {
  // Render the starting stats into the HTML.
  checkAndUpdateFriendInfoInHtml();

  // Wire each button to its handler. The handler functions are defined
  // below. Using named handlers (instead of anonymous functions) keeps
  // the code readable and reusable.
  $(".treat-button").click(clickedTreatButton);
  $(".play-button").click(clickedPlayButton);
  $(".chat-button").click(clickedchatButton);
  $(".science-button").click(clickedScienceButton);

  // Tone.js needs a user gesture to start its AudioContext (browser
  // autoplay policy). We flip a flag on the first button click inside
  // playChord(), so no separate document-level handler is required.

  // Initial idle animation on Rocky
  startIdleWobble();
});

// BUTTON HANDLERS
function clickedTreatButton() {
  // Treat: +happiness, +weight
  Friend_info.happiness += 8;
  Friend_info.weight += 3;
  playChord(["C4", "E4", "G4"]); // happy major chord
  animateRocky("bounce");
  showSpeech(randomLine(speechLines.treat));
  checkAndUpdateFriendInfoInHtml();
}

function clickedPlayButton() {
  // Play: +happiness, -weight
  Friend_info.happiness += 10;
  Friend_info.weight -= 2;
  playChord(["E4", "G4", "B4"]); // bright minor-7 feel
  animateRocky("wiggle");
  showSpeech(randomLine(speechLines.play));
  checkAndUpdateFriendInfoInHtml();
}

function clickedchatButton() {
  // chat: -happiness, -weight
  Friend_info.happiness -= 5;
  Friend_info.weight -= 4;
  playChord(["A3", "C4", "E4"]); // determined minor chord
  animateRocky("shake");
  showSpeech(randomLine(speechLines.chat));
  checkAndUpdateFriendInfoInHtml();
}

// NEW BEHAVIOR tied to the new Science! button.
// Doing science with Rocky boosts both happiness AND trust, and
// has a very small weight cost (science burns some calories).
function clickedScienceButton() {
  Friend_info.happiness += 12;
  Friend_info.trust += 6;
  Friend_info.weight -= 1;
  playChord(["D4", "F#4", "A4", "C5"]); // four-note discovery chord
  animateRocky("spin");
  showSpeech(randomLine(speechLines.science));
  checkAndUpdateFriendInfoInHtml();
}

// UPDATE + GUARD LOGIC
function checkAndUpdateFriendInfoInHtml() {
  checkWeightAndHappinessBeforeUpdating();
  updateFriendInfoInHtml();
  updateMood();
}

// Prevents any stat from dropping below 0. Also caps trust at 100
// and happiness at a reasonable ceiling. Uses plain if-conditionals
// as the spec suggests.
function checkWeightAndHappinessBeforeUpdating() {
  if (Friend_info.weight < 0) Friend_info.weight = 0;
  if (Friend_info.happiness < 0) Friend_info.happiness = 0;
  if (Friend_info.trust < 0) Friend_info.trust = 0;
  if (Friend_info.trust > 100) Friend_info.trust = 100;
  if (Friend_info.happiness > 100) Friend_info.happiness = 100;
  if (Friend_info.weight > 100) Friend_info.weight = 100;
}

// Write current values back into the HTML spans.
function updateFriendInfoInHtml() {
  $(".name").text(Friend_info["name"]);
  $(".weight").text(Friend_info["weight"]);
  $(".happiness").text(Friend_info["happiness"]);
  $(".trust").text(Friend_info["trust"]);
}

// MOOD STATES
// Rocky's mood is derived from his stats. This drives both the
// displayed mood label, the background color of his "room", and
// occasional sad comments when things go badly.
function updateMood() {
  var mood;
  var bodyClass;

  if (
    Friend_info.happiness >= 70 &&
    Friend_info.weight >= 20 &&
    Friend_info.weight <= 70
  ) {
    mood = "ecstatic";
    bodyClass = "mood-ecstatic";
  } else if (Friend_info.happiness >= 40) {
    mood = "content";
    bodyClass = "mood-content";
  } else if (Friend_info.happiness >= 20) {
    mood = "grumpy";
    bodyClass = "mood-grumpy";
    // Occasionally Rocky complains on his own
    if (Math.random() < 0.35) showSpeech(randomLine(speechLines.sad));
  } else {
    mood = "miserable";
    bodyClass = "mood-miserable";
    if (Math.random() < 0.5) showSpeech(randomLine(speechLines.sad));
  }

  // Extra mood flavor for weight extremes
  if (Friend_info.weight > 80 && Math.random() < 0.3) {
    showSpeech(randomLine(speechLines.tooFat));
  } else if (Friend_info.weight < 15 && Math.random() < 0.3) {
    showSpeech(randomLine(speechLines.tooSkinny));
  }

  $(".mood").text(mood);
  // Swap the body class so CSS can react (background tint, etc.)
  $("body")
    .removeClass("mood-ecstatic mood-content mood-grumpy mood-miserable")
    .addClass(bodyClass);
}

// SPEECH BUBBLE (visual notification per required feature)
// Shows Rocky's comment in a speech bubble AND speaks it out loud via
// the browser's speech synthesis. No console.log / alert.
function showSpeech(message) {
  var $bubble = $(".speech-bubble");
  var $text = $(".speech-text");

  // Speak the message out loud in Rocky's alien-sounding voice.
  speakAsRocky(message);

  //
  // UNIQUE jQUERY METHOD #2: .fadeTo() with a callback
  // https://api.jquery.com/fadeTo/
  //
  // .fadeTo(duration, opacity, callback) animates the element's
  // opacity to a specific target value (unlike .fadeIn/.fadeOut
  // which go all the way to 1 or 0). The callback runs after the
  // animation finishes. We use it to chain: fade out fully, swap
  // the text while invisible, fade back in to full opacity, wait,
  // then fade partially down so old messages don't linger harshly.
  // This gives a smoother, more polished feel than a simple .text()
  // swap or a plain .fadeIn/.fadeOut pair would provide.
  $bubble
    .stop(true, true) // cancel any in-flight animation
    .fadeTo(120, 0, function () {
      // fade to opacity 0, then:
      $text.text(message); // swap the text while hidden
      $bubble.fadeTo(180, 1); // fade back up to opacity 1
    });

  // After a short display window, dim the bubble so it fades into
  // the background rather than disappearing abruptly.
  setTimeout(function () {
    $bubble.fadeTo(600, 0.35);
  }, 2400);
}

// ANIMATIONS
// Adds a CSS animation class to Rocky, then removes it after the
// animation ends so it can be re-triggered on the next click.
function animateRocky(kind) {
  var $rocky = $(".rocky");
  $rocky.removeClass("anim-bounce anim-wiggle anim-shake anim-spin");
  // Force reflow so the class removal is registered before re-adding.
  $rocky[0].offsetWidth;
  $rocky.addClass("anim-" + kind);

  //
  // UNIQUE jQUERY METHOD #1: .each()
  // https://api.jquery.com/each/
  //
  // .each(function(index, element)) iterates over every element in
  // a jQuery collection and runs the callback once per element. The
  // callback receives the element's zero-based index and the raw DOM
  // element — inside the callback, `this` also refers to the element.
  //
  // We use it here to stagger the three floating music-note elements
  // (.note-1, .note-2, .note-3). A plain .addClass('note-fly') on all
  // of them would start every note's animation at the exact same
  // moment. Instead, for each note we:
  //   1. Remove the old animation class (reset the animation state)
  //   2. Force a reflow so the browser registers the reset
  //   3. Set a per-note animation-delay using the index, so note 0
  //      starts immediately, note 1 is slightly delayed, note 2 more
  //   4. Re-add the class so the staggered animation plays
  // This produces a nicer cascading "chord" effect of musical notes
  // floating up from Rocky — matching how he communicates in the book.
  $(".note").each(function (index, element) {
    var $note = $(element);
    $note.removeClass("note-fly");
    element.offsetWidth; // reflow per element
    $note.css("animation-delay", index * 0.12 + "s");
    $note.addClass("note-fly");
  });
}

// Gentle idle wobble so Rocky feels alive even when you're not clicking.
function startIdleWobble() {
  $(".rocky").addClass("idle");
}

// =============================================================
// SOUND (Tone.js) + SPEECH (Web Speech API)
// =============================================================
// Rocky communicates through musical notes in the book, so each
// action plays a short chord. On top of that we use the browser's
// built-in speechSynthesis API to have Rocky actually say his line
// out loud, with a low pitch and slower rate to sound alien/gravelly.

// Build a synth once and reuse it. PolySynth lets us play chords
// (multiple notes at the same time) which fits Rocky's musical speech.
var synth = null;
var audioStarted = false;

function getSynth() {
  if (!synth && typeof Tone !== "undefined") {
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.6 },
    }).toDestination();
    synth.volume.value = -8; // softer
  }
  return synth;
}

function playChord(notes) {
  // Browsers block audio until a user gesture. Because playChord is
  // only called from click handlers, we're guaranteed to be inside a
  // user gesture here, so it's the right moment to start Tone.
  if (!audioStarted && typeof Tone !== "undefined") {
    Tone.start();
    audioStarted = true;
  }
  var s = getSynth();
  if (!s) return;
  try {
    s.triggerAttackRelease(notes, "8n");
  } catch (e) {
    // Silently ignore audio errors - game should still work without sound
  }
}

// Cache the chosen voice so we don't re-pick it on every call.
var rockyVoice = null;

// Pick the best available voice for Rocky. We want a MALE voice, so the
// selection logic:
//   1. Tries a prioritized list of known male voice names first
//   2. Falls back to any voice whose name contains "male" but not "female"
//   3. Skips known female voice names entirely
//   4. As a last resort, picks any English voice
function pickRockyVoice() {
  if (!("speechSynthesis" in window)) return null;
  var voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  // Known female voice names to always skip (macOS + common web voices)
  var femaleNames = [
    "samantha",
    "victoria",
    "karen",
    "moira",
    "tessa",
    "fiona",
    "veena",
    "kate",
    "serena",
    "susan",
    "allison",
    "ava",
    "zoe",
    "nora",
    "amelie",
    "anna",
    "paulina",
    "alva",
    "satu",
    "sara",
    "female",
    "woman",
  ];

  function isFemale(v) {
    var n = (v.name || "").toLowerCase();
    for (var i = 0; i < femaleNames.length; i++) {
      if (n.indexOf(femaleNames[i]) !== -1) return true;
    }
    return false;
  }

  // Priority 1: exact known male voices
  var preferred = [
    "Daniel", // macOS - British male
    "Fred", // macOS - deeper male, classic
    "Alex", // macOS - male
    "Aaron", // macOS - male
    "Tom", // macOS - male
    "Oliver", // macOS - British male
    "Lee", // macOS - Australian male
    "Rishi", // macOS - Indian English male
    "Google UK English Male",
    "Google US English Male",
    "Microsoft David",
    "Microsoft Mark",
    "Microsoft George",
  ];
  for (var i = 0; i < preferred.length; i++) {
    for (var j = 0; j < voices.length; j++) {
      if (voices[j].name.indexOf(preferred[i]) !== -1) return voices[j];
    }
  }

  // Priority 2: any voice with "male" (but not "female") in the name
  for (var k = 0; k < voices.length; k++) {
    var nm = voices[k].name.toLowerCase();
    if (nm.indexOf("male") !== -1 && nm.indexOf("female") === -1) {
      return voices[k];
    }
  }

  // Priority 3: any English voice that is NOT on the female list
  for (var m = 0; m < voices.length; m++) {
    if (
      voices[m].lang &&
      voices[m].lang.indexOf("en") === 0 &&
      !isFemale(voices[m])
    ) {
      return voices[m];
    }
  }

  // Last resort: first non-female voice of any language
  for (var n = 0; n < voices.length; n++) {
    if (!isFemale(voices[n])) return voices[n];
  }
  return voices[0];
}

// Voices load asynchronously in some browsers (notably Chrome), so we
// also listen for the voiceschanged event to refresh our pick once they
// become available.
if ("speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = function () {
    rockyVoice = pickRockyVoice();
  };
}

function speakAsRocky(message) {
  if (!("speechSynthesis" in window)) {
    console.warn("[Rocky] speechSynthesis not supported in this browser");
    return;
  }

  if (!rockyVoice) rockyVoice = pickRockyVoice();

  // Expose the picked voice on window for easy debugging — open the
  // browser console and type: window.rockyVoiceName
  window.rockyVoiceName = rockyVoice ? rockyVoice.name : "(default)";
  console.log(
    "[Rocky] speaking:",
    JSON.stringify(message),
    "| voice:",
    window.rockyVoiceName
  );

  var utterance = new SpeechSynthesisUtterance(message);
  if (rockyVoice) utterance.voice = rockyVoice;
  utterance.pitch = 0.7; // lower = alien / gravelly (range 0-2, default 1)
  utterance.rate = 0.9; // slightly slower than normal
  utterance.volume = 1.0;

  // Event hooks so we can see exactly what the browser does with the
  // utterance. If you see "error" or "cancel" in the console, the
  // system is rejecting the voice or the utterance was interrupted.
  utterance.onstart = function () {
    console.log("[Rocky] onstart");
  };
  utterance.onend = function () {
    console.log("[Rocky] onend");
  };
  utterance.onerror = function (e) {
    console.error("[Rocky] onerror:", e.error);
  };

  // Known Chrome/Safari bug: calling cancel() immediately followed by
  // speak() can silently swallow the new utterance. So cancel first,
  // then schedule the speak on the next tick so cancel fully completes.
  var doSpeak = function () {
    window.speechSynthesis.speak(utterance);
  };

  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
    window.speechSynthesis.cancel();
    setTimeout(doSpeak, 100);
  } else {
    doSpeak();
  }
}

// HELPERS
function randomLine(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
