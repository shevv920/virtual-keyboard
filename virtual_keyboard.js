import Layouts from './layouts.js';

const cssClasses = {
  wrapper: 'wrapper',
  kbContainer: 'keyboard_container',
  textArea: 'textarea',
  key: 'key',
  specialKey: 'special_key',
  commonKey: 'common_key',
  keyPressed: 'key_pressed',
  capsIndicator: 'caps_indicator',
  on: 'on',
};

const defaultLang = 'en';
const saveLang = (lang) => window.localStorage.setItem('lang', lang);
const getLang = () => (window.localStorage.getItem('lang') ? window.localStorage.getItem('lang') : defaultLang);

const getCurrentLayout = (lang) => (lang !== null ? Layouts[lang] : Layouts[defaultLang]);

const createKeyboardElements = (lang) => {
  const kbElements = Object.entries(getCurrentLayout(lang)).map((key) => {
    const [id, value] = key;
    const elem = document.createElement('span');
    elem.id = id.toLowerCase();
    elem.innerHTML = value;
    elem.classList.add(cssClasses.key);
    elem.style.gridArea = id;
    return elem;
  });
  return kbElements;
};

const createPageElements = (lang) => {
  const mainContainer = document.createElement('div');
  mainContainer.classList.add(cssClasses.wrapper);
  const textArea = document.createElement('textarea');
  textArea.classList.add(cssClasses.textArea);
  const kbContainer = document.createElement('div');
  kbContainer.classList.add(cssClasses.kbContainer);
  const kbElements = createKeyboardElements(lang);
  kbContainer.append(...kbElements);
  mainContainer.append(textArea, kbContainer);
  return mainContainer;
};

const printSymbol = (keyCode) => {
  const textArea = document.querySelector(`.${cssClasses.textArea}`);
  const char = getCurrentLayout(getLang())[keyCode];
  textArea.textContent += char;
  textArea.setSelectionRange(textArea.textContent.length + 1, textArea.textContent.length + 1);
};

const moveCursorLeft = (textArea) => {
  if (textArea.selectionEnd) {
    textArea.setSelectionRange(textArea.selectionEnd - 1, textArea.selectionEnd - 1);
  }
};

const moveCursorRight = (textArea) => {
  textArea.setSelectionRange(textArea.selectionEnd + 1, textArea.selectionEnd + 1);
};

const moveCursorUp = (textArea) => {

};

const moveCursorDown = (textArea) => {

};

const switchLayout = () => {
  let lang = !getLang() ? defaultLang : getLang();
  lang = lang === 'en' ? 'ru' : 'en';
  saveLang(lang);
  const kbElements = createKeyboardElements(getLang());
  const kbContainer = document.querySelector(`.${cssClasses.kbContainer}`);
  kbContainer.innerHTML = '';
  kbContainer.append(...kbElements);
};

const processKeyPressed = (key, keyCode) => {
  const textArea = document.querySelector(`.${cssClasses.textArea}`);
  const text = textArea.textContent;
  switch (keyCode) {
    case 'Backspace':
      textArea.textContent = text.substring(0, text.length - 1);
      textArea.setSelectionRange(text.length, text.length);
      break;
    case 'Enter':
      printSymbol('\r\n');
      break;
    case 'Tab':
      printSymbol('\t');
      break;
    case 'CapsLock':
      switchLayout();
      break;
    case 'Delete':
      if (textArea.selectionEnd < text.length) {
        const temp = textArea.selectionEnd;
        textArea.textContent = text.substring(0, text.length - 1);
        textArea.setSelectionRange(temp, temp);
      }
      break;
    case 'ArrowLeft':
      moveCursorLeft(textArea);
      break;
    case 'ArrowRight':
      moveCursorRight(textArea);
      break;
    case 'ArrowUp':
      moveCursorUp(textArea);
      break;
    case 'ArrowDown':
      moveCursorDown(textArea);
      break;
    case 'ShiftLeft':
    case 'ShiftRight':
    case 'AltLeft':
    case 'AltRight':
    case 'ControlLeft':
    case 'ControlRight':
      break;
    default:
      printSymbol(keyCode);
      textArea.focus();
      break;
  }
};

const onKeyDown = (event) => {
  event.preventDefault();
  const keyElement = document.querySelector(`#${event.code.toLowerCase()}`);
  if (keyElement) keyElement.classList.add(cssClasses.keyPressed);
};

const onKeyUp = (event) => {
  event.preventDefault();
  const keyElement = document.querySelector(`#${event.code.toLowerCase()}`);
  if (keyElement) {
    keyElement.classList.remove(cssClasses.keyPressed);
    processKeyPressed(event.key, event.code);
  }
};

window.addEventListener('load', () => {
  const lang = getLang();
  const pageElements = createPageElements(lang);
  document.querySelector('body').appendChild(pageElements);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
});
