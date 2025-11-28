import {
  pronouns,
  connectives,
  substantives,
  verbs,
  adjectives,
} from "./data.js";

function getFormattedCurrentDateTime() {
  const formatter = new Intl.DateTimeFormat(navigator.language, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return formatter.format(new Date());
}

function getSeedForDay() {
  const today = new Date();
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth() + 1; // 0-11 -> 1-12
  const day = today.getUTCDate();

  const dateStr = `${year}${month < 10 ? "0" : ""}${month}${
    day < 10 ? "0" : ""
  }${day}`;

  return parseInt(dateStr, 10);
}

function getDeterministicDictionaryWords(dictionary, count, seed, offset = 0) {
  const words = [];
  const startIndex = (seed + offset) % dictionary.length;
  for (let i = 0; i < count; i++) {
    const index = (startIndex + i) % dictionary.length;
    words.push(dictionary[index]);
  }
  return words;
}

export const fetchSavedWords = () => {
  const savedWords = localStorage.getItem("savedWords");
  const currentDay = getFormattedCurrentDateTime().split(",")[0];

  if (savedWords) {
    const data = JSON.parse(savedWords);
    const savedDay = data.createdAt;
    if (savedDay !== currentDay) {
      localStorage.removeItem("savedWords");
      window.location.reload();
    }
    return data;
  }

  const seed = getSeedForDay();

  const maxWords = 5;

  const words = {
    verbs: getDeterministicDictionaryWords(verbs, maxWords, seed, 1),
    pronouns: getDeterministicDictionaryWords(pronouns, maxWords, seed, 2),
    adjectives: getDeterministicDictionaryWords(adjectives, maxWords, seed, 3),
    connectives: getDeterministicDictionaryWords(
      connectives,
      maxWords,
      seed,
      4
    ),
    substantives: getDeterministicDictionaryWords(
      substantives,
      maxWords,
      seed,
      5
    ),
    createdAt: currentDay,
  };

  localStorage.setItem("savedWords", JSON.stringify(words));
  return words;
};

function displayWords(list, id) {
  const ul = document.getElementById(id);
  list.forEach((word) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${word.english}</strong> - ${word.portuguese}`;
    ul.appendChild(li);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const words = fetchSavedWords();

  displayWords(words.pronouns, "pronouns-list");
  displayWords(words.verbs, "verbs-list");
  displayWords(words.substantives, "substantives-list");
  displayWords(words.adjectives, "adjectives-list");
  displayWords(words.connectives, "connectives-list");

  document.querySelector(".clock").textContent = getFormattedCurrentDateTime();

  setInterval(() => {
    document.querySelector(".clock").textContent =
      getFormattedCurrentDateTime();
  }, 1000);
});

// -- Sentences -- //
function generateSentence(words) {
  const randomElement = (array) =>
    array[Math.floor(Math.random() * array.length)];
  let sentence;
  do {
    const pronoun1 = randomElement(words.pronouns).english;
    const verb1 = randomElement(words.verbs).english;
    const adjective = randomElement(words.adjectives).english;
    const noun1 = randomElement(words.substantives).english;
    const connective = randomElement(words.connectives).english;
    const pronoun2 = randomElement(words.pronouns).english;
    const verb2 = randomElement(words.verbs).english;
    const noun2 = randomElement(words.substantives).english;

    sentence = `${pronoun1} ${verb1} ${adjective} ${noun1} ${connective} ${pronoun2} ${verb2} ${noun2}.`;
  } while (!validateSentence(sentence, words));
  return sentence;
}

function validateSentence(sentence, words) {
  const tokens = sentence.replace(/\./g, "").split(" ");
  if (tokens.length !== 8) {
    return false;
  }
  const expectedCategories = [
    { list: words.pronouns, label: "pronoun" },
    { list: words.verbs, label: "verb" },
    { list: words.adjectives, label: "adjective" },
    { list: words.substantives, label: "noun" },
    { list: words.connectives, label: "connective" },
    { list: words.pronouns, label: "pronoun" },
    { list: words.verbs, label: "verb" },
    { list: words.substantives, label: "noun" },
  ];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i].toLowerCase();
    const isValid = expectedCategories[i].list.some(
      (word) => word.english.toLowerCase() === token
    );
    if (!isValid) {
      return false;
    }
  }
  return true;
}
// -- Sentences -- //
