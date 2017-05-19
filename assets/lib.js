/* global fetch */
/* global URL */
/* global sweetAlert */
function request(api, method, body) {
  if (window.XMLHttpRequest)
    return new Promise((resolve, reject) => {
      const xhr = new window.XMLHttpRequest();
      xhr.open(method, '/api/' + api, true);
      xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
      xhr.responseType = 'json';
      xhr.onload = function(e) {
        if (xhr.status > 399 && xhr.status < 600)
          return reject(xhr.response);
        resolve(xhr.response);
      };
      xhr.onabort = xhr.onerror = function(e) {
        reject(e);
      };
      xhr.send(JSON.stringify(body));
    });
  else
    return fetch('/api/' + api, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          credentials: 'same-origin'
        },
        body: JSON.stringify(body)
      })
      .then((response) => {
        const jsonPromise = response.json();
        console.log(jsonPromise)
        if (response.ok)
          return jsonPromise;
        else
          return jsonPromise.then((json) => {
            throw json.error
          });
      });
}

function launchProject(projectName) {
  return request('launch', 'post', {
      target: projectName
    })
    .then((result) => {
      const
        hostname = new URL(document.location.href).hostname,
        port = result.succsess.data.port,
        url = `https://${hostname}:${port}/ide.html`;
      window.open(url, '_blank');
    })
    .then(() => document.location.reload())
    .catch((err) => {
      console.log(err)
      sweetAlert('Error', err.message, 'error')
    });
}

function stopProject(projectName) {
  return request('launch', 'delete', {
      target: projectName
    })
    .then(() => document.location.reload());
}

function addProject(projectName, path) {
  return request('project', 'post', {
      name: projectName,
      path: path
    })
    .then(() => document.location.reload());
}

function editProject(projectName, path) {
  return request('project', 'put', {
      name: projectName,
      path: path
    })
    .then(() => document.location.reload());
}

function removeProject(projectName) {
  return request('project', 'delete', {
      name: projectName
    })
    .then(() => document.location.reload());
}

function addPort(port) {
  return request('Port', 'post', {
      number: port
    })
    .then(() => document.location.reload());
}

function removePort(port) {
  return request('Port', 'delete', {
      number: port
    })
    .then(() => document.location.reload());
}
