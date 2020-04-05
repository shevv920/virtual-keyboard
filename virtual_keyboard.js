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
  lightOn: 'on',
};

const KEY_REPETITION_TIME = 250;
const TEXT_AREA_MAX_COLS = 78;

const keyDownSet = new Set();

const isCapsOn = () => document.querySelector(`.${cssClasses.capsIndicator}`).classList.contains(cssClasses.lightOn);

const defaultLang = 'en';
const saveLang = (lang) => window.localStorage.setItem('lang', lang);
const getLang = () => (window.localStorage.getItem('lang') ? window.localStorage.getItem('lang') : defaultLang);

const getCurrentLayout = () => Layouts[getLang()];

const createKeyTextElement = (values) => {
  const [val, altVal] = values;
  const textContent = val.toUpperCase();
  const textElement = document.createElement('div');
  const alternateContent = (altVal !== undefined && val.toUpperCase() !== altVal) ? `<sup>${altVal}</sup>` : '';
  textElement.innerHTML = textContent + alternateContent;
  return textElement;
};

const createKeyboardElements = () => {
  const kbElements = Object.entries(getCurrentLayout()).map((key) => {
    const [id, values] = key;
    const elem = document.createElement('div');
    elem.id = id;
    elem.classList.add(cssClasses.key);
    elem.style.gridArea = id;
    elem.append(createKeyTextElement(values));
    return elem;
  });
  return kbElements;
};

const createPageElements = (lang) => {
  const mainContainer = document.createElement('div');
  mainContainer.classList.add(cssClasses.wrapper);
  const textArea = document.createElement('textarea');
  textArea.classList.add(cssClasses.textArea);
  textArea.setAttribute('cols', TEXT_AREA_MAX_COLS);
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
  mainContainer.append(textArea, kbContainer, legend);
  return mainContainer;
};

const printCharacter = (textArea, char) => {
  const cursorPos = textArea.selectionEnd;
  const prevLine = textArea.value.lastIndexOf('\n', cursorPos);
  const maxCols = textArea.getAttribute('cols');
  if ((cursorPos - prevLine) > maxCols && textArea.selectionEnd - textArea.selectionStart === 0) {
    textArea.setRangeText('\n', textArea.selectionStart, textArea.selectionEnd, 'end');
  }
  textArea.setRangeText(char, textArea.selectionStart, textArea.selectionEnd, 'end');
  textArea.focus();
};

const deleteCharacter = (textArea, offset) => {
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

const moveCursorDown = () => {
  const textArea = document.querySelector(`.${cssClasses.textArea}`);
  let cursorPos = textArea.selectionEnd;
  const prevLine = textArea.value.lastIndexOf('\n', cursorPos);
  const nextLine = textArea.value.indexOf('\n', prevLine + 1);
  if (nextLine !== -1) {
    cursorPos -= prevLine;
    textArea.selectionStart = nextLine + cursorPos;
    textArea.selectionEnd = nextLine + cursorPos;
  }
  textArea.focus();
};

const moveCursorUp = () => {
  const textArea = document.querySelector(`.${cssClasses.textArea}`);
  let cursorPos = textArea.selectionEnd;
  const prevLine = textArea.value.lastIndexOf('\n', cursorPos);
  const secLine = textArea.value.lastIndexOf('\n', prevLine - 1);
  if (prevLine !== -1) {
    cursorPos -= prevLine;
    textArea.selectionStart = secLine + cursorPos;
    textArea.selectionEnd = secLine + cursorPos;
  }
  textArea.focus();
};

const switchLayout = () => {
  let lang = !getLang() ? defaultLang : getLang();
  lang = lang === 'en' ? 'ru' : 'en';
  saveLang(lang);
  const curLayout = getCurrentLayout();
  const kbKeysContainer = document.querySelector(`.${cssClasses.kbKeys}`);
  const keys = [...kbKeysContainer.children];
  keys.forEach((key) => {
    const values = curLayout[key.id];
    key.firstChild.remove();
    key.append(createKeyTextElement(values));
  });
};

const processKeyPressed = (key, code) => {
  const textArea = document.querySelector(`.${cssClasses.textArea}`);
  const currentLayout = getCurrentLayout();
  const shiftDown = keyDownSet.has('Shift');
  switch (code) {
    case 'Backspace':
      deleteCharacter(textArea, -1);
      break;
    case 'Enter':
      printCharacter(textArea, '\n');
      break;
    case 'Tab':
      for (let i = 0; i < 4; i += 1) {
        printCharacter(textArea, ' ');
      }
      break;
    case 'CapsLock':
      document.querySelector(`.${cssClasses.capsIndicator}`).classList.toggle(cssClasses.lightOn);
      break;
    case 'Delete':
      deleteCharacter(textArea, 1);
      break;
    case 'ArrowLeft':
      moveCursorHorizontally(-1, textArea);
      break;
    case 'ArrowRight':
      moveCursorHorizontally(1, textArea);
      break;
    case 'ArrowUp':
      moveCursorUp();
      break;
    case 'ArrowDown':
      moveCursorDown();
      break;
    case 'ShiftLeft':
    case 'ShiftRight':
    case 'AltLeft':
    case 'AltRight':
    case 'ControlLeft':
    case 'ControlRight':
    case 'WinLeft':
    case 'WinRight':
    case 'MetaLeft':
    case 'MetaRight':
      break;
    default: {
      const char = currentLayout[code][shiftDown ? 1 : 0];
      if ((isCapsOn() && shiftDown)) { // caps lock + shift = lower case
        printCharacter(textArea, char.toLowerCase());
      } else if (isCapsOn()) {
        printCharacter(textArea, char.toUpperCase());
      } else {
        printCharacter(textArea, char);
      }
      break;
    }
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
      }, KEY_REPETITION_TIME, key, code);
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
  if (event.currentTarget.classList.contains(cssClasses.key)) {
    addKeyDown(event.currentTarget.textContent, event.currentTarget.id);
  }
};

const onMouseUp = (event) => {
  event.preventDefault();
  if (event.currentTarget.classList.contains(cssClasses.keyPressed)) {
    addKeyUp(event.currentTarget.textContent, event.currentTarget.id);
  }
};

window.addEventListener('load', () => {
  const lang = getLang();
  const pageElements = createPageElements(lang);
  document.querySelector('body').appendChild(pageElements);
  document.querySelectorAll(`.${cssClasses.key}`).forEach((keyElement) => {
    keyElement.addEventListener('mousedown', onMouseDown);
    keyElement.addEventListener('mouseup', onMouseUp);
    keyElement.addEventListener('mouseout', onMouseUp);
  });
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
});
