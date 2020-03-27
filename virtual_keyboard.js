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

const getState = () => window.localStorage.getItem('state');

const createElements = (state) => {
  const mainContainer = document.createElement('div');
  mainContainer.classList.add(cssClasses.wrapper);
  const textArea = document.createElement('textarea');
  textArea.classList.add(cssClasses.textArea);
  const capsIndicator = document.createElement('div');
  capsIndicator.classList.add(cssClasses.capsIndicator, cssClasses.off);
  const kbContainer = document.createElement('div');
  kbContainer.classList.add(cssClasses.kbContainer);
  const currentLayout = state !== null ? Layouts[state.layout] : Layouts.en;
  const kbElements = Object.entries(currentLayout).map((key) => {
    const [id, value] = key;
    const elem = document.createElement('span');
    elem.id = id.toLowerCase();
    elem.innerHTML = value;
    elem.classList.add(cssClasses.key);
    elem.style.gridArea = id;
    return elem;
  });
  kbContainer.append(...kbElements, capsIndicator);
  mainContainer.append(textArea, kbContainer);
  return mainContainer;
};

const printSymbol = (char) => {
  const textArea = document.querySelector(`.${cssClasses.textArea}`);
  textArea.textContent += char;
  textArea.selectionStart = textArea.textContent.length + 1;
  textArea.selectionEnd = textArea.textContent.length + 1;
};

const processKeyPressed = (key, keyCode) => {
  const textArea = document.querySelector(`.${cssClasses.textArea}`);

  switch (keyCode) {
    case 'Backspace':
      textArea.textContent = textArea.textContent.substring(0, textArea.textContent.length - 1);
      textArea.selectionStart = textArea.textContent.length;
      textArea.selectionEnd = textArea.textContent.length;
      break;
    case 'Enter':
      printSymbol('\r\n');
      break;
    case 'Tab':
      printSymbol('\t');
      break;
    case 'CapsLock':
      document.querySelector(`.${cssClasses.capsIndicator}`).classList.toggle(cssClasses.on);
      break;
    case 'ShiftLeft':
    case 'ShiftRight':
      break;
    default:
      printSymbol(key);
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
  const state = getState();
  const keyboardLayout = createElements(state);
  document.querySelector('body').appendChild(keyboardLayout);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
});
