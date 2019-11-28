export function clearSearchResult() {
  document.querySelector('#search-result-heading').hidden = true;
  document.querySelector('#search-result-list').innerHTML = '';
}

export function closeMenu() {
  const closeMenuBtn = document.querySelector('.close-canvas-menu');
  closeMenuBtn.click();
}

export function cleanMessageBoard() {
  const board = document.getElementById('message-board');
  board.innerHTML = '';
}
