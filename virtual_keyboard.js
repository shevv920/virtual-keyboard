import Layouts from './layouts.js';

const cssClasses = {
  wrapper: 'wrapper',
  kbContainer: 'keyboard_container',
  kbKeys: 'keyboard_keys',
  textArea: 'textarea',
  key: 'key',
  keySpecial: 'key-special',
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
    if (value[1] === undefined) elem.classList.add(cssClasses.keySpecial);
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
  legend.append(document.createTextNode('Ctrl+Shift - change layout'));
  const legendRu = document.createElement('div');
  legendRu.append(document.createTextNode('Ctrl+Shift - смена раскладки'));
  mainContainer.append(textArea, kbContainer, legend, legendRu);
  return mainContainer;
};

const printSymbol = (textArea, char) => {
  textArea.setRangeText(char, textArea.selectionStart, textArea.selectionEnd, 'end');
  textArea.focus();
};

const deleteSymbol = (textArea, offset) => {
  if (textArea.selectionStart === textArea.selectionEnd) {
    const start = Math.min(textArea.selectionStart, Math.max(0, textArea.selectionStart + offset));
    const end = Math.max(textArea.selectionEnd, textArea.selectionEnd + offset);
    textArea.setRangeText('', start, end, 'end');
  } else {
    textArea.setRangeText('', textArea.selectionStart, textArea.selectionEnd, 'end');
  }
  textArea.focus();
};

const moveCursorHorizontally = (n, textArea) => {
  textArea.setSelectionRange(Math.max(0, textArea.selectionEnd + n),
    Math.max(0, textArea.selectionEnd + n));
  textArea.focus();
};

const moveCursorUp = (textArea) => {
  const cursorPos = textArea.selectionEnd;
  const textBefore = textArea.value.substring(0, cursorPos);
  if (textBefore.lastIndexOf('\n') > 0) {
    textArea.setSelectionRange(textBefore.lastIndexOf('\n'), textBefore.lastIndexOf('\n'));
  }
  textArea.focus();
};

const moveCursorDown = (textArea) => {
  const cursorPos = textArea.selectionEnd;
  const textAfter = textArea.value.substring(cursorPos);
  if (textAfter.indexOf('\n') >= 0) {
    textArea.setSelectionRange(cursorPos + textAfter.indexOf('\n') + 1, cursorPos + textAfter.indexOf('\n') + 1);
  }
  textArea.focus();
};

const switchLayout = () => {
  let lang = !getLang() ? defaultLang : getLang();
  lang = lang === 'en' ? 'ru' : 'en';
  saveLang(lang);
  const curLayout = getCurrentLayout(getLang());
  const kbKeysContainer = document.querySelector(`.${cssClasses.kbKeys}`);
  const keys = [...kbKeysContainer.children];
  keys.forEach((key) => {
    const keyVal = curLayout[key.id];
    const textNode = document.createTextNode(keyVal[0].toUpperCase());
    key.firstChild.remove();
    key.append(textNode);
  });
};

const processKeyPressed = (key, code) => {
  const textArea = document.querySelector(`.${cssClasses.textArea}`);
  const currentLayout = getCurrentLayout(getLang());
  const shiftDown = keyDownSet.has('Shift');
  switch (code) {
    case 'Backspace':
      deleteSymbol(textArea, -1);
      break;
    case 'Enter':
      printSymbol(textArea, '\n');
      break;
    case 'Tab':
      printSymbol(textArea, '\t');
      break;
    case 'CapsLock':
      document.querySelector(`.${cssClasses.capsIndicator}`).classList.toggle(cssClasses.on);
      break;
    case 'Delete':
      deleteSymbol(textArea, 1);
      break;
    case 'ArrowLeft':
      moveCursorHorizontally(-1, textArea);
      break;
    case 'ArrowRight':
      moveCursorHorizontally(1, textArea);
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
      printSymbol(textArea, currentLayout[code][shiftDown ? 1 : 0]);
      break;
  }
};

const addKeyDown = (key, code) => {
  const keyElement = document.querySelector(`#${code}`);
  if (keyElement) {
    keyDownSet.add(key);
    keyElement.classList.add(cssClasses.keyPressed);
    if (!keyElement.classList.contains(cssClasses.keySpecial)) {
      setTimeout((k, c) => {
        if (keyDownSet.has(k)) {
          processKeyPressed(k, c);
        }
      }, 250, key, code);
    }
    if (keyDownSet.has('Shift') && keyDownSet.has('Control')) switchLayout();
  }
};

const addKeyUp = (key, code) => {
  const keyElement = document.querySelector(`#${code}`);
  if (keyElement) {
    keyDownSet.delete(key);
    keyElement.classList.remove(cssClasses.keyPressed);
    processKeyPressed(key, code);
  }
};

const onKeyDown = (event) => {
  event.preventDefault();
  addKeyDown(event.key, event.code);
};

const onKeyUp = (event) => {
  event.preventDefault();
  addKeyUp(event.key, event.code);
};

const onMouseDown = (event) => {
  event.preventDefault();
  if (event.target.classList.contains(cssClasses.key)) {
    addKeyDown(event.target.textContent, event.target.id);
  }
};

const onMouseUp = (event) => {
  event.preventDefault();
  if (event.target.classList.contains(cssClasses.key)
    && event.target.classList.contains(cssClasses.keyPressed)) {
    addKeyUp(event.target.textContent, event.target.id);
  }
};

window.addEventListener('load', () => {
  const lang = getLang();
  const pageElements = createPageElements(lang);
  document.querySelector('body').appendChild(pageElements);
  document.querySelector(`.${cssClasses.kbKeys}`).addEventListener('mousedown', onMouseDown);
  document.querySelector(`.${cssClasses.kbKeys}`).addEventListener('mouseup', onMouseUp);
  document.querySelector(`.${cssClasses.kbKeys}`).addEventListener('mouseout', onMouseUp);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
});
