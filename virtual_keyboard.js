import Layouts from './layouts.js';

const cssClasses = {
  wrapper: 'wrapper',
  kbContainer: 'keyboard_container',
  kbKeys: 'keyboard_keys',
  textArea: 'textarea',
  key: 'key',
  specialKey: 'special_key',
  commonKey: 'common_key',
  keyPressed: 'key_pressed',
  capsIndicator: 'caps_indicator',
  on: 'on',
};

const keyDownSet = new Set();

const defaultLang = 'en';
const saveLang = (lang) => window.localStorage.setItem('lang', lang);
const getLang = () => (window.localStorage.getItem('lang') ? window.localStorage.getItem('lang') : defaultLang);

const getCurrentLayout = (lang) => (lang !== null ? Layouts[lang] : Layouts[defaultLang]);

const createKeyboardElements = (lang) => {
  const kbElements = Object.entries(getCurrentLayout(lang)).map((key) => {
    const [id, value] = key;
    const elem = document.createElement('span');
    elem.id = id;
    elem.innerHTML = value[0].toUpperCase();
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
  const capsIndicator = document.createElement('div');
  capsIndicator.classList.add(cssClasses.capsIndicator);
  kbContainer.append(capsIndicator);
  const kbKeys = document.createElement('div');
  kbKeys.classList.add(cssClasses.kbKeys);
  const kbElements = createKeyboardElements(lang);
  kbKeys.append(...kbElements);
  kbContainer.append(kbKeys);
  const legend = document.createElement('div');
  legend.append(document.createTextNode('Caps Lock - change layout'));
  const legendRu = document.createElement('div');
  legendRu.append(document.createTextNode('Caps Lock - смена раскладки'));
  mainContainer.append(textArea, kbContainer, legend, legendRu);
  return mainContainer;
};

const printSymbol = (textArea, char) => {
  textArea.setRangeText(char, textArea.selectionStart, textArea.selectionEnd, 'end');
  textArea.focus();
};

const moveCursorLeft = (textArea) => {
  if (textArea.selectionEnd) {
    textArea.setSelectionRange(textArea.selectionEnd - 1, textArea.selectionEnd - 1);
  }
};

const moveCursorRight = (textArea) => {
  textArea.setSelectionRange(textArea.selectionEnd + 1, textArea.selectionEnd + 1);
};

const switchLayout = () => {
  let lang = !getLang() ? defaultLang : getLang();
  lang = lang === 'en' ? 'ru' : 'en';
  saveLang(lang);
  const kbElements = createKeyboardElements(getLang());
  const kbKeys = document.querySelector(`.${cssClasses.kbKeys}`);
  kbKeys.innerHTML = '';
  kbKeys.append(...kbElements);
};

const processKeyPressed = (key, code) => {
  const textArea = document.querySelector(`.${cssClasses.textArea}`);
  const text = textArea.textContent;
  const currentLayout = getCurrentLayout(getLang());
  const shiftDown = keyDownSet.has('Shift');
  switch (code) {
    case 'Backspace':
      textArea.textContent = text.substring(0, text.length - 1);
      textArea.setSelectionRange(text.length, text.length);
      break;
    case 'Enter':
      printSymbol('\n');
      break;
    case 'Tab':
      printSymbol('\t');
      break;
    case 'CapsLock':
      document.querySelector(`.${cssClasses.capsIndicator}`).classList.toggle(cssClasses.on);
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
    case 'ArrowDown':
      break;
    case 'ShiftLeft':
    case 'ShiftRight':
    case 'AltLeft':
    case 'AltRight':
    case 'ControlLeft':
    case 'ControlRight':
      break;
    default:
      printSymbol(textArea, currentLayout[code][shiftDown ? 1 : 0]);
      break;
  }
};

const onKeyDown = (event) => {
  event.preventDefault();
  const keyElement = document.querySelector(`#${event.code}`);
  if (keyElement) {
    keyDownSet.add(event.key);
    keyElement.classList.add(cssClasses.keyPressed);
  }
};

const onKeyUp = (event) => {
  event.preventDefault();
  const keyElement = document.querySelector(`#${event.code}`);
  if (keyElement) {
    keyDownSet.delete(event.key);
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
