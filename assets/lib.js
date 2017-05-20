/* global URL */
/* global sweetAlert */
function request(api, method, body) {
  if (window.XMLHttpRequest)
    return new Promise((resolve, reject) => {
      const xhr = new window.XMLHttpRequest();
      xhr.open(method, '/api/' + api, true);
      xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
      xhr.responseType = 'json';
      xhr.onload = function() {
        if (xhr.status > 399 && xhr.status < 600)
          return reject((xhr.response.error) ? xhr.response.error : xhr.response);
        resolve(xhr.response);
      };
      xhr.onabort = xhr.onerror = function(e) {
        reject(e);
      };
      xhr.send(JSON.stringify(body));
    });
  else
    sweetAlert('Error', 'Your browser doesn\' support XMLHttpRequest. Please update your browser to latest version.', 'error');
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
      console.log(err);
      sweetAlert('Error', err.message, 'error');
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
