const optionSelector = document.getElementById( 'option-selector-input' );
const clearButton = document.getElementById( 'clear-button' );
const goButton = document.getElementById( 'go-button' );

function handleInput() {
  if ( !optionSelector.value ) {
    clearButton.disabled = true;
    goButton.disabled = true;
  }
  else {
    clearButton.disabled = false;
    goButton.disabled = false;
  }
}

function handleGo() {
  let addSlash = ( location.href.charAt( location.href.length - 1 ) != '/' ? '/' : '' );
  let optionId = Array.from( document.querySelectorAll( 'option' ) ).find( opt => opt.value === optionSelector.value ).attributes.data.value;
  location.href += addSlash + optionId;
}

function handleClear() {
  optionSelector.value = '';
  clearButton.disabled = true;
  goButton.disabled = true;
  goButton.onclick = null;
}

optionSelector.addEventListener( 'input', handleInput );
goButton.addEventListener( 'click', handleGo );
goButton.addEventListener( 'touchstart', handleGo );
clearButton.addEventListener( 'click', handleClear );
clearButton.addEventListener( 'touchstart', handleClear );