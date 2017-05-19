/* global addPort */
const portEle = document.getElementById('port');

document.getElementById('add-port').addEventListener('click', () => {
  addPort(portEle.value);
});
